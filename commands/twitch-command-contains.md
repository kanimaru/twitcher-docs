# TwitchCommandContains Node

The `TwitchCommandContains` node is a powerful yet easy-to-use tool for detecting the presence of specific keywords or
phrases within chat messages. It triggers a signal when a message contains text that matches its configured list.

<Badge type="tip" text="GDScript & C#" /> Every example on this page is available in both GDScript and C#: use the tabs on each code block to switch.

## Overview

This node extends `TwitchCommandBase`, inheriting its robust permission, location, and cooldown-checking capabilities.
Its trigger is based on message content rather than a `!command` prefix. It's an excellent choice for creating
responsive bots that react to conversational cues.

The workflow is as follows:

1. A chat message is received.
2. The node's permission, location (`where`), user whitelist, and cooldown checks are performed.
3. If these checks pass, the node scans the message content for the words/phrases listed in its `contains` array,
   respecting the `match_all` and `match_word` settings.
4. If the conditions are met, the `command_received` signal is emitted, with the found keywords passed as the `args`.
5. If any of the initial checks (permissions, cooldowns) fail, a corresponding signal like `invalid_permission` or
   `cooldown` is emitted.

This makes it perfect for simple keyword triggers, question detection, or filtering messages containing certain terms.

## Prerequisites

1. **Add the Node:** Add a `TwitchCommandContains` node to your scene.
2. **Message Source:** The node requires a source for chat messages, typically provided by a configured `TwitchEventsub`
   node in your project.
   When not set, it will automatically take the first `TwitchEventsub` node it finds in the scene.

## Configuration (Inspector Properties)

* **`Contains` (`Array[String]`)**: **Required.** The list of words or phrases that this node will search for in each
  chat message.
* **`Match All` (`bool`)**:
    * If `false` (default), the command triggers if **any one** of the items in the `contains` list is found (OR logic).
    * If `true`, the command *only* triggers if **all** the items in the `contains` list are found in the message (AND
      logic).
* **`Match Word` (`bool`)**:
    * If `false` (default), the node performs a simple substring search. For example, "art" would match "heart".
    * If `true`, the node ensures the match is a whole word. For example, "art" would match "art" or "big art", but
      *not* "heart".

