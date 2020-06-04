# Entros - command configuration
This folder contains the bot commands, each folder represent category.

## Command-file parameter
* `description` the description of the command.
* `userPermissions` the list array of user's permissions required to run the command while in guild.
* `selfPermissions` the list array of bot's permissions required to run the command while in guild.
* `nsfw` whatever the command must run in nsfw or not.
* `guildOnly` whatever the command must run in guild or not (Always true when userPermissions is set).
* `fn` the command's main run function, and if `fn` function return string it will pass into `reply` function.
* `subCommands` the command subCommand contains object with parameter `description`, `nsfw`, and `fn`.

## Example code
```js
export default {
    description: 'Example',
    userPermissions: ['ADMINISTRATOR'],
    selfPermissions: ['ADMINISTRATOR'],
    nsfw: false,
    guildOnly: true,
    fn: async (ctx, args, argString) => {
        return "Hello world";
    },
    subCommands: {
        ping: {
            description: "Ping example",
            fn: async (ctx, args, argString) => {
                return `Websocket ping: ${Math.round(ctx.main.client.ws.ping)}`
            }
        },
        dm: {
            description: "Send direct message example",
            nsfw: false,
            fn: async (ctx, args, argsString) => {
                return ctx.author.send("Hello world!");
            }
        }
    }
}
```
