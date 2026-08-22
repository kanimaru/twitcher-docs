# TwitchChat Node

The `TwitchChat` node simplifies reading and writing messages to a specific Twitch channel's chat room. 
It uses Twitch EventSub for receiving messages and the Twitch API for sending them.
It also integrates with `TwitchMediaLoader` to potentially utilize badge and emote data preloading. 

<Badge type="tip" text="GDScript & C#" /> Every example on this page is available in both GDScript and C#: use the tabs on each code block to switch.

## Prerequisites

1.  **Add the Node:** Add a `TwitchChat` node to your scene. It's commonly placed as a child of a configured `TwitchService` node, which helps automatically wire up dependencies.
2.  **Dependencies:** Ensure instances of `TwitchEventsub`, `TwitchAPI`, and `TwitchMediaLoader` (optional) are available
    and assigned in the Inspector. If `TwitchChat` is a child of `TwitchService`, these might be assigned automatically or easily accessible.
    When each of the nodes exists only once in the scene, it will wire up automatically. 
3.  **Configuration:** Select the `TwitchChat` node and configure its properties in the Inspector, **especially `Broadcaster User`**.

::: tip C# note
In C#, `%TwitchChat` from GDScript becomes the static property `TwitchChat.Instance`, the same `.Instance`/`.CreateInstance()` pattern used by `TwitchService` and `TwitchAPI`; see [TwitchService](/core-nodes/twitch-service) for details. Most of the time, though, you won't need `TwitchChat` directly at all: `TwitchService.Instance.Chat(...)`, `.Shoutout(...)` and `.Announcement(...)` cover the common cases.
:::

## Configuration (Inspector Properties)

These properties configure the behavior of the `TwitchChat` node:

*   **`Eventsub` (`TwitchEventsub`)**: **Required.** The `TwitchEventsub` instance used to listen for incoming chat message events.
*   **`Media Loader` (`TwitchMediaLoader`)**: **Optional.** The `TwitchMediaLoader` instance used to preload badge and emote data for the channel.
*   **`Api` (`TwitchAPI`)**: **Required.** The `TwitchAPI` instance used for sending chat messages.
*   **`Broadcaster User` (`TwitchUser`)**: **Required.** A `TwitchUser` resource representing the channel whose chat you want to monitor and send messages to. **Subscription will fail if this is not set.**
*   **`Sender User` (`TwitchUser`)**: *Optional.* A `TwitchUser` resource representing the user who will send messages. If left `null`, the currently authenticated user (owner of the access token used by `TwitchAPI`) will be used as the sender.
*   **`Subscribe On Ready` (`bool`)**: If `true` (default), the node automatically attempts to call `subscribe()` when the scene starts (outside the editor). If `false`, you must call `subscribe()` manually.

## Signals

*   **`message_received(message: TwitchChatMessage)`**
    *   Emitted when a new chat message arrives for the configured `broadcaster_user`'s channel.
    *   The `message` argument is a `TwitchChatMessage` object containing detailed information about the message, including the content, sender, badges, emotes, message ID, etc.

::: tip C# note
In C#: `TwitchChat.Instance.MessageReceived += OnChatMessageReceived;`
:::

## Methods

*   **`subscribe() -> void`**
    *   Manually initiates the subscription process for chat messages for the configured `Broadcaster User`.
    *   This involves:
        *   Preloading channel badges and emotes using `TwitchMediaLoader`.
        *   Determining the `sender_user` via an API call if it wasn't explicitly set.
        *   Creating and registering a `channel.chat.message` EventSub subscription via the assigned `TwitchEventsub` node.
    *   You typically call this if `subscribe_on_ready` is `false`.
    *   **Note:** This function internally uses `await` for API calls so you can `await` until everything is set up correctly.

