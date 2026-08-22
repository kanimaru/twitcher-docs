# TwitchPollListener Node

The `TwitchPollListener` is a specialized, high-level node that simplifies listening for and reacting to the entire 
lifecycle of a Twitch Poll, from its creation to its conclusion.

<Badge type="tip" text="GDScript & C#" /> Every example on this page is available in both GDScript and C#: use the tabs on each code block to switch.

## Overview

This node acts as an all-in-one manager for Twitch Poll events. It abstracts away the complexity of handling multiple 
EventSub subscriptions and parsing different event payloads related to polls.

Its workflow is as follows:
1.  **Automatic Subscription:** It automatically checks for and creates the three necessary EventSub subscriptions for polls (`channel.poll.begin`, `channel.poll.progress`, and `channel.poll.end`).
2.  **Event Filtering:** It listens for events from the main `TwitchEventsub` node and filters for the three poll-related types.
3.  **Data Parsing:** It parses the raw JSON data from each event into a structured `TwitchPoll` object.
4.  **Lifecycle Signal Emission:** It emits specific, named signals corresponding to each stage of the poll's lifecycle, providing the relevant `TwitchPoll` object as a parameter.

This allows you to easily trigger game logic when a poll starts, update a UI in real-time as votes come in, 
and react to the final results when the poll ends.

## Prerequisites

1.  **Add the Node:** Add a `TwitchPollListener` node to your scene.
2.  **Dependencies:** Ensure instances of `TwitchEventsub` and `TwitchAPI` are available or assign it manually to this node's properties. This can be handled by placing it under a configured `TwitchService` node.
3.  **Permissions:** The `OAuthToken` used by the addon must have the `channel:read:polls` scope to subscribe to poll events.

## Configuration (Inspector Properties)

*   **`Eventsub` (`TwitchEventsub`)**: **Required.** The `TwitchEventsub` instance used to receive raw poll events. (will be automatically assigned if it's in the scene tree)
*   **`Api` (`TwitchAPI`)**: **Required.** The `TwitchAPI` instance, used to fetch the broadcaster's user info if not set manually. (will be automatically assigned if it's in the scene tree)
*   **`Ensure Subscriptions On Ready` (`bool`)**: If `true` (default), the node will automatically call `_ensure_subscriptions()` when it enters the scene tree.
*   **`Broadcaster` (`TwitchUser`)**: *Optional.* The `TwitchUser` resource for the channel whose polls you want to listen to. If left `null`, the node will attempt to fetch the currently authenticated user and use them as the broadcaster.

::: tip C# note
`TwitchPollListener` isn't a singleton in C# (there's no `.Instance`): bind it to the node you configured in the editor with `this.GetTwitcherNode<TwitchPollListener>("...")` (from `TwitcherSharp.Extensions`), the same pattern used by `TwitchEventListener` and `TwitchRedeemListener`.
:::

## Signals

This node provides signals for each key moment in a poll's lifecycle:

*   **`poll_begin(poll: TwitchPoll)`**: Emitted when a new poll is started on the channel.
*   **`poll_progress(poll: TwitchPoll)`**: Emitted each time a vote is cast, providing an updated `TwitchPoll` object with the latest vote counts.
*   **`poll_completed(poll: TwitchPoll)`**: Emitted when a poll ends because its duration ran out.
*   **`poll_terminated(poll: TwitchPoll)`**: Emitted when a poll is ended early by the broadcaster or a moderator.
*   **`poll_archived(poll: TwitchPoll)`**: Emitted when a completed or terminated poll is removed from the screen in Twitch's UI.
*   **`poll_json(poll_json: Dictionary)`**: A lower-level signal that emits the raw, unprocessed event data dictionary for any poll-related event. Useful for advanced cases or debugging.

::: tip C# note
Same names, PascalCase, as regular C# events: `PollBegin`, `PollProgress`, `PollCompleted`, `PollTerminated`, `PollArchived`, `PollJson` (all `Action<TwitchPoll>`, except `PollJson` which is `Action<Godot.Collections.Dictionary>` for the raw payload).
:::

## Methods

*   **`ensure_subscriptions() -> void`**
    *   Checks if the required EventSub subscriptions for polls (`begin`, `progress`, and `end`) exist for the configured broadcaster. If any are missing, it creates them.
    *   This is called automatically if `ensure_subscriptions_on_ready` is `true`.

::: tip C# note
`ensure_subscriptions()` → `listener.EnsureSubscriptions()`.
:::

## Usage Example

This example demonstrates how to listen to a poll, display its title and choices when it begins, and print the final results when it completes.

**1. Configure the Node in the Editor:**

*   Add a `TwitchPollListener` node to your scene.
*   In the Inspector, assign your `TwitchEventsub` and `TwitchAPI` instances.
*   Leave `Broadcaster` empty to default to the authenticated user's channel, or assign a specific `TwitchUser` resource.

