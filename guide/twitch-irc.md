# TwitchIRC Node (Deprecated)

<Badge type="danger" text="Deprecated"></Badge>

**Warning:** Twitch has announced plans to deprecate and eventually remove its IRC functionality for third-party developers. 
It is strongly recommended to use the modern EventSub-based solutions like `TwitchChat` (for sending/receiving messages) 
and `TwitchEventListener` (for other events like follows, subs, etc.) instead of `TwitchIRC` for new projects or 
when updating existing ones. Relying on `TwitchIRC` may lead to broken functionality in the future.

`TwitchIRC` provides connectivity to Twitch's chat servers using the traditional IRC protocol over WebSockets. 
It allows sending messages and receiving a wide range of IRC events.

## Overview

This node manages the WebSocket connection to Twitch IRC, handles the `PASS`/`NICK`/`CAP` handshake for authentication 
and capability negotiation, and processes incoming IRC messages. It parses standard IRC commands and associated 
Twitch-specific tags, emitting distinct signals for different events like:

*   Chat messages (`PRIVMSG`)
*   Whispers (`WHISPER`)
*   Channel state changes (`ROOMSTATE`)
*   User state updates (`USERSTATE`, `GLOBALUSERSTATE`)
*   Moderation actions (`CLEARCHAT`, `CLEARMSG`)
*   Notices from the server (`NOTICE`)
*   Connection status changes

It also includes a message queue and delay mechanism to adhere to Twitch's IRC rate limits when sending messages.

## Prerequisites

1.  **Add the Node:** Add a `TwitchIRC` node to your scene, typically as a child of `TwitchService` or as a standalone manager if not using the service node.
2.  **Dependencies:** Assign the required resources in the Inspector:
    *   `Setting`: A `TwitchIrcSetting` resource containing connection details (server URL, username, capabilities) and optionally auto-join channels.
    *   `Token`: An `OAuthToken` resource holding the valid access token needed for authentication. The token must have the necessary chat scopes (e.g., `chat:read`, `chat:edit`).

## Configuration (Inspector Properties)

*   **`Setting` (`TwitchIrcSetting`)**: **Required.** Contains configuration for the IRC connection, including the server URL, bot username, requested IRC capabilities, and optionally channels to join automatically on connection.
*   **`Token` (`OAuthToken`)**: **Required.** The OAuth token resource providing the access token for IRC authentication.
*   **`Irc Send Message Delay` (`int`)**: The minimum delay (in milliseconds) between sending messages to adhere to Twitch rate limits. Defaults to 360ms.

## Signals

This node emits various signals corresponding to different IRC events:

**Connection & State:**

*   `connection_opened`: Emitted after the WebSocket connection is established and authentication handshake begins.
*   `connection_closed`: Emitted when the WebSocket connection is closed (either intentionally or unexpectedly).
*   `received_reconnect`: Emitted when Twitch sends a `RECONNECT` command, indicating an impending server restart.
*   `received_global_userstate(tags: TwitchTags.GlobalUserState)`: Emitted once after successful authentication, providing initial state for the authenticated user across Twitch.
*   `received_roomstate(channel_name: String, tags: TwitchTags.Roomstate)`: Emitted when joining a channel or when chat settings (emote-only, followers-only, etc.) change for a channel.
*   `received_userstate(channel_name: String, tags: TwitchTags.Userstate)`: Emitted when joining a channel or after sending a message, providing the user's state (badges, color) within that specific channel.

**Chat & Interaction:**

*   `received_privmsg(channel_name: String, username: String, message: String, tags: TwitchTags.PrivMsg)`: Emitted when a standard chat message is received in a joined channel.
*   `received_whisper(from_user: String, to_user: String, message: String, tags: TwitchTags.Whisper)`: Emitted when a whisper message is sent directly to the authenticated bot user.
*   `received_usernotice(channel_name: String, message: String, tags: TwitchTags.Usernotice)`: Emitted for special user events announced in chat, such as subscriptions, raids, rituals (e.g., first-time chatter).

**Moderation:**

*   `received_clearchat(channel_name: String, banned_or_timeout_user: String, tags: TwitchTags.ClearChat)`: Emitted when chat is cleared entirely or a specific user's messages are purged (timeout/ban). `banned_or_timeout_user` is empty if the whole chat was cleared.
*   `received_clearmsg(channel_name: String, chat_message_removed: String, tags: TwitchTags.ClearMsg)`: Emitted when a single message is deleted by a moderator.

