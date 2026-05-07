# FAQ

**Why are you using SpriteFrames instead of AnimatedTexture?**  
Animated Textures are deprecated, and I don't want to add deprecated stuff to a brand-new lib. 
Better use a solution that is stable in the long run. Otherwise, 
 the user of the lib has to change their implementation as soon as Godot decides to drop the support fully.

**Why is the generated folder committed to the repository?**  
This Library focuses on beginners, and the API won't change much anyway. One step less for beginners of this library.

**Why is everything a singleton with `.instance`?**  
I don't want to pollute the Autoloads. Also, it has the advantage that you can test scenes separately without  
booting all stuff that is needed for Twitch. 

**How do I use my Bot Account?**  
Twitcher has a Bot Node that can be used to send messages or announcements to the chat. 
To use it, add the Bot Node to your scene. You can use the same Client ID and Secret as you would use for the normal 
application. (That works only for non-Public application otherwise you don't have the secret)
Then you will need to authorize the Bot Account with your application. 
You can then send messages or announcements by calling the appropriate methods on the Bot Node.
See also the [Bot Node](/core-nodes/twitch-bot.md)