# TwitchAPI Node

`TwitchAPI` serves as the primary interface for interacting with the Twitch Helix REST API endpoints.
It manages authentication by adding the necessary `Authorization` (Bearer token) and `Client-ID` headers to requests,
using configured `OAuthToken` and `OAuthSetting` resources. It uses an internal `BufferedHTTPClient` for request
execution and includes logic to automatically handle token refresh attempts upon receiving authentication errors
(403 Forbidden) and signals potential scope issues (401 Unauthorized).
While it offers a core `request` method for direct API calls,
the full class contains all the wrapper methods for specific Twitch API endpoints
(e.g., getting user data, sending chat messages).

This one is fully generated and the code
to regenerate the API is located in `TwitchAPIParser` and `TwitchAPIGenerator`. Because Twitch is not officially hosting
a proper Swagger, Twitcher uses the work of https://twitch-api-swagger.surge.sh/ credits goes to
[DmitryScaletta](https://github.com/DmitryScaletta) for his awesome work to provide this technical documentation of
the Twitch API.

## Overview

This node acts as a gateway to the Twitch API. Its main responsibilities include:

1. **Authentication Handling:** Automatically adds the required `Authorization: Bearer <access_token>` and `Client-ID: <your_client_id>` headers to every outgoing request, using the assigned `OAuthToken` and `OAuthSetting` resources.
2. **Request Execution:** Utilizes an internal `BufferedHTTPClient` instance to manage and execute HTTP requests to the Twitch API base URL (`api_host`).
3. **Automatic Token Refresh (Retry):** Intercepts `403 Forbidden` responses (often indicating an expired access token), 
    emits the `unauthenticated` signal, waits for the `OAuthToken` to potentially signal successful refresh 
    (`token.authorized`), and automatically retries the request up to `MAX_AUTH_ERRORS` times.
4. **Error Signaling:** Emits signals like `unauthenticated` (on 403 errors) and `unauthorized` 
    (on 401 errors, often related to missing scopes) to notify other parts of your application.
5. **Endpoint Wrappers:** Includes many convenience methods that wrap specific Twitch API endpoints (e.g., `get_users()`, `send_chat_message()`, `create_clip()`). 
    These wrapper methods internally use the `request()` method, providing a more structured and easier-to-use interface than calling `request()` directly for every API interaction.
6. **(Optional) Request Method:** Provides a fundamental `request()` method for making calls to any arbitrary Twitch API path.

## Prerequisites

1.  **Add the Node:** Add a `TwitchAPI` node to your scene, often as a child of `TwitchService` or as an autoload/singleton.
2.  **Token Resource:** Assign a configured and valid `OAuthToken` resource to the `Token` property. This token must have the necessary scopes granted for the API calls you intend to make.
3.  **OAuth Settings Resource:** Assign a configured `OAuthSetting` resource (containing your Client ID) to the `Oauth Setting` property.

## Configuration (Inspector Properties)

*   **`Token` (`OAuthToken`)**: **Required.** The `OAuthToken` resource that provides the access token used for the `Authorization: Bearer` header. This node relies on the token resource's ability to refresh itself when needed (signaled via `token.authorized`).
*   **`Oauth Setting` (`OAuthSetting`)**: **Required.** The `OAuthSetting` resource that provides the `Client ID` used for the `Client-ID` header.
*   **`Api Host` (`String`)**: The base URL for the Twitch Helix API. Defaults to `"https://api.twitch.tv/helix"`.

## Signals

*   **`unauthenticated`**
    *   Emitted when the API returns a `403 Forbidden` status code, typically indicating the access token has expired 
        or is invalid. This triggers the node's internal retry/refresh logic. Connect to this signal if you need 
        custom logic upon token expiration detection (e.g., updating UI to show re-authentication is needed if retries fail).
*   **`unauthorized`**
    *   Emitted when the API returns a `401 Unauthorized` status code. This usually means the access token is valid 
        but lacks the required OAuth scope(s) for the requested API endpoint.

## Key Public Methods

*   **`request(path: String, method: int, body: Variant = "", content_type: String = "", error_count: int = 0) -> BufferedHTTPClient.ResponseData`**
    *   The core method for making arbitrary requests to the Twitch API. Endpoint-specific wrapper methods call this internally.
    *   `path`: The API endpoint path to append to `api_host` (e.g., `/users`, `/chat/messages`). Should start with a `/`.
    *   `method`: The HTTP method constant (e.g., `HTTPClient.METHOD_GET`, `HTTPClient.METHOD_POST`).
    *   `body`: *Optional.* The request body. If it's an object with a `to_json()` method, that method is called; otherwise, it's stringified using `JSON.stringify()`. For GET requests, this is usually empty.
    *   `content_type`: *Optional.* The `Content-Type` header value (e.g., `"application/json"`). Added automatically if `body` is provided and this is set.
    *   `error_count`: *Internal.* Used by the retry mechanism. Do not set manually.
    *   **Returns:** A `BufferedHTTPClient.ResponseData` object containing the results of the HTTP request after execution and potential retries.
    *   **Must be called with `await`.**

*   ***Other Endpoint Methods (Not Shown)***
    *   A fully implemented `TwitchAPI` node will have many other public methods corresponding to specific 
        Twitch API functions (e.g., `get_users(opt: TwitchGetUsers.Opt) -> TwitchGetUsers.Response`, `send_chat_message(body: TwitchSendChatMessage.Body) -> TwitchSendChatMessage.Response`, etc.).
    *   These methods simplify interaction by providing typed inputs and outputs and handling the call to the core `request` 
        method with the correct path, method, body, and content type. **Consult the documentation or implementation for 
        these specific wrapper methods when interacting with standard Twitch API features.**


## Usage Example (Using Wrapper Method `send_chat_message`)

This example demonstrates how to send a chat message using the dedicated `send_chat_message` wrapper method.

```gdscript
extends Node

@onready var twitch_api: TwitchAPI = $Path/To/TwitchAPI

func send_test_chat_message(message_text: String):
    # Get the authenticated user's info (requires API call itself)
    var user_response = await twitch_api.get_users(TwitchGetUsers.Opt.new()) # Assuming get_users exists
    if user_response.error or user_response.data.is_empty():
         printerr("Could not get current user info to send message.")
         return

    var current_user: TwitchUser = user_response.data
    var user_id = current_user.id

    # --- Create the request body object ---
    # Adjust instantiation if it uses a static factory method like 'create()'.
    var message_body := TwitchSendChatMessage.Body.create(user_id, user_id, message_text)
    

    # --- Call the wrapper method ---
    var send_response: TwitchSendChatMessage.Response = await twitch_api.send_chat_message(message_body)

    # --- Process the typed response ---
    # Check the structure of TwitchSendChatMessage.Response for success indicators.
    # Assuming it might have a 'data' array like other API responses.
    if send_response.response.error:
        printerr("Failed to send chat message! HTTP Error.")
        printerr("  HTTP Status Code: %d" % send_response.response.response_code)
        var error_body = send_response.response.response_data.get_string_from_utf8()
        printerr("  Error Body: %s" % error_body)
    elif send_response.data.is_empty():
        printerr("Failed to send chat message! Response data is empty (unexpected).")
    else:
        # Process the specific response data from TwitchSendChatMessage.ResponseData
        var result_data = send_response.data # Assuming 'data' is an array
        if result_data.is_sent:
            print("Chat message sent successfully!")
        else:
            # Twitch provides reasons if a message is dropped (e.g., AutoMod)
            printerr("Chat message was dropped by Twitch.")
            if result_data.has("drop_reason") and not result_data.drop_reason.is_empty():
                 printerr("  Reason Code: %s" % result_data.drop_reason.code)
                 printerr("  Reason Message: %s" % result_data.drop_reason.message)
            else:
                 printerr("  No specific drop reason provided.")


# Example of how to call this function:
# func _on_SendButton_pressed():
#     send_test_chat_message("Hello from Godot via TwitchAPI!")

    