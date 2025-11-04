# TwitchRedeemListener Node

The `TwitchRedeemListener` is a high-level node that simplifies listening to specific channel point redemptions from your viewers.

## Overview

This node acts as an intelligent filter for channel point redemptions. Instead of listening to raw EventSub data and 
manually processing it, you tell this node which rewards you care about.

Its workflow is as follows:
1.  **Automatic Subscription:** It automatically checks for and creates the necessary EventSub subscriptions (`channel.channel_points_custom_reward_redemption.add` and `...update`) to receive redemption events.
2.  **Filtering:** When a redemption event occurs, it checks if the redeemed reward's ID matches one of the `TwitchReward` resources you've configured in the `rewards_to_listen` array. All other redemptions are ignored.
3.  **Data Fetching:** For matching redemption, it automatically uses the `TwitchAPI` to fetch the `TwitchUser` objects for the broadcaster and the viewer who redeemed the reward.
4.  **Object Creation:** It creates a new, fully configured `TwitchRedemption` object, populating it with all the relevant data and wiring up its internal `fullfill()` and `cancel()` methods to the correct API calls.
5.  **Signal Emission:** Finally, it emits the `redeemed` signal, passing this ready-to-use `TwitchRedemption` object to your script.

This process abstracts away nearly all the boilerplate code, letting you focus directly on your logic.

## Prerequisites

1.  **Add the Node:** Add a `TwitchRedeemListener` node to your scene.
2.  **Dependencies:** Ensure instances of `TwitchEventsub` and `TwitchAPI` are available or assigned this manually to the node's properties. This can also be handled by placing it under a configured `TwitchService` node.
3.  **Create `TwitchReward` Resources:** For each channel point reward you want to listen to, you must create a `TwitchReward` resource file (`.tres`) or download the existing one from the Twitch via the Setup Wizard under utilities tab.

## Configuration (Inspector Properties)

*   **`Rewards To Listen` (`Array[TwitchReward]`)**: **Required.** This is the core configuration. Drag your pre-made `TwitchReward` resource files into this array. The listener will *only* process redemptions for rewards whose IDs are present in this list.
*   **`Eventsub` (`TwitchEventsub`)**: **Required.** The `TwitchEventsub` instance used to receive raw redemption events. (will be automatically assigned if it's in the scene tree)
*   **`Api` (`TwitchAPI`)**: **Required.** The `TwitchAPI` instance used to fetch user data and update the status of redemptions. (will be automatically assigned if it's in the scene tree)
*   **`Ensure Subscriptions On Ready` (`bool`)**: If `true` (default), the node will automatically call `ensure_subscriptions()` when it enters the scene tree, making sure it's ready to receive events.

## Signals

*   **`redeemed(redemption: TwitchRedemption)`**
    *   The primary output signal of this node.
    *   Emitted when a viewer redeems a channel point reward that is included in the `rewards_to_listen` array.
    *   `redemption`: A fully constructed `TwitchRedemption` object, ready for you to inspect, connect to, and act upon.

## Methods

*   **`ensure_subscriptions() -> void`**
    *   Checks if the required EventSub subscriptions for redemptions (`add` and `update`) exist for the current user. If not, it creates them.
    *   This is called automatically if `ensure_subscriptions_on_ready` is `true`. You can call it manually if you need to re-verify or establish the subscriptions at a different time.
    *   **Note:** This is an `async` function.

## Usage Example

**1. Create a `TwitchReward` Resource:**

*   In the FileSystem dock, right-click -> New Resource...
*   Search for and select `TwitchReward`, then click Create. Save it (e.g., `res://rewards/spawn_monster_reward.tres`).
*   Select the new resource file. In the Inspector, set the data and save it to twitch.

**2. Configure the Listener in the Editor:**

*   Add a `TwitchRedeemListener` node to your scene.
*   In the Inspector for the node:
    *   In the `Rewards To Listen` array property, increase the size to 1.
    *   Drag your `spawn_monster_reward.tres` file from the FileSystem dock into the new element slot in the array.

**3. Connect via Script:**

```gdscript
extends Node

# Reference the listener node configured in the editor
@onready var redeem_listener: TwitchRedeemListener = $TwitchRedeemListener


func _ready():
    # Connect to the listener's signal
    redeem_listener.redeemed.connect(_on_reward_redeemed)
    print("Ready to listen for specific reward redemptions!")


# This function is called ONLY when a reward from the 'rewards_to_listen' array is redeemed.
func _on_reward_redeemed(redemption: TwitchRedemption):
    print("'%s' was redeemed by '%s'!" % [redemption.reward.title, redemption.user.display_name])

    # Connect to the redemption object's signals for confirmation callbacks
    redemption.fullfilled.connect(
        func():
            print("CONFIRMED: Redemption for '%s' was fulfilled." % redemption.reward.title)
    )

    # Now, handle the game logic based on the reward
    match redemption.reward.title:
        "Spawn a Monster": # Better to check against the reward resource directly but for the example its the title
            # If the reward requires user input for the monster's name
            var monster_name = redemption.user_input
            if monster_name == "":
                monster_name = "%s's Monster" % redemption.user.display_name

            spawn_monster(monster_name)

            # After the game action is complete, fulfill the redemption on Twitch
            print("Fulfilling the redemption on Twitch...")
            await redemption.fullfill()

        # Handle other configured rewards here...
        _:
            print("Unhandled reward: %s. Canceling." % redemption.reward.title)
            await redemption.cancel()


# Placeholder for your actual game logic
func spawn_monster(name: String):
    print("  -> Spawning a monster named '%s' into the game!" % name)