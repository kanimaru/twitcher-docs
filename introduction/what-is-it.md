# What is this?

`Twitcher` is a Godot Engine addon designed to bridge the gap between your overlay or game and the Twitch platform. 
Whether you want to display chat, trigger events based on viewer interactions, or reward your audience, 
Twitcher provides the tools to make it happen directly within the Godot editor and your overlay / game's logic.

List of all nodes that are used in the most use cases.

## TwitchService
![service-icon.svg](/service-icon.svg)

`TwitchService` is the central hub for interacting with Twitch. It acts as a high-level interface, simplifying common
tasks by coordinating the underlying components like `TwitchAPI`, `TwitchChat`, `TwitchEventsub`, `TwitchAuth` and `TwitchIRC`.

## TwitchAPI
![api-icon.svg](/api-icon.svg)

The `TwitchAPI` node is the central component for making authenticated calls to the Twitch Helix REST API.
It handles the necessary headers, authentication tokens, and provides a foundation for interacting with various API endpoints.

## TwitchAuth
![auth-icon.svg](/auth-icon.svg)

`TwitchAuth` manages the entire authorization process using various OAuth grant types and ensures your access token remains active through automatic refreshing.

**Supported OAuth Flows:**

*   **Authorization Code Grant Flow:** Ideal for applications with a secure backend capable of protecting the Client Secret. 
    This flow obtains a **user access token**, allowing your application to perform actions on behalf of the authenticated user.
    *   *Example Use Cases:* Overlays, chatbots requiring user-specific actions.

*   **Client Credentials Grant Flow:** Used for tools that operate independently without direct user authorization. 
    This flow obtains an **app access token**, suitable for accessing public Twitch API endpoints or performing actions not tied to a specific user account.
    *   *Example Use Cases:* Backend services fetching general stream information, automated bots performing non-user-specific tasks.

*   **Device Authorization Grant Flow:** Designed for devices with limited input capabilities (e.g., game consoles, 
    smart TVs, CLI tools) or applications unable to securely store a Client Secret. The user authorizes the application 
    via a browser on a separate device (like a PC or phone). This flow obtains a **user access token**.
    *   *Example Use Cases:* Godot games running on itch, consoles or PC, distributed desktop applications needing Twitch integration.

*   **Implicit Grant Flow:** **(Deprecated & Not Recommended)** Previously common for client-side-only applications 
    (like pure JavaScript websites). This flow is considered insecure because the access token is exposed directly to 
    the client (e.g., in the URL). Twitch strongly advises against using this flow for new applications due to security 
    risks. Prefer the Authorization Code Flow or the Device Authorization Flow instead.
    *   *Example Use Cases:* Avoid for new development.

## TwitchChat
![chat-icon.svg](/chat-icon.svg)

The `TwitchChat` node provides an easy way to interact with a Twitch channel's chat. It handles receiving chat messages 
for a designated `broadcaster_user` via Twitch EventSub and allows sending messages as a specific sender_user 
(or the authenticated user by default) using the Twitch API. It requires a configured `TwitchEventsub`, `TwitchAPI`, 
and `TwitchMediaLoader` nodes to function correctly.

## TwitchCommand
![command-icon.svg](/command-icon.svg)

The `TwitchCommand` node represents a single, specific chat command (like `!hello` or `!lurk`). 
It listens for chat messages (and optionally whispers) via a linked `TwitchEventsub` node. 
When a message matches its configured command name (or one of its `aliases`), starts with a recognized prefix (like `!`), 
meets permission requirements (`PermissionFlag`), argument count (`args_min`, `args_max`), and originates from the 
correct location (`WhereFlag`), it emits a `command_received` signal. If the command matches but fails validation 
(wrong args, permissions), it emits `received_invalid_command`.

## TwitchEventListener
![event-icon.svg](/event-icon.svg)

The `TwitchEventListener` node acts as a focused signal emitter for a single *specific type* of Twitch EventSub event 
(like follows, subs, cheers, etc.). You configure it to listen for one event type defined in `TwitchEventsubDefinition.Type`. 
It connects to a main `TwitchEventsub` node and filters the events, emitting its own received signal only when the designated event type occurs. 
**Crucially, it requires that the subscription for this event type has already been established** (either automatically or manually) in the linked `TwitchEventsub` node.

## TwitchMediaLoader
![media-loader-icon.svg](/media-loader-icon.svg)

`TwitchMediaLoader` is responsible for downloading, caching (both to disk and in memory), and providing access to 
various Twitch visual assets like emotes, badges, cheermotes, and user profile pictures. It interacts with the 
`TwitchAPI` to fetch metadata, uses an internal HTTP client to download image data, and leverages a configurable 
`TwitchImageTransformer` to convert raw image data (including potential animations like GIFs) into Godot-usable 
`SpriteFrames` or `ImageTexture` resources. It aims to minimize redundant downloads by utilizing disk cache directories 
and provides fallback textures for missing assets.

## TwitchIRC
![chat-icon.svg](/chat-icon.svg)

TwitchIRC connects to IRC chat servers using WebSockets. It handles authentication, 
joining/leaving channels, sending chat messages (with rate limiting), and receiving various IRC messages and events 
(like chat messages, joins, parts, notices, user state changes, whispers). It parses these raw IRC messages and emits 
corresponding signals with structured data (using TwitchTags helper classes) for easier handling. **However, this node is 
marked as deprecated because Twitch plans to phase out IRC functionality in favor of EventSub-based solutions.**

## TwitchIrcChannel
![chat-icon.svg](/chat-icon.svg)

`TwitchIrcChannel` acts as a dedicated interface for interacting with a *single specific* Twitch channel via the underlying 
(deprecated) `TwitchIRC` system. It filters messages and state updates received from a main `TwitchIRC` node 
(accessed via `TwitchService`) and emits signals only for events relevant to its assigned `channel_name`. It provides a 
simplified `chat()` method scoped to its channel and tracks its own join status. **This node is useful primarily when 
managing connections to multiple IRC channels simultaneously but is also deprecated due to its reliance on the outgoing Twitch IRC system.**