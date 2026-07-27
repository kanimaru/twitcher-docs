# TwitchMediaLoader Node

The `TwitchMediaLoader` node handles the fetching, caching, and loading of Twitch visual media assets, such as emotes, 
badges, cheermotes, and user profile images, making them readily available for use in your Godot project as 
`SpriteFrames` or `ImageTexture`.

## Overview

This node acts as a central manager for Twitch's visual elements. Its primary functions are:

1.  **Fetching Metadata:** Uses an assigned `TwitchAPI` instance to get information about available global/channel emotes, badges, and cheermotes.
2.  **Downloading:** Downloads the actual image data from Twitch's CDN (`static-cdn.jtvnw.net` by default).
3.  **Caching:**
    *   Saves downloaded raw image data to specified disk cache directories (`user://emotes`, `user://badges`, etc.).
    *   Saves converted `SpriteFrames` or `ImageTexture` as `.res` files in the same cache directories.
    *   Leverages Godot's `ResourceLoader` cache for efficient in-memory access once loaded.
4.  **Conversion:** Uses an associated `TwitchImageTransformer` (especially important for animated emotes/cheermotes) to convert the downloaded data into Godot `SpriteFrames`.
5.  **Providing Assets:** Offers asynchronous methods to request specific assets, returning the corresponding `SpriteFrames` or `ImageTexture`.
6.  **Fallbacks:** Provides configurable fallback textures for cases where an asset cannot be loaded.

The goal is to efficiently manage these assets, reducing redundant downloads and providing easy access within your game logic or UI.

## Prerequisites

1.  **Add the Node:** Add a `TwitchMediaLoader` node to your scene, often as a child of `TwitchService`. While it can be an autoload/singleton, adding it as a regular node is preferred to avoid polluting the global namespace.
2.  **API Dependency:** Assign a configured `TwitchAPI` instance to the `Api` property in the Inspector. When you just have one `TwitchAPI` node in your scene it will assign it automatically.
3.  **Image Transformer:** Ensure the `Image Transformer` property is assigned, especially if you need support for animated emotes or cheermotes use `NativeImageTransformer` or `MagicImageTransformer` see also [TwitchMediaLoader](twitch-media-loader.md)

## Configuration (Inspector Properties)

*   **`Api` (`TwitchAPI`)**: **Required.** The `TwitchAPI` instance used to fetch metadata about emotes, badges, etc.
*   **`Image Transformer` (`TwitchImageTransformer`)**: *Recommended.* The image transformer node used to convert downloaded image data (especially animated GIFs) into `SpriteFrames`. If not set or not supporting animation, animated assets might be loaded as static images.
*   **`Fallback Texture` (`Texture2D`)**: A default texture used when a requested emote, badge, or cheermote cannot be loaded.
*   **`Fallback Profile` (`Texture2D`)**: A default texture used when a user's profile image cannot be loaded.
*   **`Image Cdn Host` (`String`)**: The base URL for Twitch's static asset CDN. Defaults to `https://static-cdn.jtvnw.net`.
*   **`Cache Emote` (`String`, global dir)**: The directory path where emote data and `.res` files will be cached.
*   **`Cache Badge` (`String`, global dir)**: The directory path where badge data and `.res` files will be cached.
*   **`Cache Cheermote` (`String`, global dir)**: The directory path where cheermote data and `.res` files will be cached.

## Signals

*   **`emoji_loaded(definition: TwitchEmoteDefinition)`**
    *   Emitted after an emote corresponding to the given `TwitchEmoteDefinition` has been successfully downloaded, converted, and cached. This signals that the `SpriteFrames` resource is now available via `ResourceLoader` or subsequent `get_emotes*` calls.

## Key Public Methods

**Note:** Most methods that involve fetching data from the API or downloading images are `async` and **must** be called with `await`.

### Emotes

*   **`preload_emotes(channel_id: String = "global") -> void`**
    *   Fetches the *metadata* (definitions) for global emotes (`channel_id = "global"`) or a specific channel's emotes via the `TwitchAPI`. Caches this metadata internally. Does not download the actual images.
*   **`get_cached_emotes(channel_id: String) -> Dictionary`**
    *   Returns the cached *metadata* dictionary for the specified channel ID (or "global"). If metadata isn't cached, it implicitly calls and awaits `preload_emotes`.
*   **`get_emotes(emote_ids: Array[String]) -> Dictionary[String, SpriteFrames]`**
    *   Downloads (if not cached), converts, and returns `SpriteFrames` for a list of emote IDs.
    *   Returns a Dictionary where keys are the requested emote IDs (String) and values are the corresponding `SpriteFrames`. Uses fallback texture if loading fails.
*   **`get_emotes_by_definition(emote_definitions: Array[TwitchEmoteDefinition]) -> Dictionary[TwitchEmoteDefinition, SpriteFrames]`**
    *   Downloads (if not cached), converts, and returns `SpriteFrames` for a list of `TwitchEmoteDefinition` objects. This allows specifying theme, type (static/animated), and scale.
    *   Returns a Dictionary where keys are the requested `TwitchEmoteDefinition` objects and values are the corresponding `SpriteFrames`. Uses fallback texture if loading fails.

### Badges

*   **`preload_badges(channel_id: String = "global") -> void`**
    *   Fetches the *metadata* (definitions) for global badges (`channel_id = "global"`) or a specific channel's badges via the `TwitchAPI`. Caches this metadata internally.
