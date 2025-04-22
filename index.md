---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Twitcher"
  text: "Seamless Twitch Integration for Godot"
  tagline: Add Twitch chat, events, and API to Godot 4.4+ seamlessly.
  image:
      src: /logo.png
      alt: Twitcher Logo
  actions:
    - theme: brand
      text: Quickstart
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/kanimaru/twitcher

features:
  - icon:
      dark: /service-icon.svg
    title: Easy Setup & Use
    details: Designed for a straightforward installation with guided setup process and integration into your projects.
  - icon:
      dark: /chat-icon.svg
    title: Real-time Chat
    details: Read and write chat messages with ease.
  - icon: 
        dark: /event-icon.svg
    title: Event Handling
    details: Respond to events like follows, subscriptions, cheers (bits), channel point redemptions, and many more using signals.
  - icon: 
        dark: /auth-icon.svg
    title: Secure Authentication
    details: Includes helpers and guides for securely authenticating users via Twitch's OAuth flow and takes care that secrets are stored securely and encrypted.
  - icon: 
        dark: /api-icon.svg
    title: Flexible API Access
    details: Provides convenient methods for the complete Twitch REST Api.
  - icon:
      dark: /media-loader-icon.svg
    title: Simple use of Animated Emojis
    details: Provides easy use of animated emojis with native and external image transformer.
---

<!-- You can add more markdown content below the features if needed -->

## What is Twitcher?

Twitcher is a Godot Engine addon designed to bridge the gap between your game and the Twitch platform. Whether you want to display chat in-game, trigger events based on viewer interactions, or reward your audience, Twitcher provides the tools to make it happen directly within the Godot editor and your game's logic.

This documentation covers **Twitcher V2**, specifically for **Godot 4.4**.

## Next Steps

*   Ready to integrate? Head to the **[Getting Started](./guide/getting-started.md)** guide.