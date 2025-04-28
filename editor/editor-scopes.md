# OAuth Scope Selector Helper

Selecting the correct OAuth permissions (scopes) is critical for interacting with the Twitch API. Twitcher provides a
dedicated helper directly within the Godot editor to make this process easier and less error-prone.

When editing an `OAuthScopes` resource in the Inspector, you'll find this tool which:

*   **Lists All Available Scopes:** Presents a comprehensive checklist of every scope defined by Twitch, ensuring you don't miss any or have to figure out how it is named.
*   **Provides In-Editor Descriptions:** Simply hover your mouse over any scope name in the list to instantly see a tooltip explaining exactly what permission that scope grants. This description is sourced directly from the official Twitch documentation.

This visual selector with integrated descriptions helps you choose the permissions your application 
requires without needing to constantly cross-reference external documentation, saving time and preventing errors.

![Selecting scopes and viewing descriptions on hover within the OAuthScopes resource](/editor-scopes.png)
_(Caption: Selecting scopes and viewing descriptions on hover within the OAuthScopes resource)_