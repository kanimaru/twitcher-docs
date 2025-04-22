# Additional Helper Nodes

## WebsocketClient

`WebsocketClient` is an advanced WebSocket client node built upon Godot's `WebSocketPeer`. 
Its primary feature is robust automatic reconnection with exponential backoff, attempting to re-establish a connection
if it drops unexpectedly (when auto_reconnect is enabled). It simplifies managing the WebSocket lifecycle (connecting, closing), 
sending text messages, and reacting to connection state changes and received messages via signals.

## BufferedHTTPClient 

`BufferedHTTPClient` is a helper node designed to simplify making HTTP requests using Godot's underlying `HTTPRequest` node. 
It manages requests sequentially, processing them one after the other. It provides a simple interface to queue requests 
(`request` method) and a convenient way to asynchronously wait for a specific request's completion (`wait_for_request` method). 
It also includes basic automatic retry logic with exponential backoff for connection errors.