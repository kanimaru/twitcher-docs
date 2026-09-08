# TwitchCommandInfo Class

The `TwitchCommandInfo` class is a **data object** (extending `RefCounted`, not `Node`) that is passed with every
command signal (`command_received`, `invalid_permission`, etc.). It bundles together essential contextual information
about the command event, making it easier to access details about the trigger.

<Badge type="tip" text="GDScript & C#" /> Every example on this page is available in both GDScript and C#: use the tabs on each code block to switch.

## Overview

You do not create `TwitchCommandInfo` objects yourself. The command system creates them for you and provides them as a
parameter in the signals. You read the properties of the received `info` object to understand the context of the
command.

## Properties

* **`command` (`TwitchCommandBase`)**: A direct reference to the command node instance that was triggered (e.g.,
  the specific `TwitchCommand` or `TwitchCommandRegex` node).
* **`channel_name` (`String`)**: The name of the channel (broadcaster's login name) where the command was triggered.
* **`username` (`String`)**: The login name of the user who triggered the command.
* **`user_id` (`String`)**: The user ID of the user who triggered the command.
* **`original_message` (`Variant`)**: The original, unprocessed data object for the message.
    * For chat messages from EventSub, this will typically be a `TwitchChatMessage` object.
    * For whispers, this may be a `Dictionary` containing the raw whisper event data.
    * This is useful for accessing low-level details like badges, message ID for replies, etc.
* **`text_message` (`String`)**: The raw text content of the message that triggered the command (e.g., `"!dice 20"`).
* **`arguments` (`PackedStringArray`)**: The arguments extracted from the message by the specific command node.
    * For `TwitchCommand`: Words after the command name.
    * For `TwitchCommandRegex`: The capture groups from the regex match.
    * For `TwitchCommandContains`: The keywords from the `contains` list that were found.

::: tip C# note
Properties carry over 1:1 in PascalCase: `Command` (typed as `TwitchCommand`), `ChannelName`, `Username`, `UserId`, `TextMessage`, `Arguments` (a `List<string>`). For `original_message`, C# splits it in two: `OriginalMessage` is the raw `Variant` (matching GDScript exactly), while `ChatMessage` is a convenience shortcut that's already cast to `TwitchChatMessage`, non-null only when `MessageType` is a chat message (there's also `WhisperMessage`, a `Dictionary`, for whispers).
:::

## Usage Example

This example shows how to use the `info` object within a signal callback.

::: code-group

```gdscript [GDScript]
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
    print("Command node name: %s" % info.command.command)
    print("Command is on user cooldown for: %s seconds" % info.command.user_cooldown)

    # Access low-level data for a reply
    if info.original_message is TwitchChatMessage:
        var original_chat_msg: TwitchChatMessage = info.original_message
        print("Original Message ID: %s" % original_chat_msg.message_id)
        # You can use this message_id to send a reply
    else:
        print("Original message was not a standard chat message (e.g., a whisper).")

    print("----------------------------")
```

```csharp [C#]
using Godot;
using TwitcherSharp.Chat;
using TwitcherSharp.Extensions;

public partial class YourNode : Node
{
    private TwitchCommand _diceCommand;

    public override void _Ready()
    {
        _diceCommand = this.GetTwitcherNode<TwitchCommand>("DiceCommand");

        // Connect to any command signal, they all provide the 'info' object
        _diceCommand.CommandReceived += OnAnyCommand;
        _diceCommand.InvalidPermission += OnAnyCommand;
        // Cooldown carries an extra float parameter, so it needs a small adapter:
        _diceCommand.Cooldown += (from, info, args, _) => OnAnyCommand(from, info, args);
    }

    // A generic callback to demonstrate using the 'info' object
    private void OnAnyCommand(string fromUsername, TwitchCommandInfo info, string[] args)
    {
        // Access basic information
        GD.Print("--- Command Event Received ---");
        GD.Print($"Triggered by user: {info.Username}");
        GD.Print($"In channel: {info.ChannelName}");
        GD.Print($"Full message text: '{info.TextMessage}'");

        // Access the node that was triggered
        GD.Print($"Command node name: {info.Command.Command}");
        GD.Print($"Command is on user cooldown for: {info.Command.UserCooldown} seconds");

        // Access low-level data for a reply (ChatMessage is already cast for you)
        if (info.ChatMessage != null)
        {
            GD.Print($"Original Message ID: {info.ChatMessage.MessageId}");
            // You can use this MessageId to send a reply
        }
        else
        {
            GD.Print("Original message was not a standard chat message (e.g., a whisper).");
        }

        GD.Print("----------------------------");
    }
}
```

:::
