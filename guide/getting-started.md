# Getting Started

This guide will walk you through installing and setting up the Twitcher plugin in your Godot 4 project.

## Prerequisites

*   **Godot Engine:** Version 4.x is required.
*   **Twitch Account:** You need a Twitch account to interact with the API.
*   **Twitch Application:** You'll need to register an application on the [Twitch Developer Console](https://dev.twitch.tv/console) to get credentials (Client ID, potentially Client Secret) for OAuth authentication.

## Installation

1.  **Download:** Download the latest release of Twitcher from the [GitHub Releases page](https://github.com/kanimaru/twitcher/releases). Look for the `addons/twitcher` directory or a zip file containing it.
2.  **Copy:** Copy the `addons/twitcher` folder into your Godot project's root directory. If you don't have an `addons` folder, create one. Your project structure should look like this:

    ```
    your_godot_project/
    ├── addons/
    │   └── twitcher/
    │       ├── plugin.cfg
    │       └── (other plugin files...)
    ├── project.godot
    └── (your other scenes, scripts, etc.)
    ```

3.  **Enable Plugin:** Open your Godot project, go to `Project` -> `Project Settings` -> `Plugins` tab. Find "Twitcher" in the list and check the `Enable` box.

## Initial Setup

Before you can connect, you need to configure authentication. This usually involves providing your Twitch Application's Client ID and handling the OAuth flow.

See the [Authentication](authentication.md) guide for detailed steps on setting up your credentials within the plugin.

Once installed and enabled, you should be able to add the `Twitcher` node to your scenes.