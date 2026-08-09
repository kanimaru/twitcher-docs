# TwitchChatCommandRespond Node

The `TwitchChatCommandRespond` node is a specialized, "no-code" version of `TwitchCommand`. Its sole purpose is to send
a pre-defined, static text message in response to a command, making it incredibly fast to set up simple informational
commands.

## Overview

This node inherits all the functionality of `TwitchCommand`, including permissions, aliases, and cooldowns. However,
instead of requiring you to connect its `command_received` signal to a script, it handles the response automatically.

When its command is triggered and all checks pass, it immediately sends the text from its `response` property to the
channel, as a direct reply to the message that triggered it.

**Use Cases:**
This is the perfect node for simple, static commands like:

* `!discord` -> "Join our community Discord: discord.gg/yourlink"
* `!socials` -> "You can find me on Twitter and YouTube @YourHandle"
* `!lurk` -> "Thanks for the lurk! Enjoy the stream."

## Prerequisites

1. **Add the Node:** Add a `TwitchChatCommandRespond` node to your scene.
2. **Message Source:** The node requires a source for chat messages, typically provided by a configured `TwitchEventsub`
   node in your project.
   When not set, it will automatically take the first `TwitchEventsub` node it finds in the scene.
3. **Connect the Channel Chat Message Event**: If you haven't already - Make sure that you connect the `Channel Chat Message` event in your `TwitchEventsub` node. Otherwise commands will not work.

## Configuration (Inspector Properties)

* **`Response` (`String`, multiline)**: **Required.** The static text message that will be sent to chat when the command
  is successfully triggered.
* **`Twitch Chat` (`TwitchChat`)**: **Optional.** The `TwitchChat` node instance that will be used to send the response
  message.
* **Inherited `TwitchCommand` Properties:**
    * You must configure the standard command properties like **`Command`** (e.g., "discord"), **`Aliases`**, *
      *`Permission Level`**, **`User Cooldown`**, etc., just as you would for a regular `TwitchCommand` node.

## Signals & Methods

This node does not introduce new public signals or methods. It internally handles its own `command_received` signal. For
signals related to invalid permissions or cooldowns, you can connect to the ones inherited from `TwitchCommandBase`.

## Usage Example (No Code Required)

The primary way to use this node is directly in the Godot editor, without any scripting.

1. **Add Nodes:** Ensure you have a configured `TwitchService` with a `TwitchChat` node in your scene. Then, add a
   `TwitchChatCommandRespond` node.
2. **Configure in Inspector:** Select the `TwitchChatCommandRespond` node.
3. In the Inspector:
    * Set the **`Command`** property (inherited) to `"socials"`.
    * Set the **`Description`** property (inherited) to `"Displays social media links."`.
    * Set the **`User Cooldown`** property (inherited) to `30.0`.
    * In the **`Response`** property, type: `You can find me on Twitter @YourHandle and YouTube @YourChannel!`
    * Drag your `TwitchChat` node from the Scene dock onto the **`Twitch Chat`** property slot.

**Result:**
The command is now live. Any user can type `!socials` in chat (once every 30 seconds per user), and the bot will
automatically reply with your configured message. No GDScript connections are needed for this simple case.

## Key Considerations

* **For Static Responses Only:** This node is designed exclusively for responses that do not change. For dynamic
  responses (e.g., a command that includes the user's name or a random number), you must use the standard
  `TwitchCommand` node and connect to its `command_received` signal with a script.
* **Dependencies:** The node will not work without a valid `TwitchChat` instance assigned and a non-empty `Response`
  string.