# TwitchCommandHelp Node

The `TwitchCommandHelp` node provides an automated help system for your application's chat commands.
It extends the standard `TwitchCommand` functionality to automatically generate and reply with information about other
available commands.

## Overview

This node acts as a self-contained help command handler. When a user invokes the command associated with this node 
(commonly configured as `!help`):

1. It receives the command via its inherited `command_received` signal.
2. It identifies the context (regular chat message or whisper).
3. It accesses a list of all other registered `TwitchCommand` nodes within your project.
4. It filters these commands based on:
    * Whether the command is usable in the current context (Chat vs. Whisper, based on the command's `where` flag).
    * (Optional) If the user provided arguments (e.g., `!help specific_cmd`), it filters to show only details for the
      requested command(s).
5. It formats a help message:
    * A list of available commands if no specific command was requested.
    * Detailed descriptions for requested commands.
6. It uses an assigned `TwitchAPI` instance to send the generated help message back to the user:
    * As a direct reply in chat if triggered via chat.
    * As a whisper if triggered via whisper.

This automates the process of providing users with information about your bot's or application's commands.

## Prerequisites

1. **Add the Node:** Add a `TwitchCommandHelp` node to your scene.
2. **Functional `TwitchAPI`:** A correctly configured and authorized `TwitchAPI` node must be available.
   This is essential for sending the reply messages.
3. **Other `TwitchCommand` Nodes:** There must be other `TwitchCommand` nodes registered in the project for this node to
   discover and list.

## Configuration (Inspector Properties)

* **Inherited `TwitchCommand` Properties:**
    * **`Command` (`String`)**: Set the command name users will type (e.g., `"help"`). Defaults to `"help"` if left
      empty.
    * **`Aliases` (`Array[String]`)**: Optional alternative names (e.g., `["commands", "?"]`).
    * **`Description` (`String`)**: A description *for this help command itself* (e.g., "Shows available commands or
      details for a specific command.").
    * **`Args Min`/`Args Max`**: Typically `0` and `-1` (optional arguments accepted for specific command help).
    * **`Permission Level` (`PermissionFlag`)**: Set the minimum permission needed to *use the help command*. Default
      `EVERYONE`.
    * **`Where` (`WhereFlag`)**: Where the help command can be used. Default `ANYWHERE`.
* **Specific `TwitchCommandHelp` Properties:**
    * **`Twitch Api` (`TwitchAPI`)**: **Optional.** The `TwitchAPI` instance used to send the generated help message
      replies.
    * **`Sender User` (`TwitchUser`)**: *Optional.* The `TwitchUser` resource representing the user who will send the
      help message. If left `null`, the currently authenticated user (associated with the `TwitchAPI` token) will be
      used as the sender.

## Signals

This node does not introduce new public signals. It utilizes the inherited `command_received` signal from
`TwitchCommand` to trigger its own help generation logic.

## Methods

This node does not introduce new public methods intended for direct user calls. Its functionality is primarily executed
internally when its command is triggered.

## Usage Example

1. **Add Nodes:** Add your regular `TwitchCommand` nodes (e.g., `!dice`, `!socials`) and one `TwitchCommandHelp` node to
   your scene (perhaps under `TwitchService`).
2. **Configure `TwitchCommandHelp`:**
    * Select the `TwitchCommandHelp` node.
    * In the Inspector, ensure `Command` is set to `"help"`.
    * Assign your active `TwitchAPI` instance (e.g., from `TwitchService`) to the `Twitch Api` property.
    * Optionally assign a specific `TwitchUser` to `Sender User` if you don't want the bot to reply as itself.
    * Set `Permission Level` and `Where` as desired (e.g., `EVERYONE`, `ANYWHERE`).
3. **Configure Other Commands:** Ensure your other commands (`!dice`, `!socials`) have appropriate `description`
   properties set, as these are used by the help command. Also, ensure their `where` flags are set correctly.

**Example Interactions (in Twitch Chat):**

* **User:** `!help`
    * **Bot (Reply):** `List of all Commands: !help, !dice, !socials | You can use '!help COMMAND' for details!` *(Order
      may vary)*
* **User:** `!help dice`
    * **Bot (Reply):** `[!dice - Rolls a six-sided die]` *(Assuming the description for the !dice command is "Rolls a
      six-sided die")*
* **User:** `!help socials dice`
    * **Bot (Reply):** `[!socials - Shows social media links] [!dice - Rolls a six-sided die]` *(Order may vary)*
