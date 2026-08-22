# Using TwitchService

`TwitchService` is the central hub for interacting with Twitch. It acts as a high-level interface, simplifying common 
tasks by coordinating the underlying components like `TwitchAPI`, `TwitchIRC`, `TwitchEventsub`, and `TwitchAuth`.

<Badge type="tip" text="GDScript & C#" /> Every example on this page is available in both GDScript and C#: use the tabs on each code block to switch. The C# examples use [TwitcherSharp](https://github.com/Temptica/TwitcherSharp), the community-maintained .NET wrapper for Twitcher.

## Prerequisites

Before using `TwitchService`, you need to:

1.  **Add the Node:** Add a `TwitchService` node to your scene tree. It is recommended to add it to your main scene. While it can be an autoload (Singleton), adding it as a regular node helps to avoid polluting the Autoloads and allows for better testing of individual scenes. Because it uses a `.instance` pattern it is still globally accessible as long as the node is in the scene tree.
2.  **Add Child Components:** Ensure the necessary child nodes are added *under* `TwitchService` in the scene tree. Common children include:
    *   `TwitchAPI` (for API calls)
    *   `TwitchAuth` (for handling authentication)
    *   `TwitchIRC` (for chat read/write via IRC)
    *   `TwitchEventsub` (for subscribing to events like follows, subs)
    *   `TwitchMediaLoader` (for emotes, badges, etc.)
3.  **Configure in Inspector:** Select the `TwitchService` node in the Godot editor. In the Inspector panel, you **must** assign the required resources:
    *   `Oauth Setting`: A `OAuthSetting` resource containing your Client ID, Client Secret, and Redirect URI.
    *   `Scopes`: An `OAuthScopes` resource defining the permissions your application needs.
    *   `Token`: An `OAuthToken` resource where the user's access token will be stored after authentication.

::: tip C# note
In C#, `TwitchService.instance` from GDScript becomes the static property `TwitchService.Instance`. It returns the existing node if one is already in the scene, or `null` if none exists yet: call `TwitchService.CreateInstance()` to add one at the scene root from code instead of placing it in the editor.
:::

## Initial Setup and Authentication

The most crucial first step after getting the instance is to run the setup process, which includes authentication.

::: code-group

```gdscript [GDScript]
extends Node

# Assume you have created a TwitchService node in your scene

func _ready():
    # Start the setup process (handles authentication)
    # Returns true on success, false on failure (e.g., login run in timeout)
    var setup_successful: bool = await TwitchService.instance.setup()

    if setup_successful:
        print("Twitch Service successfully set up and authenticated!")
        # Now you can proceed with other Twitch interactions
        await get_self_info()
    else:
        printerr("Twitch Service setup failed. Check authentication.")

# Example function called after successful setup
func get_self_info():
    var current_user: TwitchUser = await TwitchService.instance.get_current_user()
    if current_user:
        print("Authenticated as: %s (ID: %s)" % [current_user.display_name, current_user.id])
    else:
        printerr("Could not get current user info.")
```

```csharp [C#]
using Godot;
using TwitcherSharp;

public partial class YourNode : Node
{
    // Assume you have created a TwitchService node in your scene

    public override async void _Ready()
    {
        // Start the setup process (handles authentication)
        // Returns true on success, false on failure (e.g., login run in timeout)
        bool setupSuccessful = await TwitchService.Instance.Setup();

        if (setupSuccessful)
        {
            GD.Print("Twitch Service successfully set up and authenticated!");
            // Now you can proceed with other Twitch interactions
            await GetSelfInfo();
        }
        else
        {
            GD.PrintErr("Twitch Service setup failed. Check authentication.");
        }
    }

    // Example function called after successful setup
    private async Task GetSelfInfo()
    {
        var currentUser = await TwitchService.Instance.GetCurrentUser();
        if (currentUser != null)
        {
            GD.Print($"Authenticated as: {currentUser.DisplayName} (ID: {currentUser.Id})");
        }
        else
        {
            GD.PrintErr("Could not get current user info.");
        }
    }
}
```

:::

## Common Usage Examples

Here are simple examples for common tasks, assuming setup() has completed successfully

### Getting User Information

::: code-group

```gdscript [GDScript]
func _get_user_details(username: String) -> void:
    # Get user info by login name
    var user: TwitchUser = await TwitchService.instance.get_user(username)
    if user:
        print("User found: %s, ID: %s, Profile Image URL: %s" % [user.display_name, user.id, user.profile_image_url])

        # You can then load the profile image (requires TwitchMediaLoader child)
        var profile_texture: ImageTexture = await TwitchService.instance.load_profile_image(user)
        if profile_texture:
            $YourSprite2D.texture = profile_texture # Assign to a Sprite2D, TextureRect etc.
    else:
        print("User '%s' not found." % username)
```

```csharp [C#]
private async Task GetUserDetails(string username)
{
    // Get user info by login name
    var user = await TwitchService.Instance.GetUser(username);
    if (user != null)
    {
        GD.Print($"User found: {user.DisplayName}, ID: {user.Id}, Profile Image URL: {user.ProfileImageUrl}");

        // You can then load the profile image (requires TwitchMediaLoader child)
        var profileTexture = await TwitchService.Instance.GetProfileImage(user);
        if (profileTexture != null)
        {
            YourSprite2D.Texture = profileTexture; // Assign to a Sprite2D, TextureRect etc.
        }
    }
    else
    {
        GD.Print($"User '{username}' not found.");
    }
}
```

