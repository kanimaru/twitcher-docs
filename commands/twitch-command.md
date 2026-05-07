# TwitchCommand Node

The `TwitchCommand` node is the standard way to create traditional, prefix-based chat commands (e.g., `!lurk`, `!so`).
It handles parsing the command name, validating argument counts, and inherits all permission and cooldown checks from
`TwitchCommandBase`.

## Overview

This is the most common command type. It's designed to be triggered when a chat message starts with a specific prefix (
like `!`) followed by a command name.

The workflow is as follows:

1. A chat message is received.
2. The node checks if the message starts with one of its configured `command_prefixes`.
3. It then checks if the first word after the prefix matches its `command` name or one of its `aliases`.
4. If the prefix and command name match, it proceeds with the standard checks inherited from `TwitchCommandBase`:
   permissions, location (`where`), user whitelists, and cooldowns.
5. If all those checks pass, it validates the number of arguments provided against `args_min` and `args_max`.
6. If all checks are successful, the `command_received` signal is emitted.
7. If any check fails, a corresponding signal (`invalid_permission`, `cooldown`, `received_invalid_command`) is emitted.

## Prerequisites

1. **Add the Node:** Add a `TwitchCommand` node to your scene for each command you want to create.
2. **Message Source:** The node requires a source for chat messages, typically provided by a configured `TwitchEventsub`
   node in your project.
   When not set, it will automatically take the first `TwitchEventsub` node it finds in the scene.

## Configuration (Inspector Properties)

* **`Command Prefixes` (`Array[String]`)**: **Required.** A list of single-character prefixes that can trigger this
  command. Default is `["!"]`.
* **`Aliases` (`Array[String]`)**: *Optional.* A list of alternative names for this command (e.g., `["roll", "d6"]` for
  a "dice" command).
* **`Args Min` (`int`)**: The minimum number of arguments required after the command name. `0` means no arguments are
  needed.
* **`Args Max` (`int`)**: The maximum number of arguments allowed. `-1` means there is no upper limit (infinite
  arguments).

* **Inherited Properties from `TwitchCommandBase`:**
    * **`Command` (`String`)**: **Required.** The primary name of the command (e.g., "lurk", "hello").
    * **`Description` (`String`)**: A user-facing description of what the command does, used by `TwitchCommandHelp`.
    * **`Permission Level` (`PermissionFlag`)**: The minimum permission a user must have to execute this command.
    * **`Where` (`WhereFlag`)**: Defines where this command can be triggered (Chat, Whisper, or Anywhere).
    * **`Allowed Users` (`Array[String]`)**: A whitelist of user login names who can execute this command, bypassing the
      `Permission Level` check.
    * **`Listen To Chatrooms` (`Array[String]`)**: If non-empty, the command will only trigger in the specified
      chatrooms (broadcaster login names).
    * **`Case Insensitive` (`bool`)**: If `true`, the command name and aliases will be matched regardless of case (e.g.,
      `!HELLO` will match `!hello`).
    * **`User Cooldown` (`float`)**: The time in seconds a specific user must wait before they can use this command
      again.
    * **`Global Cooldown` (`float`)**: The time in seconds that *everyone* must wait after the command is used before it
      can be used again.

## Signals

* **`command_received(from_username: String, info: TwitchCommandInfo, args: PackedStringArray)`**
    * Emitted when a user successfully executes the command, passing all permission, cooldown, and argument count
      checks.
    * `args`: A `PackedStringArray` containing the arguments provided after the command name.
* **`received_invalid_command(from_username: String, info: TwitchCommandInfo, args: PackedStringArray)`**
    * Emitted specifically when the command is triggered with an incorrect number of arguments (too few or too many).
* **`invalid_permission(from_username: String, info: TwitchCommandInfo, args: PackedStringArray)`**
    * Emitted when a user tries to execute the command but does not have the required `permission_level`.
* **`cooldown(from_username: String, info: TwitchCommandInfo, args: PackedStringArray, cooldown_remaining_in_s: float)`
  **
    * Emitted when a user tries to execute the command while it is on either a user or global cooldown.
    * `cooldown_remaining_in_s`: The remaining cooldown time in seconds.

## Methods

* **`add_alias(alias: String) -> void`**
    * Programmatically adds a new alias (alternative name) to the command's `aliases` list at runtime.
* **`static create(...) -> TwitchCommand`**
    * A static factory function to create and configure a `TwitchCommand` node entirely via code. This is useful for
      dynamically generating commands. The returned node must be added to the scene tree to become active.

## Usage Example

Let's create a `!dice` command that requires one optional argument (the number of sides).

**1. Configure the Node in the Editor:**

* Add a `TwitchCommand` node to your scene.
* In the Inspector:
    * Set **`Command`** to `"dice"`.
    * Set **`Args Min`** to `0`.
    * Set **`Args Max`** to `1`.
    * Set **`Description`** to `"Rolls a die. Optionally specify the number of sides (e.g., !dice 20)."`.
    * Set **`User Cooldown`** to `5.0` (each user can roll every 5 seconds).

**2. Connect via Script:**

```gdscript
extends Node

@onready var dice_command: TwitchCommand = $DiceCommand
@onready var twitch_chat: TwitchChat # For sending replies

func _ready():
    dice_command.command_received.connect(_on_dice_roll)
    dice_command.received_invalid_command.connect(_on_dice_invalid_args)
    dice_command.cooldown.connect(_on_dice_cooldown)
    print("Dice command is now active.")

# Called on a successful !dice command
func _on_dice_roll(from_username: String, info: TwitchCommandInfo, args: PackedStringArray):
    var max_roll = 6 # Default to a 6-sided die
    if not args.is_empty():
        # User provided an argument, try to use it
        if args.is_valid_int():
            max_roll = max(1, int(args)) # Ensure at least 1
        else:
            await twitch_chat.send_message("@%s, that's not a valid number!" % from_username)
            return

    var roll_result = randi_range(1, max_roll)
    var reply_message = "@%s rolled a %d (1-%d)" % [from_username, roll_result, max_roll]
    await twitch_chat.send_message(reply_message, info.original_message.message_id)


# Called if the user provides too many arguments (e.g., !dice 20 10)
func _on_dice_invalid_args(from_username: String, info: TwitchCommandInfo, args: PackedStringArray):
    await twitch_chat.send_message("@%s, the !dice command only takes one number argument." % from_username)


# Called when a user tries to use !dice while on cooldown
func _on_dice_cooldown(from_username: String, info: TwitchCommandInfo, args: PackedStringArray, remaining_s: float):
    # This is a good place for a silent failure or a whisper to avoid chat spam
    print("User %s tried to use !dice while on cooldown (%.1fs left)." % [from_username, remaining_s])