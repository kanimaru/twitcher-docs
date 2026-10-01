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

## Logger

Twitcher includes a built-in logging system with two jobs: filtered, colored console output per component while you
develop, and a log file (`user://logs/twitcher.log`) written out of the box, so players can send it in when something
goes wrong. On headless servers it also prints JSON Lines to stdout. See [Logger](/additional/logger).

## Logfami

Logfami is the standalone structured logging library behind Twitcher's log file. It routes records through pipelines
with their own filter, redaction, format (text, JSON Lines, logfmt) and destination (rolling file, stdout, memory).
It doesn't depend on Twitcher, so you can use it for your own game's logs too. See [Logfami](/additional/logfami).

# SpriteFrameEffect for RichTextLabel

The `SpriteFrameEffect` provides a custom BBCode tag for `RichTextLabel` nodes,
allowing you to embed and display **animated `SpriteFrames` resources** directly within your rich text.
This effect was created to offer a robust alternative to Godot's deprecated `AnimatedTexture`,
specifically for use within `RichTextLabel`.