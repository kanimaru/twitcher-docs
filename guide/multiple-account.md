# Guide: Multiple Account

Maybe you want to have your message written with a bot account instead of your own to not confuse the viewer.
Multiple users in `Twitcher` is possible but not trivial.

## Prerequisites
- 2 different Twitch Accounts

## How to

- You have to create multiple `TwitchAuth` nodes so that you can authorize tokens for different users.
- The `TwitchSetting` can be the same, but you need to assign a new `OAuthToken` and save it.

The problem is that the Authorization automatically opens in your main browser window where you already have a logged-in user.
You also don't want to log out and log in every time. 