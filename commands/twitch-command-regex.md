# TwitchCommandRegex Node

The `TwitchCommandRegex` node provides a powerful way to detect and react to specific patterns in chat messages using
regular expressions (regex). Unlike the standard `TwitchCommand`, it is not triggered by a command prefix like `!`, but
by a match against its configured regex pattern anywhere in the message.

<Badge type="warning" text="Performance Advisory" />
<Badge type="tip" text="GDScript & C#" />

Be mindful when using this node. Applying regular expressions to every single message in a busy chat can be
computationally intensive. Use simple, efficient patterns and limit the number of active `TwitchCommandRegex` nodes to
avoid performance issues.

Every example on this page is available in both GDScript and C#: use the tabs on each code block to switch.

## Overview

This node extends `TwitchCommandBase`, inheriting its robust permission, location, and cooldown-checking capabilities,
but replaces the prefix-based trigger with a regex-based one.

The workflow is as follows:

1. A chat message is received.
2. The node's permission, location (`where`), user whitelist, and cooldown checks are performed.
3. If these checks pass, the node's configured regular expression is tested against the entire message content.
4. If the regex finds a match, the `command_received` signal is emitted, with the **capture groups** from the regex
   match passed as the `args`.
5. If any of the initial checks (permissions, cooldowns) fail, a corresponding signal like `invalid_permission` or
   `cooldown` is emitted.

This makes it an ideal tool for commands that need to be triggered contextually or for extracting specific data from
user sentences.

## Prerequisites

1. **Add the Node:** Add a `TwitchCommandRegex` node to your scene.
2. **Message Source:** The node requires a source for chat messages, typically provided by a configured `TwitchEventsub`
   node in your project. When not set, it will automatically take the first `TwitchEventsub` node it finds in the scene.
3. **Connect the Channel Chat Message Subscription**: Make sure to have a `Channel Chat Message` subscription in `TwitchEventsub` node created. 

## Configuration (Inspector Properties)

* **`Regex To Listen` (`String`)**: **Required.** The regular expression pattern that this node will search for in each
  chat message.

* **Inherited Properties from `TwitchCommandBase`:**
    * **`Permission Level` (`PermissionFlag`)**: The minimum permission a user must have to trigger this regex command.
    * **`Where` (`WhereFlag`)**: Defines where this regex should be active (Chat, Whisper, or Anywhere).
    * **`Allowed Users` (`Array[String]`)**: A whitelist of user login names who can trigger this command, bypassing the
      `Permission Level` check.
    * **`Listen To Chatrooms` (`Array[String]`)**: If non-empty, the command will only trigger in the specified
      chatrooms (broadcaster login names).
    * **`Case Insensitive` (`bool`)**: If `true`, the regex match will ignore case (by prepending `(?i)` to the
      pattern).
    * **`User Cooldown` (`float`)**: The time in seconds a specific user must wait before they can trigger this command
      again. `0` for no cooldown.
    * **`Global Cooldown` (`float`)**: The time in seconds that *everyone* must wait after the command is triggered
      before it can be used again. `0` for no cooldown.

::: tip C# note
`TwitchCommandRegex` isn't a singleton in C#: bind it to the node you configured in the editor with `this.GetTwitcherNode<TwitchCommandRegex>("...")` (from `TwitcherSharp.Extensions`), the same pattern used elsewhere on this site.
:::

## Signals

* **`command_received(from_username: String, info: TwitchCommandInfo, args: PackedStringArray)`**
    * Emitted when a message passes all checks (permissions, cooldowns) and successfully matches the `regex_to_listen`
      pattern.
    * `args`: A `PackedStringArray` containing the **capture groups** from the regex match.
* **`received_invalid_command(from_username: String, info: TwitchCommandInfo, args: PackedStringArray)`**
    * Emitted for general validation failures that are not related to permissions or cooldowns (e.g., an internal logic
      error).
* **`invalid_permission(from_username: String, info: TwitchCommandInfo, args: PackedStringArray)`**
    * Emitted specifically when a user's message matches but they do not have the required `permission_level`.
* **`cooldown(from_username: String, info: TwitchCommandInfo, args: PackedStringArray, cooldown_remaining_in_s: float)`
  **
    * Emitted when a user tries to trigger the command while it is on either a user or global cooldown.
    * `cooldown_remaining_in_s`: The remaining cooldown time in seconds.

