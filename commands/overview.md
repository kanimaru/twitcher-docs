# Commands Overview

Twitcher provides a powerful, node-based system for creating and managing chat commands. Instead of writing complex
parsers, you can add different types of command nodes to your scene, configure them in the Inspector, and connect to
their signals.

All command nodes inherit from a common `TwitchCommandBase`, giving them a shared foundation for handling permissions,
cooldowns, and location (chat/whisper).

### Types of Command Nodes

* **[TwitchCommand](twitch-command.md):** The standard, prefix-based command (e.g., `!hello`). This is the most common
  type of command.
* **[TwitchCommandRegex](twitch-command-regex.md):** Triggers based on a regular expression match within a message.
  Powerful for extracting specific patterns.
* **[TwitchCommandContains](twitch-command-contains.md):** Triggers if a message contains specific keywords or
  phrases. A simpler alternative to regex for keyword detection.
* **[TwitchCommandHelp](twitch-command-help.md):** A specialized command that automatically generates a help message
  listing other available commands.

### Key Data Object

* **[TwitchCommandInfo](twitch-command-info.md):** A data object passed with every command signal, providing essential
  context about the event, such as the user, channel, and original message.