*   **`get_cached_badges(channel_id: String) -> Dictionary`**
    *   Returns the cached badge *metadata* dictionary for the specified channel ID (or "global"). If metadata isn't cached, it implicitly calls and awaits `preload_badges`. Structure is nested based on badge set ID and version ID.
*   **`get_badges(badges: Array[TwitchBadgeDefinition]) -> Dictionary[TwitchBadgeDefinition, SpriteFrames]`**
    *   Downloads (if not cached), converts, and returns `SpriteFrames` for a list of `TwitchBadgeDefinition` objects (specifying channel, set, version, scale).
    *   Returns a Dictionary where keys are the requested `TwitchBadgeDefinition` objects and values are the corresponding `SpriteFrames`. Uses fallback texture if loading fails.

### Cheermotes

*   **`preload_cheemote() -> void`**
    *   Fetches the *metadata* for all available Cheermotes (prefixes, tiers, image URLs) via the `TwitchAPI`. Caches this metadata internally.
*   **`all_cheermotes() -> Array[TwitchCheermote]`**
    *   Returns an array containing the cached `TwitchCheermote` metadata objects. Implicitly calls `preload_cheemote` if needed.
*   **`get_cheer_info(cheermote_definition: TwitchCheermoteDefinition) -> CheerResult`**
    *   Gets the `SpriteFrames` and associated metadata (`TwitchCheermote`, `TwitchCheermote.Tiers`) for a *specific tier* of a Cheermote defined by `TwitchCheermoteDefinition`. Downloads/converts if necessary.
    *   Returns a `CheerResult` object containing the data, or `null` if not found.
*   **`find_cheer_tier(number: int, cheer_data: TwitchCheermote) -> TwitchCheermote.Tiers`**
    *   A utility function to find the correct `TwitchCheermote.Tiers` object within a `TwitchCheermote` metadata object that corresponds to a given cheer amount (`number`). Does not require `await`.
*   **`get_cheermotes(cheermote_definition: TwitchCheermoteDefinition) -> Dictionary[TwitchCheermote.Tiers, SpriteFrames]`**
    *   Downloads (if not cached), converts, and returns `SpriteFrames` for *all tiers* associated with a given `TwitchCheermoteDefinition` (uses the prefix, theme, type, scale from the definition).
    *   Returns a Dictionary where keys are `TwitchCheermote.Tiers` objects and values are the corresponding `SpriteFrames`.

### User Profile Images

*   **`load_profile_image(user: TwitchUser) -> ImageTexture`**
    *   Downloads (if not cached) and returns the profile image for the given `TwitchUser` object as an `ImageTexture`. Uses the `profile_image_url` from the user object.
    *   Returns the loaded `ImageTexture` or the `fallback_profile` texture on failure.

### Utilities

*   **`load_image(url: String) -> Image`**
    *   A generic function to download an image from any URL and return it as a Godot `Image` object. Primarily for internal use or custom needs.

## Caching Behavior

`TwitchMediaLoader` employs a multi-level caching strategy:
1.  **API Metadata Cache:** Fetched definitions for emotes, badges, and cheermotes are stored in internal dictionaries.
2.  **Disk Cache (Raw Data):** When an image is downloaded, the raw data (PNG, JPG, GIF) is saved to the corresponding cache directory specified in the Inspector (`user://emotes/`, etc.) based on its definition (ID, scale, theme, etc.).
3.  **Disk Cache (Resource):** After conversion, the resulting `SpriteFrames` or `ImageTexture` is saved as a Godot resource file (`.res`) in the same cache directory.
4.  **Memory Cache:** Godot's `ResourceLoader` automatically caches loaded resources (`.res` files). Subsequent requests for the same cached resource path will retrieve it directly from memory, avoiding disk reads or redownloads.

This ensures that assets are downloaded only once and subsequent loads are significantly faster. The cache persists between application runs as it uses the `user://` directory.

## Usage Example

```gdscript
extends Node

@onready var media_loader: TwitchMediaLoader = $Path/To/MediaLoader
@onready var emote_display: AnimatedSprite2D = $EmoteDisplay
@onready var profile_pic: TextureRect = $ProfilePic

func _ready():
    # Example: Load a specific emote by ID
    load_specific_emote("301544920") # Example KappaRoss emote ID

    # Example: Load current user's profile picture (assuming TwitchService exists)
    var current_user: TwitchUser = await TwitchService.instance.get_current_user()
    load_user_profile(current_user)
    
    
func load_specific_emote(emote_id: String):
    print("Requesting emote ID: %s" % emote_id)
    var emote_dict: Dictionary[String, SpriteFrames] = await media_loader.get_emotes([emote_id])

    if emote_dict.has(emote_id):
        var sprite_frames: SpriteFrames = emote_dict[emote_id]
        emote_display.sprite_frames = sprite_frames
        emote_display.play("default")
        print("Emote loaded successfully.")
    else:
        printerr("Failed to load emote ID: %s" % emote_id)


func load_user_profile(user: TwitchUser):
    print("Loading profile for: %s" % user.display_name)
    var profile_texture: ImageTexture = await MediaLoader.load_profile_image(user)
    profile_pic.texture = profile_texture
    print("Profile image loaded.")
```