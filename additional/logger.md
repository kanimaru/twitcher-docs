# Twitcher Logging System

Twitcher ships with a logging system built for two jobs:

1. **Debugging while you develop.** Filtered, colored output in Godot's Output panel, switched on per component.
2. **Support after you ship.** Every Twitcher message at info level and above is also written to a log file, even when the console output is off. When a player reports a problem, ask them for that file (see [Support](/introduction/support#send-us-your-log-file)).

Under the hood, Twitcher only creates log records and hands them to *handlers*. The console is one handler; the log file is another, provided by [Logfami](/additional/logfami), a standalone logging library bundled with Twitcher. You can add your own handlers, too.

::: warning Not available in C#
[TwitcherSharp](https://github.com/Temptica/TwitcherSharp) doesn't wrap `TwitchLogger`, so there's no C# binding for creating your own instance the way GDScript integrators can with `TwitchLogger.new(...)`. For logging from C#, use Godot's regular `GD.Print()` / `GD.PrintErr()`, or a standard .NET logging library. Twitcher's own log file is written regardless of the language your game uses.
:::

## Key Features

*   **Console output per component:** Each logger can be set to Off, Info or Debug in the Project Settings.
*   **Log file out of the box:** `user://logs/twitcher.log`, rotated per session and by size, with credentials redacted.
*   **Headless servers:** JSON Lines on stdout, switched on automatically for headless and dedicated server builds.
*   **Structured messages:** Attach key/value attributes to any message.
*   **Exchangeable output:** Subscribe any `Callable` as a handler.

## Logging Levels

| Level | Method | Meaning |
|---|---|---|
| Debug | `_log.d()` | Fine-grained details for debugging Twitcher's internals. |
| Info | `_log.i()` | Normal operation: connections, authorization, initialization. |
| Warn | `_log.w()` | Something went wrong but Twitcher can carry on, e.g. a chat message Twitch dropped. |
| Error | `_log.e()` | Something failed. |

Levels follow the [OpenTelemetry severity numbers](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitynumber) (`LogfamiLevel.Severity`: TRACE 1, DEBUG 5, INFO 9, WARN 13, ERROR 17, FATAL 21), so they map cleanly onto syslog and log collectors.

## Usage

Create a static logger with a unique name and log through it:

```gdscript
@tool
extends Node

# The name appears in the output and creates the setting twitcher/logs/MyCustomNodeLogger.
static var _log: TwitchLogger = TwitchLogger.new("MyCustomNodeLogger")


func _ready() -> void:
	_log.i("MyCustomNode is ready.")
	_log.d("Performing initial state check.")


func buy(item_id: int, price: int) -> void:
	# Attributes add structured context to a message.
	_log.i("Item bought", { "item_id": item_id, "price": price })
```

If building a message is expensive, ask first whether anyone receives it:

```gdscript
if _log.wants(LogfamiLevel.Severity.DEBUG):
	_log.d("State dump: %s" % _build_big_dump())
```

`set_suffix("main")` distinguishes several instances of the same component, e.g. `[TwitchIRC-main]` in the console and `[TwitchIRC#main]` in the log file.

## Console Output

Once a `TwitchLogger` is instantiated (in a `@tool` script this happens as soon as the editor loads it), a matching setting appears in the Project Settings:

1. Go to **Project → Project Settings → Twitcher → Logs** (enable **Advanced Settings** to see it).
2. Find the entry named after your logger (e.g. `MyCustomNodeLogger`).
3. Choose `off` (default), `info` or `debug`.

The setting is read when the logger is created, so changes apply on the next game start, or after the script reloads in the editor.

The console format stays compact and colored per component:

```
48213 I[TwitchAuth] Token got authorized {expires_in=3600}
48215 E[TwitchIRC-main] Connection lost
```

## Logging to a File

Twitcher writes a log file without any setup. With the default settings:

* Everything at **info** and above is written, **independent of the console settings above**.
* A game writes `user://logs/twitcher.log`; the editor writes `user://logs/twitcher_editor.log`, so both never mix.
* Each start begins a fresh file; the previous one becomes `twitcher.1.log`. Files also rotate every 1000 lines, and at most 3 files are kept.
* Access tokens, OAuth codes, IRC passwords and similar secrets are replaced with `[REDACTED]`.

A file looks like this:

```
# session.start 2026-10-01T21:09:46.035Z godot.version="4.7-stable (official)" os.type=windows process.pid=1234 runtime=game service.name=MyGame service.version=1.2.0 twitcher.version=2.5.1
2026-10-01T21:09:46.036Z INFO  [TwitchAuth] Token got authorized {expires_in=3600}
2026-10-01T21:09:47.120Z WARN  [TwitchChat] Message couldn't be sent cause of [msg_rejected]: blocked
```

The first line describes the session: game name and version (from **Application → Config**), Twitcher and Godot version, operating system, process id, and whether it ran in the editor, headless or as a game.

### Settings

All settings live under **Project Settings → Twitcher → Logs**:

| Setting | Default | Description |
|---|---|---|
| `twitcher/logs/file/level` | `info` | `off`, `error`, `warn`, `info` or `debug`. `off` disables the file. |
| `twitcher/logs/file/format` | `text` | `text` (human readable), `jsonl` (JSON Lines) or `logfmt`. See [Logfami formats](/additional/logfami#formats). |
| `twitcher/logs/file/directory` | `user://logs` | Folder of the log files. |
| `twitcher/logs/file/max_lines` | `1000` | Lines per file before it rotates. |
| `twitcher/logs/file/max_files` | `3` | Files kept, the current one included. |
| `twitcher/logs/file/redact` | `true` | Masks credentials in the file and on stdout. |
| `twitcher/logs/stdout/level` | `auto` | See [Headless Servers](#headless-servers). |
| `twitcher/logs/stdout/format` | `jsonl` | Format of the stdout lines. |
| `twitcher/logs/capture_engine` | `false` | Also writes Godot errors and warnings (`push_error`, `push_warning`, script errors) to the log, under the scope `godot`. |

### Finding the File

* **In the editor:** **Project → Tools → Twitcher → Open Log Folder**.
* **From your game:** add a support button to your settings menu:

```gdscript
func _on_open_logs_pressed() -> void:
	TwitchLogfamiBridge.open_log_folder()


func _on_copy_log_path_pressed() -> void:
	DisplayServer.clipboard_set(TwitchLogfamiBridge.get_log_file_path())
```

`get_log_file_path()` returns an empty string while `twitcher/logs/file/level` is `off`.

* **By hand:** see the paths per operating system on the [Support](/introduction/support#send-us-your-log-file) page.

## Headless Servers

With `twitcher/logs/stdout/level` on `auto` (the default), headless and dedicated server builds also print every record at info level and above as one JSON object per line to stdout, the format container log collectors (Docker, Kubernetes, Grafana Loki, Datadog, CloudWatch) read best. Each line carries the game and version, so lines from several servers stay distinguishable:

```json
{"timestamp":"2026-10-01T21:09:46.036Z","severity_text":"INFO","severity_number":9,"scope":"TwitchAuth","body":"Token got authorized","attributes":{"expires_in":3600},"resource":{"godot.version":"4.7-stable (official)","os.type":"windows","process.pid":1234,"runtime":"headless","service.name":"MyGame","service.version":"1.2.0","twitcher.version":"2.5.1"}}
```

While stdout logging is active, the colored console output is switched off, so lines don't appear twice. Set the level to `off` to disable stdout, or to a level to force it on everywhere.

::: tip
Godot buffers stdout when it isn't a terminal. Enable **Application → Run → Flush Stdout On Print** so lines reach your log collector right away.
:::

## Custom Handlers

A handler is any `Callable` taking one `Dictionary`. Register it with a minimum level:

```gdscript
func _ready() -> void:
	TwitchLoggerManager.add_handler(_on_twitcher_log, LogfamiLevel.Severity.WARN)


func _on_twitcher_log(record: Dictionary) -> void:
	$DebugOverlay.add_line("%s %s" % [record["scope"], record["body"]])
```

Every record has these keys. The record is read-only; existing keys are never renamed or removed, new ones may be added:

| Key | Type | Content |
|---|---|---|
| `time_unix_ms` | int | Wall clock, UTC, milliseconds since 1970 |
| `ticks_msec` | int | `Time.get_ticks_msec()` at creation |
| `severity_number` | int | See [Logging Levels](#logging-levels) |
| `severity_text` | String | `DEBUG`, `INFO`, `WARN`, `ERROR`, … |
| `body` | String | The message |
| `scope` | String | Logger name, e.g. `TwitchAuth` |
| `attributes` | Dictionary | Attributes of the message; `instance` holds the suffix |
| `thread_id` | int | Thread that logged |

Other useful calls:

* `TwitchLoggerManager.remove_handler(callable)`
* `TwitchLoggerManager.clear_handlers()` removes everything, the console included; `install_console_handler()` brings the console back.
* To replace the built-in log file with your own setup, set `TwitchLogfamiBridge.auto_install = false` before the first log call, e.g. in the `_init()` of an autoload. Creating loggers doesn't count as logging, so `static var _log: TwitchLogger` declarations in your scripts don't get in the way. In the editor the plugin logs as soon as it loads, so call `TwitchLogfamiBridge.uninstall()` there instead; it also switches `auto_install` off.

Handlers run on the thread that logged. A record logged from inside a handler is dropped instead of recursing.

::: tip Prefer methods over lambdas
Lambda handlers work, but Godot frees a lambda together with its script during shutdown, so Twitcher removes lambda handlers when the scene tree shuts down, after your nodes logged their last lines. Methods, bound or not (like `_on_twitcher_log` above), stay registered. If your program quits before its first frame, call `TwitchLoggerManager.remove_lambda_handlers()` yourself before `quit()`.
:::
