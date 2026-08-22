# TwitchIrcChannel Node (Deprecated)

<Badge type="danger" text="Deprecated"></Badge>

**Warning:** This node relies entirely on the `TwitchIRC` system, which Twitch plans to deprecate and remove.
**Avoid using `TwitchIrcChannel` for new development.** Migrate existing usage to EventSub-based solutions like 
`TwitchChat` and `TwitchEventListener`. Using this node may result in broken functionality in the future.

The `TwitchIrcChannel` node provides a focused way to interact with a single, specific Twitch channel when using the
underlying `TwitchIRC` connection manager. It's primarily intended for scenarios where your application needs to connect 
to and manage multiple Twitch channels concurrently.

::: warning Not available in C#
[TwitcherSharp](https://github.com/Temptica/TwitcherSharp) does not wrap `TwitchIrcChannel`, for the same reason it doesn't wrap `TwitchIRC`; see the note on the [TwitchIRC](/core-nodes/twitch-irc) page. Use `TwitchChat` and `TwitchEventListener` instead.
:::

## Overview

While the main `TwitchIRC` node handles the overall connection and receives events for *all* joined channels, 
`TwitchIrcChannel` acts as a filter and interface for just *one* of those channels.

When added to the scene and configured with a `channel_name`:
1.  It finds the main `TwitchIRC` instance (via the assigned `TwitchService`).
2.  It registers itself with the `TwitchIRC` node using `irc.add_channel(self)`. This tells the `TwitchIRC` node to potentially JOIN this channel if it hasn't already.
3.  It listens to the global signals from `TwitchIRC` (`received_privmsg`, `received_roomstate`, `received_userstate`).
4.  When an event arrives from `TwitchIRC`, this node checks if the event's channel matches its own `channel_name`.
5.  If the channel matches, it emits its own, more specific signal (e.g., `message_received` instead of `received_privmsg`).
6.  It provides a `chat()` method that automatically targets its specific channel.
7.  It tracks whether the `ROOMSTATE` for its channel has been received, indicating a successful join (`joined` property, `has_joined` signal).

## Prerequisites

1.  **Functional `TwitchIRC`:** You must have a correctly configured and connected `TwitchIRC` node available, typically managed via a parent `TwitchService` node.
2.  **Add the Node:** Add a `TwitchIrcChannel` node to your scene.
3.  **Assign Dependencies:**
    *   `Twitch Service`: Assign the parent `TwitchService` instance that contains the active `TwitchIRC` node.
    *   `Channel Name`: **Crucially**, set this property in the Inspector to the name of the Twitch channel (e.g., "your_channel_name", without `#`) that this node should represent.

## Configuration (Inspector Properties)

*   **`Twitch Service` (`TwitchService`)**: **Required.** A reference to the `TwitchService` node that holds the active `TwitchIRC` instance.
*   **`Channel Name` (`StringName`)**: **Required.** The login name of the Twitch channel this node instance will manage 
    and filter events for (e.g., "kani_dev"). Setting this property triggers registration with the parent `TwitchIRC`.

## Signals

These signals are emitted only for events related to this node's specific `channel_name`:

*   **`message_received(from_user: String, message: String, tags: TwitchTags.Message)`**
    *   Emitted when a `PRIVMSG` arrives from the parent `TwitchIRC` that matches this node's `channel_name`.
    *   `tags`: A processed `TwitchTags.Message` object, which attempts to load emote/badge sprites using the `TwitchService`'s `TwitchMediaLoader`.
*   **`user_state_received(tags: TwitchTags.Userstate)`**
    *   Emitted when a `USERSTATE` message arrives from `TwitchIRC` for this channel, providing the bot's current state (badges, color, etc.) in this specific channel.
*   **`room_state_received(tags: TwitchTags.Roomstate)`**
    *   Emitted when a `ROOMSTATE` message arrives from `TwitchIRC` for this channel, indicating current chat settings (emote-only, etc.). This signal also triggers the `has_joined` signal the first time it's received.
*   **`has_joined()`**
    *   Emitted once when the `ROOMSTATE` for this channel is first received, indicating the bot has successfully joined and received initial state information.
*   **`has_left()`**
    *   Emitted when the node is notified of leaving the channel (typically when removed from the scene tree or when `irc.leave_channel` is called).

## Methods

*   **`chat(message: String) -> void`**
    *   Sends a chat message specifically to this node's `channel_name` via the parent `TwitchIRC` node's `chat` method.
    *   It implicitly waits (`await is_joined()`) until the `has_joined` signal has been emitted before attempting to send the message, ensuring the bot is actually in the channel.
*   **`is_joined() -> void`**
    *   An asynchronous utility function. If the channel hasn't received its initial `ROOMSTATE` yet (`joined` is false), it waits for the `has_joined` signal to be emitted. Useful for ensuring actions are only taken after joining is confirmed. Use `await` when calling.
*   **`leave() -> void`**
    *   Internal method called when the channel is being parted from. It resets the internal `joined` state and emits the `has_left` signal. Usually triggered automatically when the node exits the tree or `irc.remove_channel(self)` is called.

## Usage Example

Scenario: Connecting to two channels ("channel_one", "channel_two") and handling their chat separately.

1.  Set up `TwitchService` with `TwitchIRC` as usual.
2.  Add two `TwitchIrcChannel` nodes as children (e.g., `IrcChannelOne`, `IrcChannelTwo`).
3.  In the Inspector for `IrcChannelOne`:
    *   Assign the `TwitchService` node to the `Twitch Service` property.
    *   Set `Channel Name` to `"channel_one"`.
4.  In the Inspector for `IrcChannelTwo`:
    *   Assign the `TwitchService` node to the `Twitch Service` property.
    *   Set `Channel Name` to `"channel_two"`.

```gdscript
extends Node

# References to the specific channel nodes
@onready var channel_one_handler: TwitchIrcChannel = $IrcChannelOne
@onready var channel_two_handler: TwitchIrcChannel = $IrcChannelTwo


func _ready() -> void:
    # Ensure TwitchService (and thus TwitchIRC) is set up first
    # await TwitchService.instance.setup() # Assuming TwitchService is already in the node tree

    channel_one_handler.message_received.connect(_on_channel_one_message)
    channel_one_handler.has_joined.connect(_on_channel_joined.bind(&"Channel One"))
    channel_two_handler.message_received.connect(_on_channel_two_message)
    channel_two_handler.has_joined.connect(_on_channel_joined.bind(&"Channel Two"))
    
    
func _on_channel_joined(channel_identifier: StringName) -> void:
    print("%s successfully joined!" % channel_identifier)
    # Maybe send a welcome message after joining
    if channel_identifier == &"Channel One":
        channel_one_handler.chat("Bot connected to Channel One!")
    elif channel_identifier == &"Channel Two":
        channel_two_handler.chat("Bot connected to Channel Two!")


func _on_channel_one_message(from_user: String, message: String, tags: TwitchTags.Message) -> void:
    print("[Channel One] %s: %s" % [from_user, message])
    # Handle message specific to channel one


func _on_channel_two_message(from_user: String, message: String, tags: TwitchTags.Message) -> void:
    print("[Channel Two] %s: %s" % [from_user, message])
    # Handle message specific to channel two
```