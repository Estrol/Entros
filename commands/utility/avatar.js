module.exports = {
    description: 'Show a avatar of you!',
    fn: async (ctx, args, argString) => {
        if (!argString) {
            return ctx.author.displayAvatarURL({ format: 'png', size: 1024 })
        }

        if (!ctx.guild && isNaN(argString)) {
            return ":x: Use userid to get avatar when in DMs!";
        }

        try {
            const user = await ctx.main.Utils.stringUser(ctx, argString);
            return user.displayAvatarURL({ size: 1024, format: 'png' });
        } catch (error) {
            return ":x: User not found or non existed in this shard!";
        }
    }
}