# TwitchCommandRespond Node

The `TwitchCommandRespond` node is a "no-code" way to reply to a command with a fixed text message. Add it as a
**child** of any command node (`TwitchCommand`, `TwitchCommandRegex`, `TwitchCommandContains`, `TwitchCommandHelp`,
...) and it sends its configured message as a reply whenever that parent's `command_received` signal fires — no
script required.

<Badge type="tip" text="GDScript & C#" />

## Overview

`TwitchCommandRespond` doesn't parse chat messages or check permissions itself. Instead, it listens to the
`command_received` signal of its **parent node**, and whenever that signal fires, replies in chat with its own fixed
`respond_message` text, addressed to the message that triggered the command.

This makes it a small building block you attach to an existing command node rather than a standalone command type:
all matching, permission, cooldown, and argument logic still comes from the parent (e.g. a `TwitchCommand` configured
with `Command = "discord"`); `TwitchCommandRespond` only adds the "then say this" part.

**Use Cases:**
Pair it with a `TwitchCommand` for simple, static replies like:

* `!discord` -> "Join our community Discord: discord.gg/yourlink"
* `!socials` -> "You can find me on Twitter and YouTube @YourHandle"
* `!lurk` -> "Thanks for the lurk! Enjoy the stream."

## Prerequisites

1. **Add a command node:** Add a `TwitchCommand` (or `TwitchCommandRegex`/`TwitchCommandContains`/`TwitchCommandHelp`)
   node to your scene and configure it as usual (`Command`, `Permission Level`, cooldowns, etc.).
2. **Add `TwitchCommandRespond` as its child:** Add a `TwitchCommandRespond` node **under** that command node. It
   looks at its parent for the `command_received` signal, so it only works when nested this way.
3. **Chat Message Subscription:** Make sure the `TwitchEventsub` node used by the parent command has a
   `Channel Chat Message` subscription created.

## Configuration (Inspector Properties)

* **`Respond Message` (`String`, multiline)**: **Required.** The static text message sent to chat when the parent
  command is successfully triggered.
* **`Use Bot` (`bool`)**: Default `true`. When enabled, the reply is sent via `TwitchBot.chat(...)` (the bot account);
  when disabled, it's sent via `TwitchService.chat(...)` (the broadcaster/streamer account).

## Signals & Methods

This node does not introduce new public signals or methods. It listens to its parent's `command_received` signal
internally and replies automatically.

## Usage Example (No Code Required)

The primary way to use this node is directly in the Godot editor, without any scripting.

1. **Add Nodes:** Add a `TwitchCommand` node, then add a `TwitchCommandRespond` node as its **child**.
2. **Configure the `TwitchCommand` (parent):**
    * Set **`Command`** to `"socials"`.
    * Set **`Description`** to `"Displays social media links."`.
    * Set **`User Cooldown`** to `30.0`.
3. **Configure the `TwitchCommandRespond` (child):**
    * In **`Respond Message`**, type: `You can find me on Twitter @YourHandle and YouTube @YourChannel!`
    * Leave **`Use Bot`** checked to reply from the bot account, or uncheck it to reply as the broadcaster.

**Result:**
The command is now live. Any user can type `!socials` in chat (once every 30 seconds per user), and it automatically
replies with your configured message. No GDScript connections are needed for this simple case.

## Key Considerations

* **For Static Responses Only:** This node is designed exclusively for responses that do not change. For dynamic
  responses (e.g., a command that includes the user's name or a random number), connect to the parent command's
  `command_received` signal from a script instead.
* **Chat Messages Only:** The reply is built from the triggering message as a `TwitchChatMessage`, so pair this node
  with a parent command configured for `Where = CHAT` (or `ANYWHERE` used only in chat) rather than whispers.
* **Dependencies:** The node does nothing without a parent that has a `command_received` signal (a
  `TwitchCommandBase`-derived node) and a non-empty `Respond Message`.
