# TwitchEventListener Node

The `TwitchEventListener` provides a convenient way to react to a specific type of Twitch EventSub event without needing 
complex filtering logic in your main scripts. It acts as a dedicated listener for a single event subscription.

<Badge type="tip" text="GDScript & C#" /> Every example on this page is available in both GDScript and C#: use the tabs on each code block to switch.

## Overview

Think of `TwitchEventListener` as a signal relay or filter. You configure it with:
1.  An existing `TwitchEventsub` node instance.
2.  The specific `TwitchEventsubDefinition.Type` you are interested in (e.g., `CHANNEL_FOLLOW`, `CHANNEL_SUBSCRIBE`).

The listener then connects to the general `event` signal of the provided `TwitchEventsub` node. 
When *any* event comes from `TwitchEventsub`, this listener checks if the event's type matches the one it's configured for. 
If it matches, the `TwitchEventListener` emits its own `received` signal, passing along the raw data dictionary for that specific event.

**Important:** This node **does not create** the EventSub subscription with Twitch. It only listens for events from a 
subscription that **must already be active** on the linked `TwitchEventsub` node.

::: tip C# note
In C#, `TwitchEventListener` is a **generic class**: `TwitchEventListener<T>`, where `T` is the specific event type (e.g. `TwitchChannelFollowEvent`, `TwitchChannelChatMessageEvent`). This means the `received(data: Dictionary)` signal you'd get in GDScript becomes a strongly-typed `Received` event carrying a `T` object instead of a raw `Dictionary`, so `data["user_name"]` becomes `e.UserName` with compile-time checking and autocomplete. Every EventSub subscription type has a matching event class generated under `TwitcherSharp.EventSub.Generated.*`.
:::

## Prerequisites

1.  **Add the Node:** Add a `TwitchEventListener` node to your scene. It's often useful as a child of the node that needs to react to the specific event.
2.  **EventSub Dependency:** Assign a configured and active `TwitchEventsub` instance to the `Eventsub` property in the Inspector.
3.  **Existing Subscription:** Ensure that the `TwitchEventsub` node assigned in step 2 is **already subscribed** to the 
    event type you intend to listen for with this `TwitchEventListener`.

## Configuration (Inspector Properties)

*   **`Eventsub` (`TwitchEventsub`)**: **Required.** The instance of `TwitchEventsub` that this listener will connect to and receive events from. Automatically assigned if only one instance of `TwitchEventsub` exists.
*   **`Subscription` (`TwitchEventsubDefinition.Type`)**: **Required.** Select the specific type of EventSub event this listener should react to from the enum list (e.g., `CHANNEL_FOLLOW`, `CHANNEL_SUBSCRIBE`, `CHANNEL_CHEER`, `CHANNEL_CHANNEL_POINTS_CUSTOM_REWARD_REDEMPTION`, etc.).

::: tip C# note
In C#, `Subscription` becomes `SubscriptionDefinition` (a `TwitchEventSubDefinition`, e.g. `TwitchEventSubDefinition.ChannelFollow`) and can be set either in the editor on a `TwitchEventListener` node, or directly from code before adding the node to the scene tree; see the usage example below.
:::

## Signals

*   **`received(data: Dictionary)`**
    *   Emitted when the linked `TwitchEventsub` node receives an event whose type exactly matches the `Subscription` type configured for this listener.
    *   `data`: A `Dictionary` containing the raw payload of the received EventSub event, exactly as provided by Twitch. 
        The structure of this dictionary depends entirely on the specific event type. Refer to the official [Twitch EventSub documentation](https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/) for the payload details of each event.

::: tip C# note
`TwitchEventListener<T>.Received` is a `event Action<T>`: subscribe with `listener.Received += OnReceived;` or `listener.ConnectReceived(...)` / `.DisconnectReceived(...)`.
:::

## Methods

*   **`start_listening() -> void`**
    *   Manually connects the listener's internal handler to the `event` signal of the assigned `TwitchEventsub` node. 
        This is usually called automatically when the node enters the scene tree (`_enter_tree`). 
        You might call this if you previously called `stop_listening()` and want to resume.

*   **`stop_listening() -> void`**
    *   Manually disconnects the listener's internal handler from the `event` signal of the assigned `TwitchEventsub` node. 
        This prevents the listener from processing further events until `start_listening()` is called again. 
        This is usually called automatically when the node exits the scene tree (`_exit_tree`).

::: tip C# note
Same in C#: `listener.StartListening()` / `listener.StopListening()`.
:::

## Usage Example

Imagine you want a specific Node (`MyFollowHandler`) to react *only* to follow events.

1.  Ensure your main `TwitchEventsub` node is configured and subscribing to `CHANNEL_FOLLOW` events.
2.  Add a `TwitchEventListener` node (e.g., as a child of `MyFollowHandler`).
3.  In the Inspector for the `TwitchEventListener`:
    *   Assign your main `TwitchEventsub` node to the `Eventsub` property.
    *   Select `CHANNEL_FOLLOW` for the `Subscription` property.

::: code-group

```gdscript [GDScript]
# Script attached to MyFollowHandler node

# Reference the TwitchEventListener node (assuming it's a child)
@onready var follow_listener: TwitchEventListener = $FollowEventListener

func _ready():
    follow_listener.received.connect(_on_follow_event_received)
    

# This function will ONLY be called when a CHANNEL_FOLLOW event occurs
func _on_follow_event_received(data: Dictionary):
    # Process the follow event data
    # The structure of 'data' depends on the Twitch EventSub specification
    # for channel.follow events. 
    
    var follower_name = data["user_name"]
    print("Received a new follow from: %s!" % follower_name)
    # Trigger game logic, update UI, etc.
```

```csharp [C#]
// Script attached to MyFollowHandler node
using Godot;
using TwitcherSharp.EventSub;
using TwitcherSharp.EventSub.Generated.ChannelFollow;
using TwitcherSharp.Extensions;

public partial class MyFollowHandler : Node
{
    // Reference the TwitchEventListener node (assuming it's a child)
    private TwitchEventListener<TwitchChannelFollowEvent> _followListener;

    public override void _Ready()
    {
        _followListener = this.GetTwitcherNode<TwitchEventListener<TwitchChannelFollowEvent>>("FollowEventListener");
        _followListener.Received += OnFollowEventReceived;
    }

    // This will ONLY be called when a CHANNEL_FOLLOW event occurs
    private void OnFollowEventReceived(TwitchChannelFollowEvent e)
    {
        // 'e' is already a strongly-typed TwitchChannelFollowEvent, no dictionary lookups needed
        GD.Print($"Received a new follow from: {e.UserName}!");
        // Trigger game logic, update UI, etc.
    }
}
```

:::

::: tip C# note
The example above binds to a `TwitchEventListener` node already configured in the editor via `FromObject`. If you'd rather build it entirely from code instead of placing the node in the editor:

```csharp
var listener = new TwitchEventListener<TwitchChannelFollowEvent>
{
    SubscriptionDefinition = TwitchEventSubDefinition.ChannelFollow
};
AddChild(listener.ToGodotObject() as Node);
listener.Received += OnFollowEventReceived;
```
:::
