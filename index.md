---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Twitcher for Godot"
  text: "Seamless Twitch Integration"
  tagline: Connect your Godot overlay or game to Twitch. Integrate chat, events (follows, subs, bits, rewards etc.) and use Twitch API with ease. Built for Godot 4.x.
  image:
      src: /images/logo.png
      alt: Twitcher Logo
  actions:
    - theme: brand
      text: Home
      link: /
    - theme: alt
      text: Docs
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/kanimaru/twitcher

features:
  - icon:
      dark: images/service-icon.svg
    title: Easy Setup & Use
    details: Designed for a straightforward installation with guided setup process and integration into your projects.
  - icon:
      dark: images/chat-icon.svg
    title: Real-time Chat
    details: Read and write chat messages with ease.
  - icon: 
        dark: images/event-icon.svg
    title: Event Handling
    details: Respond to events like follows, subscriptions, cheers (bits), channel point redemptions, and many more using signals.
  - icon: 
        dark: images/auth-icon.svg
    title: Secure Authentication
    details: Includes helpers and guides for securely authenticating users via Twitch's OAuth flow and takes care that secrets are stored securely and encrypted.
  - icon: 
        dark: images/api-icon.svg
    title: Flexible API Access
    details: Provides convenient methods for the complete Twitch REST Api.
  - icon:
      dark: images/media-loader-icon.svg
    title: Simple use of Animated Emojis
    details: Provides easy use of animated emojis with native and external image transformer.
---

<!-- You can add more markdown content below the features if needed -->

## What is Twitcher?

Twitcher is a Godot Engine addon designed to bridge the gap between your game and the Twitch platform. Whether you want to display chat in-game, trigger events based on viewer interactions, or reward your audience, Twitcher provides the tools to make it happen directly within the Godot editor and your game's logic.

This documentation covers **Twitcher v2**, specifically for **Godot 4.x**.

## Next Steps

*   Ready to integrate? Head to the **[Getting Started](./guide/getting-started.md)** guide.