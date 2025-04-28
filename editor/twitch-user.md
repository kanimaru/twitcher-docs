# Twitch User Converter

Twitcher comes with an inspector for `TwitchUser` resource when you have the editor authorized.
It helps you to convert the UserNames to User IDs with the help of the TwitchAPI. 
For convenience purpose, it converts the Username directly to a `TwitchUser` Resource and you can use it where ever you want.

Example:
```gdscript
@export var user: TwitchUser 
```

It looks like this when authorized:
![editor-user-inspector-1.gif](/editor-user-inspector-1.gif)

And when unauthorized:
![editor-user-inspector-2.png](/editor-user-inspector-2.png)

When you see the unauthorized editor in a `Twitcher` Node and you don't want to authorize the editor.
You normally have to enter the user id.


See also [Editor Authorization](/editor/editor-authorization.md) for how to authorize the editor.
