export default class MessageHandler {

    constructor(main) {
        this.main = main;
    }

    async handleMessage(ctx) {
        if (!this.shouldHandleMessage(ctx)) {
            return;
        }

        if (ctx.content.trim() === `<@!${this.main.client.user.id}>` || ctx.content.trim() === `<@${this.main.client.user.id}>`) {
            return ctx.reply('Hello there! visit https://entrosbot.xyz to get list commands!');
        }

        const mentionPrefix = new RegExp(`^<@!?${this.main.client.user.id}>`);
        let prefix = "e!";

        if (!ctx.content.startsWith(prefix) && !mentionPrefix.test(ctx.content) && ctx.guild) {
            return;
        }

        const msgArguments = (mentionPrefix.test(ctx.content) ? ctx.content.replace(mentionPrefix, '') : ctx.content.replace(prefix, '')).replace(/^ +/g, '').split(/ +/g);
		let commandName = msgArguments.shift();	

        if (!commandName) {
            return;
        }

        commandName = commandName.toLowerCase();
        if (!this.main.commands.has(commandName)) {
            if (!ctx.guild) {
                if (ctx.attachments.size > 0) {
                    await ctx.reply(`Thanks for sending me Image, File or whatever stuff!`);
                } else {
                    await ctx.reply(`Unknown command!, Please use ${prefix}help to get list available commands`);
                }
            }

            return;
        }

        let command = this.main.commands.get(commandName);
        if (command.alias) {
            command = this.main.commands.get(command.name);
        }

        ctx.command = commandName;

        if (command.guildOnly && !ctx.guild) {
            await ctx.reply(":x: This command must run in guild!");
            return;
        }

        const permissionCheck = this.handlePermissions(command, ctx);
        if (!permissionCheck.pass) {
            await ctx.reply(`${permissionCheck.reason}\n\`\`\`${permissionCheck.missingPermissions.join(', ')}\`\`\``);
            return;
        }

        if (command.nsfw && !ctx.channel.nsfw) {
            await ctx.reply(":x: This command is NSFW, and only can execute in NSFW channel!");
            return;
        }

        if (!this.main.client.isAdmin(ctx.author.id)) {
            const ratelimitInfo = await this.getRatelimitsInfo(ctx, command, command.cooldown || 5000);
            if (ratelimitInfo.limited) {
                if (ratelimitInfo.firstHit) {
                    await ctx.reply(`:x: Slow down... Please wait another \`${Math.ceil(ratelimitInfo.delay / 1000)}s\` to use command \`${commandName}\` again!`);  
                    return;
                }

                return;
            }
        }

        let argString = msgArguments.join(' ');
        let split = this.splitArguments(argString);

        const subCommandText = (split[0] || "").toLowerCase();
        const subCommand = typeof command.subCommands === "object" ? command.subCommands[subCommandText] : null;
        if (subCommand) {
            split.shift(); // remove in-case sub-commands is real! 0_0
            argString = split.join(" ");
            if (subCommand.nsfw && !ctx.channel.nsfw) {
                await ctx.reply(`:x: This subCommand of ${commandName} is NSFW, and only can execute in NSFW channel!`);
                return;
            }
    
            command = subCommand;
        }

        try {
            let result = await command.fn(ctx, split, argString);

            if (typeof result === "string") {
                await ctx.reply(result);
            }
        } catch (error) {
            await ctx.reply(`An error occured while executing command: \`[${commandName}]\`\n\`\`\`js\n${error}\`\`\``);
            console.error(error);
        }
    }

    shouldHandleMessage(ctx) {
        if (ctx.partial) {
            return false;
        }

        if (ctx.author.bot) {
            return false;
        } else if (ctx.author.id === this.main.client.user.id) {
            return false;
        }

        return true;
        
    }

    splitArguments(string) {
		const splitArguments = string.trim().split('');

		const args = [];
		let inMultiwordArg = false;
		let currentArg = '';

		for (const char of splitArguments) {

			if (char === '"') {
				inMultiwordArg = !inMultiwordArg;
			} else if (char === ' ' && !inMultiwordArg && currentArg) {
				args.push(currentArg);
				currentArg = '';
			} else if (char !== ' ' || inMultiwordArg) currentArg += char;

		}

		if (currentArg) args.push(currentArg);
		args.map(a => a.replace(/\"/g, ""));

		return args;
    }
    
    async getRatelimitsInfo(ctx, command, cmdCooldown) {
        const aReply = new Promise((resolve) => {
            const handleMessage = icpMessage => {
                if (icpMessage.type === "ratelimit" && icpMessage.id === ctx.id) {
                    resolve(icpMessage);
                } else process.once("message", handleMessage);
            };

            process.once("message", handleMessage);
        });

        this.main.client.shard.send({
            type: "ratelimit",
            id: ctx.id,
            user: ctx.author.id,
            command: command.name,
            cmdCooldown: cmdCooldown
        });

        return await aReply;
    }

    handlePermissions(command, ctx) {
        const missingPermissions = [];

        for (const permission of (command.userPermissions || [])) {
            switch (permission) {
                case 'BOT_OWNER': {
                    if (!this.main.client.isAdmin(ctx.author.id)) {
                        missingPermissions.push(permission);
                    }
                    break;
                }

                default: {
                    if (!ctx.guild) {
                        missingPermissions.push(permission);
                    } else {
                        if (!ctx.guild.member(ctx.author.id).permissions.has(permission)) {
                            missingPermissions.push(permission)
                        }
                    }
                }
            }
        }

        if (missingPermissions.length > 0) {
            if (missingPermissions.includes('BOT_OWNER')) {
                return { pass: false, reason: 'Sorry, this command only restricted to BOT Developer!', missingPermissions }
            }

            if (!ctx.guild) {
                return { pass: false, reason: 'Sorry, this command need executable in guild only!', missingPermissions }
            }

            return { pass: false, reason: 'Sorry, you missing the following permissions required by this command:', missingPermissions }
        }

        return { pass: true, reason: '', missingPermissions }
    }

}
