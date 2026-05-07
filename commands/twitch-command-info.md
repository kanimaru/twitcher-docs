# TwitchCommandInfo Class

The `TwitchCommandInfo` class is a **data object** (extending `RefCounted`, not `Node`) that is passed with every
command signal (`command_received`, `invalid_permission`, etc.). It bundles together essential contextual information
about the command event, making it easier to access details about the trigger.

## Overview

You do not create `TwitchCommandInfo` objects yourself. The command system creates them for you and provides them as a
parameter in the signals. You read the properties of the received `info` object to understand the context of the
command.

## Properties

* **`command_node` (`TwitchCommandBase`)**: A direct reference to the command node instance that was triggered (e.g.,
  the specific `TwitchCommand` or `TwitchCommandRegex` node).
* **`channel_name` (`StringName`)**: The name of the channel (broadcaster's login name) where the command was triggered.
* **`username` (`StringName`)**: The login name of the user who triggered the command.
* **`original_message` (`Variant`)**: The original, unprocessed data object for the message.
    * For chat messages from EventSub, this will typically be a `TwitchChatMessage` object.
    * For whispers, this may be a `Dictionary` containing the raw whisper event data.
    * This is useful for accessing low-level details like badges, message ID for replies, etc.
* **`text_message` (`String`)**: The raw text content of the message that triggered the command (e.g., `"!dice 20"`).
* **`arguments` (`PackedStringArray`)**: The arguments extracted from the message by the specific command node.
    * For `TwitchCommand`: Words after the command name.
    * For `TwitchCommandRegex`: The capture groups from the regex match.
    * For `TwitchCommandContains`: The keywords from the `contains` list that were found.

## Usage Example

This example shows how to use the `info` object within a signal callback.

```gdscript
extends Node

@onready var dice_command: TwitchCommand = $DiceCommand

func _ready():
    # Connect to any command signal, they all provide the 'info' object
    dice_command.command_received.connect(_on_any_command)
    dice_command.invalid_permission.connect(_on_any_command)
    dice_command.cooldown.connect(_on_any_command)

# A generic callback to demonstrate using the 'info' object
func _on_any_command(from_username: String, info: TwitchCommandInfo, args: PackedStringArray):
    # Access basic information
    print("--- Command Event Received ---")
    print("Triggered by user: %s" % info.username)
    print("In channel: %s" % info.channel_name)
    print("Full message text: '%s'" % info.text_message)

    # Access the node that was triggered
    print("Command node name: %s" % info.command_node.command)
    print("Command is on user cooldown for: %s seconds" % info.command_node.user_cooldown)

    # Access low-level data for a reply
    if info.original_message is TwitchChatMessage:
        var original_chat_msg: TwitchChatMessage = info.original_message
        print("Original Message ID: %s" % original_chat_msg.message_id)
        # You can use this message_id to send a reply
    else:
        print("Original message was not a standard chat message (e.g., a whisper).")

    print("----------------------------")