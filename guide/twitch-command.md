# TwitchCommand Node

The `TwitchCommand` node is designed to define and handle a specific chat command within your Godot application. 
It simplifies parsing messages, checking permissions, and validating arguments for commands.

## Overview

Each `TwitchCommand` node typically represents one command (e.g., `!sayhi`). 
You configure its name, aliases, required permissions, argument rules, and where it should listen (chat/whispers). 
It relies on an associated `TwitchEventsub` node to receive the raw message events from Twitch.

When a message arrives that matches the command's trigger (prefix + name/alias), the node automatically performs several checks:
1. **Prefix:** Does the message start with a known prefix (e.g., `!`)?
2. **Name/Alias:** Does the first word match the `command` name or any of its `aliases`?
3. **Allowed Users:** Checks that only `allowed_users` can use this command
4. **Allowed Chatrooms** Checks that only commands within the chat rooms can be used `listen_to_chatrooms` 
5. **Where:** Was the command used in an allowed location (Chat/Whisper based on `where` flag)?
6. **Permissions:** Does the user have the required `permission_level` (VIP, Sub, Mod, Streamer)?
7. **Arguments:** Does the number of provided arguments fall within the `args_min` and `args_max` range?

Based on these checks, it emits either the `command_received` or `received_invalid_command` signal.

## Prerequisites

1.  **Add the Node:** Add one or more `TwitchCommand` nodes to your scene. They are often managed as children of a central node (like `TwitchService` or a dedicated command handler node).
2.  **EventSub Dependency:** Assign a configured `TwitchEventsub` instance to the `Eventsub` property of the `TwitchCommand` node in the Inspector. This is how the node receives messages to process. When you just have one `TwitchEventsub` in your scene it will assign it automatically.

## Configuration (Inspector Properties)

These properties define the behavior and rules for the command:

*   **`Command` (`String`)**: **Required.** The primary name of the command (e.g., "lurk", "hello"). Users trigger it by typing a prefix (like `!`) followed by this name.
*   **`Aliases` (`Array[String]`)**: *Optional.* A list of alternative names for this command (e.g., ["hi", "hey"] for a "hello" command).
*   **`Description` (`String`, multiline)**: *Optional.* A user-facing description of what the command does. Useful for help commands or documentation.
*   **`Args Min` (`int`)**: The minimum number of arguments required after the command name. `0` means no arguments are needed.
*   **`Args Max` (`int`)**: The maximum number of arguments allowed. `-1` means there is no upper limit (infinite arguments).
*   **`Permission Level` (`PermissionFlag`)**: The minimum permission level required to execute the command. Uses bit flags, allowing combinations.
    *   `EVERYONE`: No specific permission needed.
    *   `VIP`: User must be a VIP.
    *   `SUB`: User must be a Subscriber.
    *   `MOD`: User must be a Moderator.
    *   `STREAMER`: User must be the Broadcaster.
    *   `MOD_STREAMER`: User must be a Mod OR the Streamer.
    *   `NON_REGULAR`: Allows anyone *except* regular viewers (effectively VIP, Sub, Mod, Streamer).
    *   **Note:** These are bit flags, so you can combine permissions if needed, though the predefined ones cover common cases.
*   **`Where` (`WhereFlag`)**: Specifies where the command can be triggered.
    *   `CHAT`: Only in regular channel chat messages.
    *   `WHISPER`: Only in whisper messages (requires `user_whisper_message` EventSub subscription).
    *   `ANYWHERE`: Can be triggered in both chat and whispers.
*   **`Allowed Users` (`Array[String]`)**: *Optional.* If non-empty, only usernames listed in this array can execute the command.
*   **`Listen To Chatrooms` (`Array[String]`)**: *Optional.* If non-empty, the command only respond if the message originated from one of the specified chatrooms (broadcaster usernames). *Note: Ensure the connected EventSub is receiving messages from these chatrooms.*
*   **`Eventsub` (`TwitchEventsub`)**: **Required.** The `TwitchEventsub` instance that will provide the chat/whisper events for this command to process. When you have only one Eventsub node, it will be automatically assigned.

