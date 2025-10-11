# Guide: Multiple Account

You want to have multiple Twitch accounts?
There is a simple node (`TwitchBot`) for having a bot account to send messages.
It uses client credentials to authorize and needs to follow some rules. 
See [here](https://dev.twitch.tv/docs/api/reference/#send-chat-message) for more information.
It only supports sending messages to channels as a bot nothing more.

For a more sophisticated solution, you need to understand how OAuth works and build your own setup with multiple 
authorization tokens by yourself.

## Prerequisites
- Two different Twitch Accounts
- A confidential Client Type of your registered application in https://dev.twitch.tv

## How to

- Add the `TwitchBot` node to your scene.
- Set the `OAuthSetting` from your normal setup to it.
- Set the sender property to your bot account.
- Set the receiver property to the channel you want to send messages to.
- Then you can use `send_message` to send messages.

## Background Knowledge

The node is setting up itself. It will create a new TokenHandler and OAuth client for the bot account and will change 
the flow for the Bot to client credentials. It will fetch the access token on the first sent message if needed.

The bot badge only will be shown when the receiver and sender are different accounts.