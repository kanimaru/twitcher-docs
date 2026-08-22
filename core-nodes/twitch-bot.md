# TwitchBot Node

The `TwitchBot` node provides a way to send chat messages as a designated bot account, separate from your main authenticated user. 
This is the mechanism required to have messages appear in Twitch chat with the official **Bot** badge next to the username.

<Badge type="tip" text="GDScript & C#" /> Every example on this page is available in both GDScript and C#: use the tabs on each code block to switch.

## Overview

This node is a self-contained system for a bot's chat functionality. It does not use the main `TwitchAPI` instance of 
your project. Instead, it creates its own internal `TwitchAuth` and `TwitchAPI` instances to:

1.  Manage a dedicated `OAuthToken` for your bot account.
2.  Handle the authentication flow (uses Client Credentials flow) for that bot token.
3.  Send chat messages using the bot's identity (`sender`) to a target channel (`receiver`).

The primary purpose is to fulfill Twitch's requirements for sending messages that receive the "Bot" chat badge.

## Scope and Permission Requirements

Using this node involves a more complex permission setup than standard chat messages. **All of the following conditions must be met:**

*   **Client Secret:** Your `OAuthSetting` resource **must** have the **Client Secret** filled in. The bot's authentication flow requires it.
*   **Bot Account (`sender`):** The Twitch user account designated as your bot must grant your application the `user:bot` scope.
*   **Broadcaster Account (`receiver`):** The broadcaster of the channel where the bot will speak must either:
    1.  Grant your application the `channel:bot` scope.
    2.  OR make your bot account a **moderator** in their channel.

Without these specific permissions, attempts to send messages via this node will fail.

## Prerequisites

1.  **Add the Node:** Add a `TwitchBot` node to your scene.
2.  **Assign `OAuthSetting`:** Assign your main `OAuthSetting` resource to the `Oauth Setting` property. Ensure it contains your Client Secret.
3.  **Create and Assign `Bot Token`:**
    *   Create a **new, separate** `OAuthToken` resource file. This token will be used exclusively by the bot.
    *   Assign this new resource to the `Bot Token` property.
    *   You must ensure this token is authorized by the **Twitch account you intend to use as your bot**. This might 
        involve a separate, one-time authorization process for that account. (There is an Editor Button for this)  
    ![Authorize Sender](/explain-authorize-bot.png)
4.  **Assign `Sender` and `Receiver`:** Assign `TwitchUser` resources for both the bot account (`Sender`) and the target channel's broadcaster (`Receiver`).

## Configuration (Inspector Properties)

*   **`Oauth Setting` (`OAuthSetting`)**: **Required.** Your primary `OAuthSetting` resource. The `TwitchBot` node duplicates this but requires the `Client Secret` to be present.
*   **`Bot Token` (`OAuthToken`)**: **Required.** A dedicated `OAuthToken` resource for the bot user. This token will be authenticated and managed independently of your application's main user token.
*   **`Sender` (`TwitchUser`)**: **Required.** The `TwitchUser` resource representing the bot account that will send the messages.
*   **`Receiver` (`TwitchUser`)**: *Recommended.* The `TwitchUser` resource representing the broadcaster of the channel where messages will be sent. If not set, it defaults to the `Sender`.
    *   **Note:** For the "Bot" badge to appear, the `Sender` and `Receiver` must be different users.

## Signals

This node does not introduce new public signals for general use.

## Methods

*   **`send_message(message: String, reply_parent_message_id: String = "", for_source_only = true, broadcaster: TwitchUser = null) -> void`**
    *   Sends a chat message as the configured bot user.
    *   `message`: The text content of the message to send.
    *   `reply_parent_message_id`: *Optional.* The ID of a message to reply to.
    *   `broadcaster`: *Optional.* A `TwitchUser` object for the target channel. If `null`, it defaults to the `Receiver` property, which in turn defaults to the `Sender` property.
    *   **Note:** This method is `async`. You can call it with `await` to wait until the message was sent. It will automatically handle authorizing the `bot_token` if it's not already authenticated.

::: tip C# note
In C#, `TwitchBot`'s messaging methods are exposed as **static** methods on the `TwitchBot` class rather than instance methods: `TwitchBot.SendMessage(...)`, `TwitchBot.SendLongMessage(...)` (auto-splits messages over 500 characters into multiple sends), `TwitchBot.Announcement(...)` and `TwitchBot.Shoutout(fromUser, targetUser)`. They operate against `TwitchBot.Instance` internally, so you still need the node in the scene (or created via `TwitchBot.CreateInstance()`); you just don't have to fetch the instance yourself to call them.
:::

## Usage Example

::: code-group

```gdscript [GDScript]
extends Node

# Assuming TwitchBot node is configured in the scene
@onready var twitch_bot: TwitchBot = $TwitchBot


func _ready():
    # Example: send a message after a short delay
    await get_tree().create_timer(5.0).timeout
    send_bot_greeting()


func send_bot_greeting():
    print("Sending greeting from bot '%s' to channel '%s'" % [twitch_bot.sender.display_name, twitch_bot.receiver.display_name])
    await twitch_bot.send_message("Hello! I am a bot user powered by Twitcher.")
    print("Bot message sent (or at least attempted).")
```

```csharp [C#]
using Godot;
using TwitcherSharp.Chat;

public partial class YourNode : Node
{
    public override async void _Ready()
    {
        // Example: send a message after a short delay
        await ToSignal(GetTree().CreateTimer(5.0), SceneTreeTimer.SignalName.Timeout);
        await SendBotGreeting();
    }

    private async Task SendBotGreeting()
    {
        GD.Print($"Sending greeting from bot '{TwitchBot.Instance.Sender.DisplayName}' to channel '{TwitchBot.Instance.Receiver.DisplayName}'");
        await TwitchBot.SendMessage("Hello! I am a bot user powered by TwitcherSharp.");
        GD.Print("Bot message sent (or at least attempted).");
    }
}
```

:::

## Considerations
 * Complex Permissions: The `user:bot` and `channel:bot` scope requirements are strict. This feature is advanced and requires careful setup on the Twitch developer side for multiple user accounts.
 * Client Secret is Mandatory: The bot's authentication flow relies on the Client Credentials grant, which requires your application's Client Secret.
 * Bot Badge: The "Bot" badge will only appear if the sender and the target broadcaster (channel) are different Twitch users.
