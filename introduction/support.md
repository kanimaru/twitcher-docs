# Need a Hand? Let's Get You Sorted!

We're here to help you get the most out of Twitcher. Here's how you can find support:

## Uh Oh, A Wild Bug Appeared! 🐞

Spotted a pesky bug? Don't let it cramp your style! Report it through any of our channels (GitHub Issues is great!), and I'll squash that critter as quickly as I can.

## Send Us Your Log File 📄 {#send-us-your-log-file}

When something goes wrong, the log file tells us what happened on the Twitcher side. Twitcher writes it automatically, even in exported games and even when all logging in the Project Settings is off. Access tokens and other secrets are replaced with `[REDACTED]` before anything is written.

**From the editor:** **Project → Tools → Twitcher → Open Log Folder**.

**From a game:** the files live in the game's user data folder, in `logs/`:

| System | Folder |
|---|---|
| Windows | `%APPDATA%\Godot\app_userdata\<Game Name>\logs` |
| macOS | `~/Library/Application Support/Godot/app_userdata/<Game Name>/logs` |
| Linux | `~/.local/share/godot/app_userdata/<Game Name>/logs` |

If the game uses a custom user directory (**Application → Config → Use Custom User Dir**), `Godot/app_userdata/` is left out of the path, e.g. `%APPDATA%\<Custom Name>\logs` on Windows.

Send us:

* `twitcher.log`: the current or last game session
* `twitcher.1.log`: the session before, often the one that went wrong if the game was restarted
* `twitcher_editor.log`: if the problem happened in the editor

Game developers can add an "Open logs" button for their players with `TwitchLogfamiBridge.open_log_folder()`; see [Logging to a File](/additional/logger#logging-to-a-file).

## Free Support & Community Cheer 🎉

Got questions or hit a snag setting things up?

*   **Catch me Live!** Drop by the [Twitch stream](https://www.twitch.tv/kani_dev) when I'm live. It's a great place to ask questions directly and get real-time help.
*   **Join the Discord Crew:** Our [Community Discord](https://discord.gg/8WnjGCYhDq) is buzzing with helpful folks. Ask your questions there, and chances are someone from the community can lend a hand.

## Premium Support: Level Up Your Help! ✨

Twitcher's popularity has been amazing (yay!), which means free support requests have skyrocketed! To keep things manageable and offer more dedicated help, I've introduced Premium Support for Twitch Subscribers:

*   **Priority Discord Channel:** Subscribers get access to a special, priority channel on our [Discord](https://discord.gg/8WnjGCYhDq).
*   **Direct Voice Call Support:** Need more in-depth, one-on-one assistance? Subscribers can arrange direct voice calls to tackle trickier issues.

Thanks for understanding! Your support helps keep Twitcher awesome. 😉