* **Inherited Properties from `TwitchCommandBase`:**
    * **`Permission Level` (`PermissionFlag`)**: The minimum permission a user must have for this node to check their
      message.
    * **`Where` (`WhereFlag`)**: Defines where this check should be active (Chat, Whisper, or Anywhere).
    * **`Allowed Users` (`Array[String]`)**: A whitelist of user login names who can trigger this, bypassing the
      `Permission Level` check.
    * **`Listen To Chatrooms` (`Array[String]`)**: If non-empty, the command will only trigger in the specified
      chatrooms (broadcaster login names).
    * **`Case Insensitive` (`bool`)**: If `true`, the search for keywords will ignore case (e.g., "Hello" will match "
      hello").
    * **`User Cooldown` (`float`)**: The time in seconds a specific user must wait before they can trigger this command
      again. `0` for no cooldown.
    * **`Global Cooldown` (`float`)**: The time in seconds that *everyone* must wait after the command is triggered
      before it can be used again. `0` for no cooldown.

::: tip C# note
`TwitchCommandContains` isn't a singleton in C#: bind it to the node you configured in the editor with `this.GetTwitcherNode<TwitchCommandContains>("...")` (from `TwitcherSharp.Extensions`). Its own properties carry over as `Contains` (`List<string>`), `MatchAll`, `MatchWord`.
:::

## Signals

* **`command_received(from_username: String, info: TwitchCommandInfo, args: PackedStringArray)`**
    * Emitted when a message passes all checks (permissions, cooldowns) and meets the `contains` criteria.
    * `args`: A `PackedStringArray` containing the **specific keywords from your `contains` list** that were found in
      the message.
* **`received_invalid_command(from_username: String, info: TwitchCommandInfo, args: PackedStringArray)`**
    * Emitted for general validation failures that are not related to permissions or cooldowns.
* **`invalid_permission(from_username: String, info: TwitchCommandInfo, args: PackedStringArray)`**
    * Emitted specifically when a user's message matches but they do not have the required `permission_level`.
* **`cooldown(from_username: String, info: TwitchCommandInfo, args: PackedStringArray, cooldown_remaining_in_s: float)`
  **
    * Emitted when a user tries to trigger the command while it is on either a user or global cooldown.
    * `cooldown_remaining_in_s`: The remaining cooldown time in seconds.

## Usage Example

Let's create a bot that detects when a user mentions the word "lag" and puts the response on a cooldown to prevent spam.

**1. Configure the Node in the Editor:**

* Add a `TwitchCommandContains` node to your scene.
* In the Inspector:
    * In the **`Contains`** array, add the string `"lag"`.
    * Set **`Match Word`** to `true` (so it doesn't trigger on "flag").
    * In the inherited properties, set **`Case Insensitive`** to `true`.
    * Set **`Permission Level`** to `EVERYONE`.
    * Set **`Global Cooldown`** to `30.0` (the response can only be triggered once every 30 seconds globally).

**2. Connect via Script:**

::: code-group

```gdscript [GDScript]
extends Node

@onready var lag_detector: TwitchCommandContains = $LagDetector
@onready var twitch_chat: TwitchChat = $TwitchService/TwitchChat

func _ready():
    lag_detector.command_received.connect(_on_lag_detected)
    lag_detector.cooldown.connect(_on_lag_detector_cooldown)
    print("Lag detector is now active.")

# This function is called when a message contains "lag" and is NOT on cooldown.
func _on_lag_detected(from_username: String, info: TwitchCommandInfo, args: PackedStringArray):
    print("User '%s' mentioned lag. Sending info." % from_username)

    # Send a helpful reply
    var reply_message = "If you are experiencing lag, try refreshing the stream or checking your connection. The current stream bitrate is X."
    await twitch_chat.send_message(reply_message)


# This function is called when a user mentions "lag" but the command is on global cooldown.
func _on_lag_detector_cooldown(from_username: String, info: TwitchCommandInfo, args: PackedStringArray, remaining_s: float):
    print("User '%s' mentioned lag, but the command is on cooldown for %.1f more seconds." % [from_username, remaining_s])
    # We choose not to reply here to avoid spamming the user.
```

```csharp [C#]
using Godot;
using TwitcherSharp.Chat;
using TwitcherSharp.Extensions;

public partial class YourNode : Node
{
    private TwitchCommandContains _lagDetector;

    public override void _Ready()
    {
        _lagDetector = this.GetTwitcherNode<TwitchCommandContains>("LagDetector");

        _lagDetector.CommandReceived += OnLagDetected;
        _lagDetector.Cooldown += OnLagDetectorCooldown;
        GD.Print("Lag detector is now active.");
    }

    // This is called when a message contains "lag" and is NOT on cooldown.
    private async void OnLagDetected(string fromUsername, TwitchCommandInfo info, string[] args)
    {
        GD.Print($"User '{fromUsername}' mentioned lag. Sending info.");

        // Send a helpful reply
        const string replyMessage = "If you are experiencing lag, try refreshing the stream or checking your connection. The current stream bitrate is X.";
        await TwitchChat.Instance.SendMessage(replyMessage);
    }

    // This is called when a user mentions "lag" but the command is on global cooldown.
    private void OnLagDetectorCooldown(string fromUsername, TwitchCommandInfo info, string[] args, float remainingS)
    {
        GD.Print($"User '{fromUsername}' mentioned lag, but the command is on cooldown for {remainingS:F1} more seconds.");
        // We choose not to reply here to avoid spamming the user.
    }
}
```

:::
