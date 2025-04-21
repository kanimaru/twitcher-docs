# Image Transformer Resources

Twitcher utilizes Image Transformer resources (`.tres` files inheriting from `TwitchImageTransformer`) within the 
`TwitchMediaLoader` to process downloaded media files (emotes, badges, cheermotes) from Twitch and other sources into 
Godot-usable `SpriteFrames`. This is crucial for handling different image formats and especially for enabling animation.

Twitcher includes three built-in transformer implementations, each with different capabilities and trade-offs:

---

### 1. `TwitchImageTransformer` (Static Only)

This is the most basic transformer, designed purely for converting images into **static** (non-animated) `SpriteFrames`.

*   **Animation Support:** No. All images, including GIFs, will be loaded as single-frame `SpriteFrames`.
*   **Dependencies:** None (uses Godot's built-in image loading).
*   **Pros:**
    *   Simple and reliable for static images.
    *   Fastest option if animation is not required.
    *   No external setup needed.
*   **Cons:**
    *   Cannot display animated emotes or cheermotes.
*   **Use Case:** Suitable if your project does not require animated emotes/cheermotes, or if performance for static assets is the absolute priority.

---

### 2. `NativeImageTransformer` (GDScript GIF Animation)

This transformer adds support for **animated GIFs** by parsing them directly within Godot using GDScript. 
It was ported from an older version of https://github.com/jegor377/godot-gdgifexporter 

*   **Animation Support:** Yes (GIF only).
*   **Dependencies:** None (relies solely on GDScript code included with Twitcher).
*   **Pros:**
    *   Provides animation support for most standard GIFs used on Twitch.
    *   Requires no external software installation, making game distribution easier.
*   **Cons:**
    *   GIF parsing in GDScript might be less performant than native code solutions.
    *   May occasionally fail to correctly parse non-standard, complex, or slightly malformed GIF files that some external tools might handle.
*   **Use Case:** The recommended choice when you need animated Twitch emotes/cheermotes and want to avoid external dependencies, ensuring easier setup and distribution for your players.

---

### 3. `MagicImageTransformer` (External ImageMagick)

This transformer leverages the powerful external command-line tool, **ImageMagick**, to process images.

*   **Animation Support:** Yes (GIF, and potentially other formats supported by ImageMagick like animated WEBP).
*   **Dependencies:** **Requires `ImageMagick` to be installed separately by the user or developer** on the system where the Godot application is running. The path to the `magick` executable might need configuration. ([ImageMagick Downloads](https://imagemagick.org/script/download.php))
*   **Pros:**
    *   Supports a wider range of formats, notably **WEBP**, which is essential for third-party emote services like 7TV or BetterTTV.
    *   Potentially more robust parsing for complex or unusual GIF files due to ImageMagick's maturity.
*   **Cons:**
    *   **Major Hurdle:** The external dependency on ImageMagick significantly complicates setup and distribution. 
        You cannot easily bundle ImageMagick with your game, especially for web platforms or app stores. Users typically need to install it manually.
    *   Requires calling an external process, which can have performance overhead and platform-specific path issues.
*   **Use Case:** Necessary if you absolutely need support for WEBP emotes (e.g., from 7TV) *and* 
    you are developing in an environment where managing this external dependency is feasible (e.g., an overlay, an internal application, 
    or a desktop game where you provide clear installation instructions for ImageMagick). 
    **Not recommended for web games or projects aiming for easy, widespread distribution.**

---

**Choosing the Right Transformer:**

*   **Don't need animation?** Use `TwitchImageTransformer`.
*   **Need standard Twitch animated emotes/cheermotes without extra setup?** Use `NativeImageTransformer`.
*   **Need WEBP support (7TV, BTTV) or maximum format compatibility, AND can handle the external dependency?** Use `MagicImageTransformer`.