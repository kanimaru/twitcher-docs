# Editor Authorization

Certain `Twitcher` features enhance the Godot editor experience, such as custom inspectors for resources (like `TwitchUser`) 
or tools that fetch data directly from Twitch to aid development. To function correctly, these features often need to 
interact with the Twitch API, requiring the editor itself to be authorized.

This editor authorization is separate from the authentication flow your end-users will experience in your final game. 
It generates a token used *only* by the Godot editor instance.

There are a few ways to authorize the editor:

## 1. During Initial Setup (via `Test Credentials`)

The most common way to authorize the editor is during the initial configuration of your Twitch application credentials:

*   As part of the [Initial Setup](/introduction/getting-started.md) or when configuring your `OAuthSetting` resource manually, you will find a **`Test Credentials`** button.
    ![Location of the Test Credentials button within the OAuthSetting resource](/editor-authorization-setup.png) _(Caption: Test Credentials button in OAuthSetting)_
*   Clicking this button performs two actions:
    1.  It validates your **Client ID** and **Client Secret**.
    2.  It initiates the OAuth authorization flow **specifically for the Godot editor**. Follow the browser prompts to grant access.
*   Upon success, a token is generated and stored internally for the editor's use.


## 2. Via `TwitchUser` Inspector

If you haven't authorized the editor via the initial setup, or if the editor's token expires, you can re-authorize when working with `TwitchUser` resources:

*   Create or assign a `TwitchUser` resource to an exported variable in one of your scripts:
    ```gdscript
    # Example script variable
    @export var user: TwitchUser
    ```
*   Select the node with this script in the Scene dock.
*   In the Inspector, find the `user` property. If the editor is not authorized, you will likely see an **`Authorize Editor`** button directly within the inspector for the `TwitchUser` resource.
    ![Authorize Editor button within the TwitchUser inspector](/editor-user-inspector-2.png) _(Caption: Authorize Editor button in TwitchUser inspector)_
*   Clicking this button triggers the same editor-specific OAuth authorization flow.


## (Optional) Specify a Custom Editor Token

By default, Twitcher manages the editor's authorization token internally. However, if you need more control or want the 
editor to use a specific pre-existing token, you can configure this:

*   Navigate to **Project -> Project Settings -> Twitcher -> Editor**.
*   Locate the **`Editor Token`** setting.
    ![Project Settings option to assign a specific Editor Token](/editor-project-setting.png) _(Caption: Editor Token setting in Project Settings)_
*   Assign an existing `OAuthToken` resource file to this setting. The editor will now use this specific token for its API calls.

**Regarding Scopes:**

It's important to note that while the editor *does* require an OAuth token to make API calls, 
this editor-specific token **does not need specific user scopes** (like `chat:read` or `channel:read:subscriptions`). 
The editor features interact only with publicly accessible Twitch API endpoints that don't require granular user permissions for the data they retrieve.