**2. Connect via Script:**

::: code-group

```gdscript [GDScript]
extends Node

# Reference the listener node configured in the editor
@onready var poll_listener: TwitchPollListener = $TwitchPollListener

func _ready():
    # Connect to the lifecycle signals you care about
    poll_listener.poll_begin.connect(_on_poll_begin)
    poll_listener.poll_progress.connect(_on_poll_progress)
    poll_listener.poll_completed.connect(_on_poll_completed)
    poll_listener.poll_terminated.connect(_on_poll_terminated)

    print("Twitch Poll Listener is ready.")


# Called when a poll starts
func _on_poll_begin(poll: TwitchPoll):
    print("--- NEW POLL STARTED ---")
    print("Title: %s" % poll.title)
    print("Choices:")
    for choice in poll.choices:
        # 'choice' is a Dictionary with 'id', 'title', 'votes', etc.
        print("  - %s (ID: %s)" % [choice.title, choice.id])
    print("------------------------")


# Called each time a vote is cast
func _on_poll_progress(poll: TwitchPoll):
    print("--- POLL PROGRESSED ---")
    print("Updated Votes for '%s':" % poll.title)
    for choice in poll.choices:
        print("  - %s: %d votes" % [choice.title, choice.votes])
    print("-----------------------")


# Called when the poll timer runs out
func _on_poll_completed(poll: TwitchPoll):
    print("--- POLL COMPLETED ---")
    print("Final results for '%s':" % poll.title)
    var winning_choice = null
    var max_votes = -1
    for choice in poll.choices:
        print("  - %s: %d votes" % [choice.title, choice.votes])
        if choice.votes > max_votes:
            max_votes = choice.votes
            winning_choice = choice
    if winning_choice:
        print("Winning choice: '%s' with %d votes!" % [winning_choice.title, max_votes])
    print("----------------------")


# Called if the poll is ended early
func _on_poll_terminated(poll: TwitchPoll):
    print("--- POLL TERMINATED EARLY ---")
    print("Final results for '%s':" % poll.title)
    for choice in poll.choices:
        print("  - %s: %d votes" % [choice.title, choice.votes])
    print("---------------------------")
```

```csharp [C#]
using Godot;
using TwitcherSharp.Api.Generated.Polls;
using TwitcherSharp.Extensions;
using TwitcherSharp.Poll;

public partial class YourNode : Node
{
    // Reference the listener node configured in the editor
    private TwitchPollListener _pollListener;

    public override void _Ready()
    {
        _pollListener = this.GetTwitcherNode<TwitchPollListener>("TwitchPollListener");

        // Connect to the lifecycle signals you care about
        _pollListener.PollBegin += OnPollBegin;
        _pollListener.PollProgress += OnPollProgress;
        _pollListener.PollCompleted += OnPollCompleted;
        _pollListener.PollTerminated += OnPollTerminated;

        GD.Print("Twitch Poll Listener is ready.");
    }

    // Called when a poll starts
    private void OnPollBegin(TwitchPoll poll)
    {
        GD.Print("--- NEW POLL STARTED ---");
        GD.Print($"Title: {poll.Title}");
        GD.Print("Choices:");
        foreach (var choice in poll.Choices)
        {
            GD.Print($"  - {choice.Title} (ID: {choice.Id})");
        }
        GD.Print("------------------------");
    }

    // Called each time a vote is cast
    private void OnPollProgress(TwitchPoll poll)
    {
        GD.Print("--- POLL PROGRESSED ---");
        GD.Print($"Updated Votes for '{poll.Title}':");
        foreach (var choice in poll.Choices)
        {
            GD.Print($"  - {choice.Title}: {choice.Votes} votes");
        }
        GD.Print("-----------------------");
    }

    // Called when the poll timer runs out
    private void OnPollCompleted(TwitchPoll poll)
    {
        GD.Print("--- POLL COMPLETED ---");
        GD.Print($"Final results for '{poll.Title}':");
        TwitchPoll.TwitchChoices winningChoice = null;
        int maxVotes = -1;
        foreach (var choice in poll.Choices)
        {
            GD.Print($"  - {choice.Title}: {choice.Votes} votes");
            if (choice.Votes > maxVotes)
            {
                maxVotes = choice.Votes;
                winningChoice = choice;
            }
        }
        if (winningChoice != null)
        {
            GD.Print($"Winning choice: '{winningChoice.Title}' with {maxVotes} votes!");
        }
        GD.Print("----------------------");
    }

    // Called if the poll is ended early
    private void OnPollTerminated(TwitchPoll poll)
    {
        GD.Print("--- POLL TERMINATED EARLY ---");
        GD.Print($"Final results for '{poll.Title}':");
        foreach (var choice in poll.Choices)
        {
            GD.Print($"  - {choice.Title}: {choice.Votes} votes");
        }
        GD.Print("---------------------------");
    }
}
```

:::