## Understanding Regex Capture Groups

The primary way to extract data with this node is by using **capture groups** in your regex pattern. A capture group is
any part of the pattern enclosed in parentheses `(...)`. Each capture group's matched content will be passed as an
element in the `args` array of the `command_received` signal.

**Example Pattern:** `vote for option (\w+)`

* `\w+` matches one or more "word" characters (letters, numbers, underscore).
* The parentheses `(...)` make it a capture group.
* If a user types "I want to vote for option **Alpha**", the regex will match, and the `args` array will contain
  `["Alpha"]`.

## Usage Example

Let's create a regex command to detect when a user reports their level in a game, using the pattern
`I am on level (\d+)`.

**1. Configure the Node in the Editor:**

* Add a `TwitchCommandRegex` node to your scene.
* In the Inspector:
    * Set **`Regex To Listen`** to `I am on level (\d+)`.
    * Set **`Case Insensitive`** to `true`.
    * Set **`User Cooldown`** to `10.0` (each user can only report their level every 10 seconds).

**2. Connect via Script:**

::: code-group

```gdscript [GDScript]
extends Node

@onready var level_reporter: TwitchCommandRegex = $TwitchCommandRegex
@onready var twitch_chat: TwitchChat # For sending replies

func _ready():
    level_reporter.command_received.connect(_on_level_reported)
    level_reporter.cooldown.connect(_on_level_reporter_cooldown)
    print("Level reporter regex command is active.")

# Called on a successful, off-cooldown match with correct permissions
func _on_level_reported(from_username: String, info: TwitchCommandInfo, args: PackedStringArray):
    if args.is_empty():
        return

    var level_string = args[0]
    var level_number = int(level_string)

    print("User '%s' reported they are on level %d!" % [from_username, level_number])
    update_player_level_from_chat(from_username, level_number)

# Called when a user tries to trigger the command while on cooldown
func _on_level_reporter_cooldown(from_username: String, info: TwitchCommandInfo, args: PackedStringArray, remaining_s: float):
    print("User %s tried to report their level too soon. Cooldown: %.1f seconds left." % [from_username, remaining_s])
    # Optionally send a whisper or chat message to inform the user
    # twitch_chat.send_message("@%s, you can report your level again in %.0f seconds." % [from_username, remaining_s])

# Placeholder for your actual game logic
func update_player_level_from_chat(username: String, level: int):
    print("  -> Updating game state for '%s' to level %d." % [username, level])
```

```csharp [C#]
using Godot;
using TwitcherSharp.Chat;
using TwitcherSharp.Extensions;

public partial class YourNode : Node
{
    private TwitchCommandRegex _levelReporter;

    public override void _Ready()
    {
        _levelReporter = this.GetTwitcherNode<TwitchCommandRegex>("TwitchCommandRegex");

        _levelReporter.CommandReceived += OnLevelReported;
        _levelReporter.Cooldown += OnLevelReporterCooldown;
        GD.Print("Level reporter regex command is active.");
    }

    // Called on a successful, off-cooldown match with correct permissions
    private void OnLevelReported(string fromUsername, TwitchCommandInfo info, string[] args)
    {
        if (args.Length == 0) return;

        string levelString = args[0];
        int levelNumber = int.Parse(levelString);

        GD.Print($"User '{fromUsername}' reported they are on level {levelNumber}!");
        UpdatePlayerLevelFromChat(fromUsername, levelNumber);
    }

    // Called when a user tries to trigger the command while on cooldown
    private void OnLevelReporterCooldown(string fromUsername, TwitchCommandInfo info, string[] args, float remainingS)
    {
        GD.Print($"User {fromUsername} tried to report their level too soon. Cooldown: {remainingS:F1} seconds left.");
        // Optionally send a whisper or chat message to inform the user
        // await TwitchChat.Instance.SendMessage($"@{fromUsername}, you can report your level again in {remainingS:F0} seconds.");
    }

    // Placeholder for your actual game logic
    private void UpdatePlayerLevelFromChat(string username, int level)
        => GD.Print($"  -> Updating game state for '{username}' to level {level}.");
}
```

:::
