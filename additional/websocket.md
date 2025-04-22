# WebsocketClient Node

The `WebsocketClient` node provides a higher-level interface for interacting with WebSocket servers, 
building upon Godot's built-in `WebSocketPeer`. Its main enhancement is the addition of automatic reconnection logic with exponential backoff.

## Overview

This node wraps a `WebSocketPeer` instance and manages its connection lifecycle. Key features include:

1.  **Connection Management:** Handles connecting to a specified `connection_url`.
2.  **Automatic Reconnection:** If the `auto_reconnect` property is `true`, the client will automatically attempt to 
    reconnect if the connection is closed unexpectedly. It uses an exponential backoff strategy (increasing delays between attempts) 
    managed by the internal `_tries` counter to avoid spamming connection requests.
3.  **State Tracking:** Monitors the underlying `WebSocketPeer.State` and emits signals when the state changes, 
    particularly on connection establishment and closure.
4.  **Message Handling:** Receives incoming WebSocket messages and emits them as raw `PackedByteArray` via the `message_received` signal.
5.  **Sending:** Provides a simple method (`send_text`) for sending string data over the connection.

The client performs its checks and connection attempts within the `_process` loop by calling its internal `_poll` method.

## Prerequisites

1.  **Add the Node:** Add a `WebsocketClient` node to your scene tree.

## Configuration (Inspector Properties)

*   **`Connection Url` (`String`)**: **Required.** The full URL of the WebSocket server to connect to (e.g., "wss://yourserver.com/socket"). The client will not attempt to connect if this is empty.
*   **`Auto Reconnect` (`bool`)**: If `true`, the client will automatically attempt to reconnect after a connection loss, 
    using exponential backoff. If `false`, it will remain closed until `open_connection()` is called again. *Setting this property directly can influence connection behavior.*

## Signals

*   **`connection_established`**
    *   Emitted when the WebSocket connection state transitions to `WebSocketPeer.STATE_OPEN`. This signifies that the client is ready to send and receive data.
*   **`connection_closed`**
    *   Emitted when the WebSocket connection state transitions to `WebSocketPeer.STATE_CLOSED`, either intentionally via `close()` or due to network issues/server disconnection.
*   **`message_received(message: PackedByteArray)`**
    *   Emitted when a complete WebSocket message packet is received from the server.
    *   `message`: The raw data received as a `PackedByteArray`. You will likely need to convert this (e.g., using `message.get_string_from_utf8()`) depending on the expected data format.
*   **`connection_state_changed(state: WebSocketPeer.State)`**
    *   Emitted whenever the underlying `WebSocketPeer`'s ready state changes.
    *   `state`: The new `WebSocketPeer.State` enum value (e.g., `STATE_CONNECTING`, `STATE_OPEN`, `STATE_CLOSING`, `STATE_CLOSED`).

## Key Public Methods

*   **`open_connection() -> void`**
    *   Manually initiates the connection process. Sets `auto_reconnect` to `true` and begins attempts to establish a connection (using `_establish_connection` internally, which includes delays).
    *   **Note:** This method triggers an asynchronous process. Use `await wait_connection_established()` or the `connection_established` signal to know when the connection is actually open.
*   **`wait_connection_established() -> void`**
    *   An asynchronous utility function. If the connection is not currently open (`is_open` is false), it waits until the `connection_established` signal is emitted. Use `await` when calling this to pause execution until connected.
*   **`send_text(message: String) -> Error`**
    *   Sends the provided `message` string as a text frame over the WebSocket connection.
*   **`close(status: int = 1000, message: String = "Normal Closure") -> void`**
    *   Manually closes the WebSocket connection with the specified status code and reason message.
    *   **Important:** Calling this method also sets `auto_reconnect` to `false`, preventing automatic reconnection attempts after this intentional closure.

## Properties (Read-Only Access)

*   **`connection_state` (`WebSocketPeer.State`)**: Returns the current ready state of the underlying `WebSocketPeer`.
*   **`is_open` (`bool`)**: Returns `true` if `connection_state` is `WebSocketPeer.STATE_OPEN`, `false` otherwise.
*   **`is_closed` (`bool`)**: Returns `true` if `connection_state` is `WebSocketPeer.STATE_CLOSED`, `false` otherwise.

## Usage Example

```gdscript
extends Node

@onready var ws_client: WebsocketClient = $WebsocketClient # Assume added in scene


func _ready():
    # Configure the client (alternatively, set these in the Inspector)
    ws_client.connection_url = "wss://your-websocket-server.com"

    # Connect signals
    ws_client.connection_established.connect(_on_ws_connected)
    ws_client.connection_closed.connect(_on_ws_disconnected)
    ws_client.message_received.connect(_on_ws_message)
    ws_client.connection_state_changed.connect(_on_ws_state_changed)

    print("Attempting to open WebSocket connection...")
    # Start the connection process (it runs asynchronously)
    ws_client.open_connection()


func _on_ws_connected():
    print("WebSocket Connected!")
    # Now it's safe to send messages
    ws_client.send_text("Hello from Godot WebsocketClient!")


func _on_ws_disconnected():
    print("WebSocket Disconnected!")
    # UI can be updated here. If auto_reconnect is true, it will try connecting again.


func _on_ws_message(message_bytes: PackedByteArray):
    var message_string := message_bytes.get_string_from_utf8()
    print("WebSocket Message Received: %s" % message_string)
    # Process the received message


func _on_ws_state_changed(new_state: WebSocketPeer.State):
    print("WebSocket State Changed: %s" % new_state) # Print state name


# Example: Send data on button press (ensure connection is open)
func _send_test_message():
    if ws_client.is_open:
        ws_client.send_text("Button was pressed!")
    else:
        print("Cannot send message, WebSocket is not open.")
        

# Ensure clean disconnect when closing the game
func _notification(what):
    if what == NOTIFICATION_WM_CLOSE_REQUEST:
        if ws_client and not ws_client.is_closed:
            print("Closing WebSocket connection on exit...")
            ws_client.close(1000, "Client exiting")
```