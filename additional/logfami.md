# Logfami

Logfami is a structured logging library for Godot that ships inside Twitcher (`addons/twitcher/lib/logfami/`). Twitcher uses it for its [log file](/additional/logger#logging-to-a-file), but Logfami doesn't depend on Twitcher at all: copy the folder into any project and use it for your own game's logs.

::: warning Not available in C#
[TwitcherSharp](https://github.com/Temptica/TwitcherSharp) doesn't wrap Logfami. From C#, use a .NET logging library such as `Microsoft.Extensions.Logging` or Serilog.
:::

## Overview

Every log entry is a `LogfamiRecord` shaped after the [OpenTelemetry log data model](https://opentelemetry.io/docs/specs/otel/logs/data-model/): timestamp, severity, scope, body and attributes. Records flow through one or more **pipelines**, each with its own destination:

```
log_message() ──► Logfami ──► Pipeline: filter → processors → formatter → sink
                          └─► Pipeline: filter → processors → formatter → sink
```

*   **Filter:** minimum level, and optionally scopes to include or exclude.
*   **Processors:** change or drop records before they're written, e.g. `LogfamiRedactor`.
*   **Formatter:** turns a record into one line of text: text, JSON Lines or logfmt.
*   **Sink:** writes the line to a rolling file, stdout or memory.

## Quick Start

```gdscript
extends Node

var logfami: Logfami = Logfami.new()


func _ready() -> void:
	var config: LogfamiFileSinkConfig = LogfamiFileSinkConfig.new()
	config.base_name = "my_game"
	var file: LogfamiPipeline = LogfamiPipeline.new(
			LogfamiTextFormatter.new(), LogfamiFileSink.new(config), LogfamiLevel.Severity.INFO)
	file.add_processor(LogfamiRedactor.with_defaults())
	logfami.add_pipeline(file)

	logfami.log_message(LogfamiLevel.Severity.INFO, "Shop", "Item bought", { "id": 42 })
```

This writes `user://logs/my_game.log`:

```
# session.start 2026-10-01T10:00:00.000Z godot.version="4.7-stable (official)" os.type=windows runtime=game service.name=MyGame service.version=1.2.0
2026-10-01T10:00:00.123Z INFO  [Shop] Item bought {id=42}
```

## Levels

`LogfamiLevel.Severity` uses the OpenTelemetry severity numbers: `TRACE` 1, `DEBUG` 5, `INFO` 9, `WARN` 13, `ERROR` 17, `FATAL` 21. `LogfamiLevel.OFF` is a threshold that accepts nothing.

*   `LogfamiLevel.threshold_from_text("info")` parses setting values (`off`, `trace`, `debug`, `info`, `warn`, `error`, `fatal`).
*   `LogfamiLevel.to_syslog(level)` maps to RFC 5424 syslog severities.

## Formats

All formatters guarantee **one record per line**. Control characters such as line breaks are escaped, so untrusted text (chat messages, player names) can't fake an extra log entry.

### Text: `LogfamiTextFormatter`

Readable lines for files people send in for support. The default for Twitcher's log file.

```
2026-10-01T10:00:00.123Z INFO  [TwitchIRC#main] Joined channel {channel=kani_dev}
```

`instance_attribute` (default `"instance"`) names the attribute shown as `#value` after the scope.

### JSON Lines: `LogfamiJsonLinesFormatter`

One JSON object per line with OpenTelemetry field names: the format log collectors understand best.

```json
{"timestamp":"2026-10-01T10:00:00.123Z","severity_text":"INFO","severity_number":9,"scope":"Shop","body":"Item bought","attributes":{"id":42}}
```

The session header is a `session.start` record carrying the resource. Set `include_resource = true` to add the resource to every line, which you want when many processes write to the same collector.

### logfmt: `LogfamiLogfmtFormatter`

`key=value` pairs, easy to grep and supported by Grafana Loki:

```
time=2026-10-01T10:00:00.123Z level=info scope=Shop msg="Item bought" id=42
```

Values with spaces, `=`, quotes or control characters are quoted like [go-logfmt](https://github.com/go-logfmt/logfmt) does.

## Resource

`LogfamiResource.detect()` describes the program producing the logs, following the OpenTelemetry semantic conventions:

| Attribute | Source |
|---|---|
| `service.name` | Project Settings → Application → Config → Name |
| `service.version` | Project Settings → Application → Config → Version |
| `godot.version` | Engine version |
| `os.type` | `OS.get_name()` |
| `process.pid` | Process id |
| `runtime` | `editor`, `headless` (headless or dedicated server build) or `game` |

Add your own with `resource.with_attribute("build", "nightly")` and pass the resource to `Logfami.new(resource)`.

## Redaction

`LogfamiRedactor.with_defaults()` masks secrets in the body and in all text attributes before anything is written:

| Rule | Example | Result |
|---|---|---|
| Authorization headers | `Bearer 0123abcd…` | `Bearer [REDACTED]` |
| Twitch IRC password | `PASS oauth:abc123` | `PASS oauth:[REDACTED]` |
| Secrets as key/value or JSON | `access_token=abc`, `"client_secret":"abc"` | `access_token=[REDACTED]` |
| OAuth code in URLs | `/callback?code=abc&state=x` | `/callback?code=[REDACTED]&state=x` |

Attributes whose key contains `token`, `secret`, `password`, `authorization`, `cookie` or `api_key` are masked as a whole. `with_defaults(true)` also masks any long string mixing letters and digits; it's off by default because it also hits hashes and IDs.

Add your own rules:

```gdscript
var redactor: LogfamiRedactor = LogfamiRedactor.with_defaults()
redactor.add_rule(LogfamiRedactionRule.new("email", "[\\w.+-]+@[\\w-]+\\.[\\w.]+", "[EMAIL]"))
```

## Sinks

### Rolling File: `LogfamiFileSink`

Configured with a `LogfamiFileSinkConfig` resource (can be saved as `.tres` and edited in the inspector):

| Property | Default | Description |
|---|---|---|
| `directory` | `user://logs` | Folder of the files. |
| `base_name` | `app` | File name without extension. |
| `extension` | *(formatter's)* | `log` for text and logfmt, `jsonl` for JSON Lines. |
| `max_lines` | `1000` | Lines per file before it rotates; `0` never rotates on size. |
| `max_files` | `3` | Files kept: `app.log`, `app.1.log`, `app.2.log`. |
| `rotate_on_start` | `true` | Each session starts a fresh file; `false` appends. |
| `flush_policy` | `EVERY_LINE` | `EVERY_LINE` loses nothing on a crash. `ON_LEVEL_OR_INTERVAL` flushes at `flush_level` (WARN) and every `flush_interval_lines` lines. |

Every file starts with the formatter's session header, also after a size rotation. `get_absolute_file_path()` and `get_existing_file_paths()` tell you which files to ask a player for. If the folder can't be created or a write fails, the sink reports one `push_warning` and stops writing instead of disturbing the game.

### Standard Output: `LogfamiStdoutSink`

Prints lines with `print()`, for headless servers and containers. `errors_to_stderr = true` sends records at `stderr_level` (ERROR) and above to stderr. Enable **Application → Run → Flush Stdout On Print** so lines reach the collector right away.

### Memory: `LogfamiMemorySink`

Keeps lines and records in arrays: handy for tests or an in-game log viewer.

## Engine Errors

`LogfamiEngineCapture` registers itself through `OS.add_logger()` and forwards Godot's own errors and warnings (`push_error`, `push_warning`, script and shader errors) to Logfami, with the source location as `code.function`, `code.filepath` and `code.lineno` attributes:

```gdscript
var capture: LogfamiEngineCapture = LogfamiEngineCapture.new(logfami)
capture.install()
```

Set `capture_messages = true` to also forward `print()` output. Lines Logfami prints itself are not captured again.

## Connecting Other Libraries

*   **Record dictionaries:** `logfami.as_handler()` returns a `func(record: Dictionary)`, e.g. for `TwitchLoggerManager.add_handler()`. `LogfamiRecord.from_dict()` reads the same keys Twitcher's records use.
*   **`set_logger(error, info, debug)` libraries:** `logfami.as_triple("Http")` returns three callables taking a `String`, matching the convention of Twitcher's HTTP and OAuth libraries:

```gdscript
const HttpUtil = preload("res://addons/twitcher/lib/http/http_util.gd")

var triple: Array[Callable] = logfami.as_triple("Http")
HttpUtil.set_logger(triple[0], triple[1], triple[2])
```

## Extending

Implement one of the abstract classes:

*   `LogfamiProcessor.process(record) -> LogfamiRecord`: return `null` to drop the record.
*   `LogfamiFormatter.format(record, resource) -> String`: optionally `header()` and `file_extension()`.
*   `LogfamiSink.write(line, record)`: optionally `start_session()`, `flush()` and `close()`.

Logfami is thread-safe: pipelines and the file sink serialize their writes, and a record logged while a record is being written (e.g. by a sink reporting an error) is dropped instead of looping.
