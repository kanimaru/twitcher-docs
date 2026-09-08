# EventSub Editor Helper

Twitcher includes a convenient visual tool within the editor designed to simplify the process of configuring Twitch EventSub subscriptions for your project.

Instead of manually referencing Twitch documentation for every parameter, this helper allows you to:

*   **Browse Available Subscriptions:** Easily see a list of the different EventSub subscription types supported by Twitch.
*   **Understand Requirements:** Selecting a subscription type instantly shows you the specific `condition` parameters 
    required for that event (e.g., `broadcaster_user_id`, `user_id`). This helps ensure you provide the necessary information for a subscription to be valid.
*   **Access Official Docs Quickly:** Provides direct links to the relevant page on the official Twitch Developer documentation
    for comprehensive details about each subscription type, versioning, and payload structure.
*   **Streamline Configuration:** Helps you add the necessary subscriptions correctly (likely by modifying the properties
    of an associated `TwitchEventsub` node or resource directly within the Godot Inspector).

This significantly speeds up the setup process and reduces the chance of errors when defining which Twitch events your application needs to listen to.

::: tip Optional and mutually-exclusive conditions
Some subscription types list more condition fields than you're expected to fill in all at once. For example
[`channel.raid`](https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/#channelraid) accepts either
`from_broadcaster_user_id` or `to_broadcaster_user_id`, never both. Leave the ones you don't need blank in the
Inspector (or omit them from the `condition` dictionary in code) — they're left out of the actual subscription
request rather than being sent as empty values, which Twitch would otherwise reject.
:::

The full list of subscription types and their conditions in `TwitchEventsubDefinition` is generated directly from
Twitch's documentation — the same approach used for the [TwitchAPI](/core-nodes/twitch-api) node — so it stays in
sync as Twitch adds or updates EventSub subscription types.

![Using the EventSub Editor Helper to configure subscriptions](/editor-eventsub.gif)
_(Caption: Using the EventSub Editor Helper to browse types, view conditions, and access documentation)_

## Scope Validation Helper

In addition to the selector, Twitcher includes a basic validation feature to help identify potential scope issues, 
particularly concerning **EventSub subscriptions**.

![editor-scope-validation.png](/editor-scope-validation.png)

*   **Context:** This validation typically checks the configuration of your `TwitchEventsub` node.
*   **Function:** It attempts to correlate the EventSub subscriptions you intend to use with the scopes you have
    selected in your `OAuthScopes` resource. If it detects a potential mismatch (e.g., trying to subscribe to an event without a necessary scope), it displays a hint.
*   **Limitations:** Please be aware that this validation is **a helper and not perfect**. Due to the complexity and
    occasional ambiguities in Twitch's documentation regarding scope requirements (especially for events requiring *one of several* 
    possible scopes, like [`channel.moderate`](https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/#channelmoderate)), 
    the validation might sometimes suggest more scopes than are strictly necessary for a specific combination. 
    However, it aims to err on the side of caution, ensuring you don't have *too few* scopes enabled.

Always treat this validation as a helpful guide, but double-check the official Twitch documentation for definitive scope requirements for the specific API calls and EventSub subscriptions your application relies on.