# Twitcher Logging System

Twitcher includes a simple, built-in logging system primarily designed for debugging the addon's components, 
especially useful for nodes running in the editor (`@tool` scripts). It allows developers integrating Twitcher, 
or developers working on Twitcher itself, to get filtered output without cluttering the console unnecessarily.

## Key Features

*   **Configurable Levels:** Control the verbosity of logs (Off, Info, Debug).
*   **Project Settings Integration:** Log levels are configured centrally via Project Settings, allowing easy adjustment without code changes.
*   **Tool Script Friendly:** Instantiating a logger in a `@tool` script automatically registers it in the Project Settings UI.
*   **Simple API:** Easy to instantiate and use within your scripts.

## Logging Levels

The logger operates with three distinct levels:

*   **`Off` (Default)**
    *   Disables all logging output from this specific logger instance. *This is the default setting* to keep the output clean unless debugging is needed.
*   **`Info`**
    *   Logs general operational information. Useful for tracking major events, initialization steps, or status messages relevant to understanding the addon's state during integration or normal use.
*   **`Debug`**
    *   Logs detailed information intended for developers actively debugging the addon's internal behavior. This includes finer-grained steps, variable states, or frequent events useful for troubleshooting.

## Usage

1.  **Instantiate the Logger:** In your script (especially `@tool` scripts), create a static logger instance, providing a unique identifier string. This identifier will be used to name the setting in the Project Settings and defines its color.

2.  **Call Logging Methods:** Use the logger instance's methods (`i()` for info, `d()` for debug, `e()` for error) to output messages at the desired level.

## Configuration

Once you instantiate a `TwitchLogger` in a `@tool` script (and the editor recognizes it), a corresponding setting will appear in the Project Settings:

1. Go to **Project -> Project Settings -> Twitcher -> Logs** (only appears when `Advanced Settings` are enabled)
2. Find the entry matching the unique identifier you provided when creating the logger (e.g., "MeNewLogger" from the example below).
3. Select the desired logging level (`Off`, `Info`, or `Debug`) from the dropdown for that specific logger.

Changes in Project Settings take effect immediately.

## Example

```gdscript
@tool
extends Node

# Instantiate the logger with a unique identifier for Project Settings.
# This line automatically makes "MyCustomNodeLogger" appear in settings.
static var _log : TwitchLogger = TwitchLogger.new("MyCustomNodeLogger")

func _ready() -> void:
    # This message will only print if 'MyCustomNodeLogger' is set to 'Info' or 'Debug'.
    _log.i("MyCustomNode is ready and initialized.")

    # This message will only print if 'MyCustomNodeLogger' is set to 'Debug'.
    _log.d("Debug: Performing initial state check.")
    # Bypass the level setting:
    # _log.e("This is an error.")

func some_method():
    _log.d("Executing some_method.")
    # ... method logic ...