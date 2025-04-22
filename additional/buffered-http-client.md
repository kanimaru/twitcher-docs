# BufferedHTTPClient Node

The `BufferedHTTPClient` node provides a managed way to execute HTTP requests sequentially using Godot's built-in `HTTPRequest` 
nodes. It simplifies handling asynchronous responses and includes basic retry capabilities for connection issues.

## Overview

This node acts as a wrapper and manager for individual `HTTPRequest` nodes. Instead of creating and managing `HTTPRequest` 
nodes directly for each request, you use the `BufferedHTTPClient`. Its key features are:

1.  **Request Queuing (Implicit):** While it doesn't maintain an explicit *processing* queue in the code shown, 
    the `wait_for_request` mechanism effectively allows you to manage multiple requests sequentially by waiting for each 
    one to complete before proceeding. It handles the creation and management of underlying `HTTPRequest` nodes per request.
2.  **Simplified Request Initiation:** The `request()` method provides a straightforward way to initiate GET, POST, PUT, etc., requests with custom headers and bodies.
3.  **Asynchronous Response Handling:** The core utility comes from the `wait_for_request()` method, which allows your script to `await` the completion of a *specific* request initiated earlier.
4.  **Automatic Retries:** Includes built-in retry logic with exponential backoff specifically for 
    `HTTPRequest.Result.RESULT_CONNECTION_ERROR` and `RESULT_TLS_HANDSHAKE_ERROR`, attempting the connection again 
    after increasing delays. The maximum number of retries is configurable.
5.  **Structured Data:** Uses internal `RequestData` and `ResponseData` classes to encapsulate request parameters and response results neatly.
6.  **Custom Headers:** Allows defining default headers that are automatically added to every request.

It leverages `HTTPRequest`'s `use_threads = true` setting, meaning the actual network I/O for each request happens on a separate thread, but the client manages the initiation and response handling in a structured way.

## Prerequisites

1.  **Add the Node:** Add a `BufferedHTTPClient` node to your scene tree.

## Configuration (Inspector Properties)

These properties can be configured in the Godot Editor Inspector:

*   **`Max Error Count` (`int`)**: Controls the maximum number of automatic retry attempts when a request fails specifically due to `RESULT_CONNECTION_ERROR` or `RESULT_TLS_HANDSHAKE_ERROR`.
    *   Default: `-1` (indicates an infinite number of retries for these specific errors). Set to `0` to disable retries, or a positive integer for a specific limit.
*   **`Custom Header` (`Dictionary[String, String]`)**: A dictionary defining default headers that will be automatically merged into the `headers` dictionary for *every* request made through this client.
    *   Default: `{ "Accept": "*/*" }`
    *   Headers provided directly to the `request()` method will override any default headers with the same key.

## Signals

*   **`request_added(request: RequestData)`**
    *   Emitted immediately after the `request()` method is called and a new request task has been created and added internally.
    *   `request`: The `RequestData` object representing the newly added request.
*   **`request_done(response: ResponseData)`**
    *   Emitted when an underlying `HTTPRequest` completes, regardless of success or failure. This signal is crucial for the `wait_for_request()` mechanism.
    *   `response`: The `ResponseData` object containing the results (status code, headers, body, original request info) of the completed request.

## Internal Classes

These classes are used publicly in signals and methods:

*   **`RequestData`**: Holds information about a single request before it's completed.
    *   `client`: Reference to the `BufferedHTTPClient` instance.
    *   `http_request`: The internal `HTTPRequest` node handling this specific request.
    *   `path`: The URL being requested.
    *   `method`: The HTTP method used (e.g., `HTTPClient.METHOD_GET`).
    *   `headers`: Dictionary of request headers.
    *   `body`: The request body string.
    *   `retry`: Internal counter for connection error retries.