## Signals

*   **`command_received(from_username: String, info: TwitchCommandInfo, args: PackedStringArray)`**
    *   Emitted when a message successfully matches the command name/alias and passes all validation checks (permissions, args, where, allowed users).
    *   `from_username`: The Twitch username (login name) of the user who sent the command.
    *   `info`: A `TwitchCommandInfo` object containing contextual details (like the original message data, target channel, etc.).
    *   `args`: A `PackedStringArray` containing the arguments provided after the command name.

*   **`received_invalid_command(from_username: String, info: TwitchCommandInfo, args: PackedStringArray)`**
    *   Emitted when a message matches the command name/alias but fails one of the validation checks (e.g., insufficient permissions, incorrect number of arguments).
    *   Parameters are the same as `command_received`. Useful for providing feedback to the user about why the command failed.

## Methods

*   **`add_alias(alias: String) -> void`**
    *   Programmatically adds a new alias (alternative name) to the command's `aliases` list.

*   **`static create(eventsub: TwitchEventsub, cmd_name: String, callable: Callable, min_args: int = 0, max_args: int = 0, permission_level: int = PermissionFlag.EVERYONE, where: int = WhereFlag.CHAT, allowed_users: Array[String] = [], listen_to_chatrooms: Array[String] = []) -> TwitchCommand`**
    *   A static factory function to create and configure a `TwitchCommand` node entirely via code.
    *   `eventsub`: The `TwitchEventsub` node to use.
    *   `cmd_name`: The main command name.
    *   `callable`: The `Callable` (function reference) to connect to the `command_received` signal.
    *   Other parameters correspond to the exported properties (`args_min`, `args_max`, `permission_level`, `where`, `allowed_users`, `listen_to_chatrooms`).
    *   Returns the newly created and configured `TwitchCommand` instance. You still need to add this instance to the scene tree (`add_child()`) for it to become active.

## Usage Example

```gdscript
extends Node

# Assuming you have TwitchCommand nodes as children, or you create them dynamically

@onready var twitch_chat: TwitchChat = %TwitchChat
@onready var command_hello: TwitchCommand = $HelloCommand # Configured in Inspector
@onready var command_say: TwitchCommand = $SayCommand     # Configured in Inspector

# Or create dynamically:
# var command_lurk: TwitchCommand

func _ready():
    command_hello.command_received.connect(_on_hello_received)
    command_say.command_received.connect(_on_say_received)
    command_say.received_invalid_command.connect(_on_say_invalid)

    # --- Setup for dynamically created node ---
    # var eventsub_node = TwitchEventsub.instance # Get your EventSub instance
    # if eventsub_node:
    #    command_lurk = TwitchCommand.create(eventsub_node, "lurk", _on_lurk_received)
    #    add_child(command_lurk) # IMPORTANT: Add to tree to activate
    # else:
    #    printerr("Cannot create !lurk command, EventSub instance not found.")


func _on_hello_received(from_username: String, info: TwitchCommandInfo, args: PackedStringArray):
    print("%s said hello!" % from_username)
    twitch_chat.send_message("Hi there, %s!" % from_username)


func _on_say_received(from_username: String, info: TwitchCommandInfo, args: PackedStringArray):
    # !say command likely requires arguments (configured with args_min=1)
    var message_to_say = " ".join(args) # Join all arguments into a single string
    print("%s wants me to say: %s" % [from_username, message_to_say])
    twitch_chat.send_message(message_to_say)


func _on_say_invalid(from_username: String, info: TwitchCommandInfo, args: PackedStringArray):
    print("User %s tried to use !say incorrectly." % from_username)
    twitch_chat.send_message("@%s, the !say command needs something to say after it!" % from_username)


func _on_lurk_received(from_username: String, info: TwitchCommandInfo, args: PackedStringArray):
    twitch_chat.send_message("%s is now lurking." % from_username)
```