# Getting Started

This guide will walk you through installing and setting up the Twitcher plugin in your Godot 4 project.

## Prerequisites

*   **Godot Engine:** Version 4.4 is required.
*   **Twitch Account:** You need a Twitch account to interact with the API.
*   **Twitch Application:** You'll need to register an application on the [Twitch Developer Console](https://dev.twitch.tv/console) to get credentials (Client ID, potentially Client Secret) for OAuth authentication.

![create-credentials.gif](/create-credentials.gif)
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

## Editor Configuration

To get started with Twitcher, you first need to run the **Setup**. 
This tool guides you through configuring the essential authentication settings required both for editor tools and 
your final application.


1.  **Launch the Setup:**
    *   Navigate to **Project -> Tools -> Twitcher Setup** within the Godot editor. (In case you closed the Setup window)

2.  **Select Scopes:**
    *   The first step involves selecting the permissions (OAuth scopes) your application needs to interact with the Twitch API.
    *   There are 2 presets to choose from. Overlay that selects the typical Scopes you need for an overlay like receiving follows, bits, subscriptions, chat etc.
        The other one is Game that you need for the basic games like chat reading, writing, etc.
    *   You can change the scopes at any point in time or adjust them like you want. Consult the [Twitch API documentation](https://dev.twitch.tv/docs/authentication/scopes/) if you're unsure which scopes your specific features require.
    *   This configures the necessary `OAuthScopes` resource for your project.
        ![Setup: Scope Selection Step](/quickstart-setup-1.png) _(Select the required permissions (scopes) in the Setup)_

3.  **Enter Credentials:**
    *   The next step requires you to enter your Twitch Application's credentials.
    *   Input your **Client ID** and **Client Secret**, which you can get from your application settings on the [Twitch Developer Console](https://dev.twitch.tv/console).
    *   Ensure the **Redirect URI** shown or entered matches the one configured in your Twitch Developer Console exactly.
    *   This configures the necessary `OAuthSetting` resource.
        ![Setup: Credentials Entry Step](/quickstart-setup-2.png) _(Enter your Client ID, Client Secret, and Redirect URI)_
    *   In the end please press the `Test Credentials` button to authorize the *Godot editor* itself. This allows Twitcher's 
        editor tools and integrations (like custom inspectors or resource previews) to function correctly during 
        development by accessing the Twitch API when needed. Follow the browser prompts to grant access.

4.  **Completion:** Once you complete the setup, Twitcher's core authentication settings (`OAuthScopes`, `OAuthSetting` resources) will be configured, and the editor should be authorized.

Your development environment is now set up!
You can begin adding Twitcher nodes (like `TwitchService`, `TwitchChat`, etc.) to your scenes and using their features.