*   **`ResponseData`**: Holds information about a completed request.
    *   `result`: The result code from `HTTPRequest.Result` enum.
    *   `response_code`: The HTTP status code (e.g., 200, 404).
    *   `request_data`: The original `RequestData` object for this response.
    *   `response_data`: The response body as a `PackedByteArray`.
    *   `response_header`: Dictionary of response headers.
    *   `error`: A boolean flag set to `true` if the `result` was not `HTTPRequest.Result.RESULT_SUCCESS`.

## Key Public Methods

*   **`request(path: String, method: int, headers: Dictionary, body: String) -> RequestData`**
    *   Initiates a new HTTP request.
    *   `path`: The full URL to request.
    *   `method`: The HTTP method constant (e.g., `HTTPClient.METHOD_GET`, `HTTPClient.METHOD_POST`).
    *   `headers`: A Dictionary of request headers. Custom headers defined in `custom_header` property are automatically merged.
    *   `body`: The string content for the request body (e.g., for POST requests).
    *   Creates an internal `HTTPRequest` node, starts the request, and adds it to internal tracking.
    *   **Returns:** A `RequestData` object representing this specific request. This object is needed for `wait_for_request()`.
*   **`wait_for_request(request_data: RequestData) -> ResponseData`**
    *   Asynchronously waits for the specific request identified by `request_data` (the object returned by `request()`) to complete.
    *   **Must be called with `await`.**
    *   It listens for the `request_done` signal internally. If the response for the given `request_data` has already 
        arrived and is cached internally, it returns immediately. Otherwise, it pauses execution until the correct `request_done` signal is received.
    *   **Returns:** The `ResponseData` object containing the result of the specified request.

## Usage Example

```gdscript
extends Node

# Assuming the node is added in the scene and accessible
@onready var http_client: BufferedHTTPClient = $BufferedHTTPClient

func _ready():
    # Example: Make a GET request and wait for the response
    make_get_request("https://httpbin.org/get")

    # Example: Make a POST request
    make_post_request("https://httpbin.org/post", {"Content-Type": "application/json"}, '{"name": "Godot", "value": 42}')

func make_get_request(url: String):
    print("Making GET request to: %s" % url)
    # 1. Initiate the request
    var request_info: BufferedHTTPClient.RequestData = http_client.request(
        url,
        HTTPClient.METHOD_GET,
        {}, # No extra headers
        ""  # No body for GET
    )

    # 2. Wait for this specific request to complete
    print("Waiting for response...")
    var response_info: BufferedHTTPClient.ResponseData = await http_client.wait_for_request(request_info)
    print("Response received!")

    # 3. Process the response
    if response_info.result == HTTPRequest.Result.RESULT_SUCCESS:
        print("  Status Code: %d" % response_info.response_code)
        # Convert body (PackedByteArray) to string for printing
        var response_body_string = response_info.response_data.get_string_from_utf8()
        print("  Body: %s" % response_body_string)
        # You might parse JSON here if applicable: JSON.parse_string(response_body_string)
    else:
        printerr("  Request failed! Result code: %d" % response_info.result)
        printerr("  Response code: %d" % response_info.response_code)

func make_post_request(url: String, headers: Dictionary, body: String):
    print("Making POST request to: %s" % url)
    # 1. Initiate the request
    var request_info: BufferedHTTPClient.RequestData = http_client.request(
        url,
        HTTPClient.METHOD_POST,
        headers,
        body
    )

    # 2. Wait for this specific request to complete
    print("Waiting for POST response...")
    var response_info: BufferedHTTPClient.ResponseData = await http_client.wait_for_request(request_info)
    print("POST Response received!")

    # 3. Process the response (similar to GET example)
    if response_info.result == HTTPRequest.Result.RESULT_SUCCESS:
        print("  Status Code: %d" % response_info.response_code)
        var response_body_string = response_info.response_data.get_string_from_utf8()
        print("  Body: %s" % response_body_string)
    else:
        printerr("  POST Request failed! Result code: %d" % response_info.result)
        printerr("  Response code: %d" % response_info.response_code)
```