:::

### Sending Chat Messages

::: code-group

```gdscript [GDScript]
func send_hello_message():
    var me = await TwitchService.instance.get_current_user()
    # Requires 'chat:read' and 'chat:edit' scopes
    print("Sending 'Hello from Godot!' to channel ID: %s" % me.id)
    TwitchService.chat("Hello from Godot!")
```

```csharp [C#]
private async Task SendHelloMessage()
{
    var me = await TwitchService.Instance.GetCurrentUser();
    // Requires 'chat:read' and 'chat:edit' scopes
    GD.Print($"Sending 'Hello from Godot!' to channel ID: {me.Id}");
    TwitchService.Instance.Chat("Hello from Godot!");
}
```

:::

### Adding Chat Commands

::: code-group

```gdscript [GDScript]
func _ready():
    # Wait for setup first...
    var setup_successful = await TwitchService.instance.setup()
    if setup_successful:
        # Add a command handler for "!hello"
        TwitchService.instance.add_command("hello", _on_hello_command)
        print("Registered !hello command.")
    else:
        printerr("Setup failed, cannot add command.")

# Callback function for the command
func _on_hello_command(from_username: String, info: TwitchCommandInfo, args: PackedStringArray):
    print("Received !hello command from %s" % info.user_display_name)
    TwitchService.chat("Hi there, %s!" % info.user_display_name)
```

```csharp [C#]
public override async void _Ready()
{
    // Wait for setup first...
    bool setupSuccessful = await TwitchService.Instance.Setup();
    if (setupSuccessful)
    {
        // Add a command handler for "!hello"
        TwitchService.Instance.AddCommand("hello",
            Callable.From<string, TwitchCommandInfo, string[]>(OnHelloCommand));
        GD.Print("Registered !hello command.");
    }
    else
    {
        GD.PrintErr("Setup failed, cannot add command.");
    }
}

// Callback function for the command
private void OnHelloCommand(string fromUsername, TwitchCommandInfo info, string[] args)
{
    GD.Print($"Received !hello command from {info.Username}");
    TwitchService.Instance.Chat($"Hi there, {info.Username}!");
}
```

:::

::: tip C# note
`AddCommand` also has an overload that takes a `TwitchCommand` object directly (`TwitchService.Instance.AddCommand(command)`), which is generally the more idiomatic way to register commands from C#; see the [Commands](/commands/overview) section for details and a `CommandReceived` event example.
:::

### Subscribing to Events (EventSub)
(Requires `TwitchEventsub` child node)

::: code-group

```gdscript [GDScript]
# Example: Subscribe to follows on your channel
func subscribe_to_follows():
    # Ensure EventSub is connected first
    await TwitchService.instance.wait_for_eventsub_connection()

    var me = await TwitchService.instance.get_current_user()
	
	TwitchService.instance.subscribe_event(TwitchEventsubDefinition.CHANNEL_FOLLOW, {
		&"broadcaster_user_id": me.id,
		&"moderator_user_id": me.id
	})

    # Now, connect to the signal on the TwitchEventsub node itself
    # to receive the actual event notifications.
    TwitchService.instance.eventsub.event_received.connect(_on_eventsub_event)


func _on_eventsub_event(event_data: Dictionary):
    if event_data.subscription.type == "channel.follow":
        var follower_name = event_data.user_name
        print("New follower: %s!" % follower_name)
```

```csharp [C#]
using TwitcherSharp.EventSub;
using TwitcherSharp.EventSub.Generated.ChannelFollow;

// Example: Subscribe to follows on your channel
private async Task SubscribeToFollows()
{
    // Ensure EventSub is connected first
    await TwitchService.Instance.WaitForEventSubConnection();

    var me = await TwitchService.Instance.GetCurrentUser();

    var condition = new TwitchChannelFollowCondition(broadcasterUserId: me.Id, moderatorUserId: me.Id);
    TwitchService.Instance.SubscribeEvent(TwitchEventSubDefinition.ChannelFollow, condition);

    // Now, connect to the signal on the TwitchEventSub node itself
    // to receive the actual event notifications.
    TwitchEventSub.Instance.Event += OnEventSubEvent;
}

private void OnEventSubEvent(string type, Godot.Collections.Dictionary data)
{
    if (type == "channel.follow")
    {
        var followerName = data["user_name"].AsString();
        GD.Print($"New follower: {followerName}!");
    }
}
```

:::

::: tip C# note
Unlike GDScript, `SubscribeEvent` takes a strongly-typed condition object (here `TwitchChannelFollowCondition`) instead of a raw `Dictionary`, so mismatched or missing condition keys are caught at compile time. Handling the raw `Event` signal like above works, but for most cases the typed `TwitchEventListener<T>` is easier: it gives you a `TwitchChannelFollowEvent` object instead of a raw dictionary. See [TwitchEventListener](/core-nodes/twitch-event-listener) for that pattern.
:::