*   **`send_message(message: String, reply_parent_message_id: String = "") -> Array[TwitchSendChatMessage.ResponseData]`**
    *   Sends a chat message to the configured `broadcaster_user`'s channel.
    *   `message`: The text content of the message to send.
    *   `reply_parent_message_id`: *Optional.* The ID of the message you want to reply to. If provided, the sent message will appear as a reply in the chat interface.
    *   Uses the assigned `TwitchAPI` instance. The message is sent as the `sender_user` (or the authenticated user if `sender_user` is null).
    *   Returns an Array containing `TwitchSendChatMessage.ResponseData` objects. Indicates if the message was sent successfully 
        or provides a reason if it was dropped (e.g., by AutoMod).
    *   **Note:** This function internally uses `await` for API calls so you can `await` until the message was sent.

::: tip C# note
`subscribe()` → `TwitchChat.Instance.Subscribe()`. `send_message(...)` → `Task<TwitchSendChatMessageResponse.TwitchResponseData[]> TwitchChat.Instance.SendMessage(string message, string replyParentMessageId = null)`.
:::

## Usage Example

::: code-group

```gdscript [GDScript]
extends Node

@onready var twitch_chat: TwitchChat = %TwitchChat

func _ready():
	twitch_chat.message_received.connect(_on_chat_message_received)
	# If subscribe_on_ready is false, you might need to call this:
	# twitch_chat.subscribe()
	

# Callback function for new messages
func _on_chat_message_received(chat_message: TwitchChatMessage):
	print("[%s] %s: %s" % [chat_message.broadcaster_user_name, chat_message.chatter_user_name, chat_message.message.text])

	# Example: Reply "Hello!" to any message containing "hi"
	if "hi" in chat_message.message.text.to_lower():
		var response_data: Array[TwitchSendChatMessage.ResponseData] = await twitch_chat.send_message("Hello!", chat_message.message_id)
		if not response_data.is_empty() and response_data[0].is_sent:
			print("Replied successfully!")
		else:
			printerr("Failed to send reply. Reason: ", response_data[0].drop_reason if not response_data.is_empty() else "Unknown")


# Example: Send a message manually (e.g., triggered by a button press)
func _send_test_message():
	var response_data: Array[TwitchSendChatMessage.ResponseData] = await twitch_chat.send_message("This is a test message from Godot!")
	if not response_data.is_empty() and response_data[0].is_sent:
		print("Test message sent successfully!")
	else:
		printerr("Failed to send test message. Reason: ", response_data[0].drop_reason if not response_data.is_empty() else "Unknown")
```

```csharp [C#]
using Godot;
using TwitcherSharp.Chat;

public partial class YourNode : Node
{
    public override void _Ready()
    {
        TwitchChat.Instance.MessageReceived += OnChatMessageReceived;
        // If SubscibeOnReady is false, you might need to call this:
        // TwitchChat.Instance.Subscribe();
    }

    // Callback function for new messages
    private async void OnChatMessageReceived(TwitchChatMessage chatMessage)
    {
        GD.Print($"[{chatMessage.BroadcasterUserName}] {chatMessage.ChatterUserName}: {chatMessage.Content.Text}");

        // Example: Reply "Hello!" to any message containing "hi"
        if (chatMessage.Content.Text.ToLower().Contains("hi"))
        {
            var responseData = await TwitchChat.Instance.SendMessage("Hello!", chatMessage.MessageId);
            if (responseData.Length > 0 && responseData[0].IsSent)
            {
                GD.Print("Replied successfully!");
            }
            else
            {
                GD.PrintErr($"Failed to send reply. Reason: {(responseData.Length > 0 ? responseData[0].DropReason?.Message : "Unknown")}");
            }
        }
    }

    // Example: Send a message manually (e.g., triggered by a button press)
    private async void SendTestMessage()
    {
        var responseData = await TwitchChat.Instance.SendMessage("This is a test message from Godot!");
        if (responseData.Length > 0 && responseData[0].IsSent)
        {
            GD.Print("Test message sent successfully!");
        }
        else
        {
            GD.PrintErr($"Failed to send test message. Reason: {(responseData.Length > 0 ? responseData[0].DropReason?.Message : "Unknown")}");
        }
    }
}
```

:::