**Server Notices & Errors:**

*   `received_notice(channel_name: String, message: String, tags: TwitchTags.Notice, handled: bool)`: Emitted for general notices from the Twitch server (e.g., "Slow mode is on"). `handled` indicates if the addon potentially processed this notice internally (like for authentication failures).
*   `unauthenticated`: Emitted if IRC login fails due to an invalid token. The connection is usually closed afterward.
*   `unauthorized`: Emitted if the token lacks the necessary permissions (scopes) to perform an action (like joining chat). The connection is usually closed afterward.

## Key Public Methods

*   **`do_setup() -> void`**
    *   Called automatically if `TwitchIRC` is a child of `TwitchService` during its setup. Initiates the connection process (`open_connection`). Should `await` if called manually.
*   **`open_connection() -> void`**
    *   Manually starts the WebSocket connection attempt to the Twitch IRC server defined in `Setting`. Handles automatic reconnection attempts if enabled. Use `await` when calling.
*   **`close_connection() -> void`**
    *   Manually closes the WebSocket connection with a specific code (1000) and disables automatic reconnection.
*   **`join_channel(channel_name: StringName) -> ChannelData`**
    *   Adds the specified channel (without `#`) to the list of channels to join. Sends the `JOIN` command via the message queue.
    *   Returns internal `ChannelData` used to track join state and associated nodes. Joining happens asynchronously in the background.
    *   You can `await channel_data.is_joined()` to wait until the `ROOMSTATE` for that channel is received, confirming the join.
*   **`leave_channel(channel_name: StringName) -> void`**
    *   Sends the `PART` command for the specified channel via the message queue and removes it from internal tracking.
*   **`chat(message: String, channel_name: StringName = &"") -> void`**
    *   Adds a `PRIVMSG` command to the outgoing message queue to send the `message` to the specified `channel_name` (without `#`).
    *   If `channel_name` is omitted and the bot is only in one channel, it defaults to that channel.
    *   Messages are sent respecting the `irc_send_message_delay`. Also emits `received_privmsg` locally for the bot's own message.
*   **`get_client() -> WebsocketClient`**
    *   Returns the underlying `WebsocketClient` instance used for the connection, allowing for advanced configuration or status checks if needed.

## Usage Example

```gdscript
extends Node

# Assuming TwitchIRC node is accessible, e.g., as a child or autoload
@onready var twitch_irc: TwitchIRC = $TwitchService/TwitchIRC # Adjust path


var target_channel = "your_channel_name" # Replace with the channel to join


func _ready():
    # Connect to desired signals
    twitch_irc.connection_opened.connect(_on_irc_connected)
    twitch_irc.received_privmsg.connect(_on_irc_message)
    twitch_irc.connection_closed.connect(_on_irc_disconnected)
    twitch_irc.unauthenticated.connect(_on_irc_auth_failed)

    # If not using TwitchService.setup(), you might need to manually start:
    await twitch_irc.open_connection()


func _on_irc_connected():
    print("IRC Connected! Joining channel: %s" % target_channel)
    # Join the channel after connection is established
    var channel_data: TwitchIRC.ChannelData = twitch_irc.join_channel(target_channel)
    # Optional: wait for the join confirmation
    await channel_data.is_joined()
    print("Successfully joined channel %s" % target_channel)
    # Now safe to send messages
    twitch_irc.chat("Hello from Godot IRC!", target_channel)


func _on_irc_message(channel_name: String, username: String, message: String, tags: TwitchTags.PrivMsg):
    print("[%s] %s: %s" % [channel_name, username, message])
    # Example: Respond to "!ping" but better use TwitchCommand
    if message.strip_edges().to_lower() == "!ping":
        twitch_irc.chat("Pong!", channel_name)


func _on_irc_disconnected():
    printerr("IRC Disconnected!")
    # Handle reconnection logic if needed and if auto_reconnect wasn't intended/sufficient


func _on_irc_auth_failed():
    printerr("IRC Authentication Failed! Check your OAuth token and scopes.")
    # Update UI, prompt user to re-authenticate, etc.


func _notification(what):
    # Ensure clean disconnection on game exit
    if what == NOTIFICATION_WM_CLOSE_REQUEST:
        if twitch_irc and not twitch_irc.get_client().is_closed:
            twitch_irc.close_connection()
```