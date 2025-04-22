# SpriteFrameEffect for RichTextLabel

The `SpriteFrameEffect` provides a custom BBCode tag for `RichTextLabel` nodes, allowing you to embed and display **animated `SpriteFrames` resources** directly within your rich text.
This effect was created to offer a robust alternative to Godot's deprecated `AnimatedTexture`, specifically for use within `RichTextLabel`.

## Core Functionality

This effect introduces a new BBCode tag: `[sprite]`

**Syntax:**

```bbcode
[sprite id="your_unique_id"]res://path/to/your/spriteframes.tres[/sprite]
```

- `id="your_unique_id"`: A unique identifier (string or number) for this specific sprite instance within this `RichTextLabel`. This ID is used internally to manage the `AnimatedSprite2d` nodes. Each `[sprite]` tag in the same label needs a different ID.
- `res://path/to/your/spriteframes.tres`: path to a valid SpriteFrames resource file. The effect uses `ResourceLoader.load()` to fetch this resource.

## How to Use

Integrating this effect involves two main steps: installing the effect and preparing the text string.

1. Install the Effect: Create an instance of `SpriteFrameEffect` and install it onto your target `RichTextLabel` node. This only needs to be done once.
2. Prepare the Message: Before setting the `RichTextLabel.text` property, you must process your text string (containing 
   the `[sprite]` tags) using the `SpriteFrameEffect.prepare_message()` method. This method scans for the `[sprite]` tags, 
   generates the necessary internal placeholders, and returns the modified string that should be assigned to `RichTextLabel.text`.

## Example

```gdscript
extends Control

# Assign your SpriteFrames resource in the Inspector or load it here.
@export var animated_emote: SpriteFrames

# Ensure you have a RichTextLabel node in your scene.
@onready var rich_text_label: RichTextLabel = $RichTextLabel

func _ready() -> void:
    # 1. Create and install the custom effect instance.
    var sprite_effect = SpriteFrameEffect.new()
    rich_text_label.install_effect(sprite_effect)

    # Define the text including the custom sprite tag.
    # Use '.resource_path' to get the loadable path for the SpriteFrames.
    var original_message = "Here is an animated emote: [sprite id='emote_1']%s[/sprite] Cool!" % animated_emote.resource_path

    # 2. Prepare the message using the effect instance.
    # This step is crucial for the effect to work.
    var prepared_message = sprite_effect.prepare_message(original_message, rich_text_label)

    # 3. Set the prepared text on the RichTextLabel.
    rich_text_label.text = prepared_message
```

## Implementation Details (How it Works Internally)

For those interested, the prepare_message method doesn't directly render the animation. Instead, it:

1. Parses the input string to find `[sprite]` tags.
2. For each tag found, it replaces it with a standard `[img=<width>x<height>]`res://path/to/transparent.png`[/img]` tag. The dimensions are taken from the loaded SpriteFrames resource, and a placeholder transparent image is used.
3. The effect then tracks the position and visibility of these generated `[img]` placeholders within the RichTextLabel.
4. It creates and manages `AnimatedSprite2D` nodes for each unique sprite ID, positioning them directly over their corresponding transparent `[img]` placeholders during the label's drawing or processing phase.

This approach leverages the `RichTextLabel's` layout capabilities for the placeholder image while handling the animated rendering separately.