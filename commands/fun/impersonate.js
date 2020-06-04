export default {
    description: 'Impersonate someone using webhook (this method will not effective on advanced users)',
    fn: async (ctx, args) => {
        if (args.length < 1) {
            return "Who you gonna to impersonate?";
        }

        if (args.length == 1) {
            return "What message would you send?";
        }

        const member = ctx.main.Utils.stringMember(ctx, args.shift());
        if (!member) {
            return ":x: Unknown member!";
        }

        const username = member.nickname ? member.nickname : member.user.username;

        const webhook = await ctx.channel.createWebhook(`${username}`, {
            avatar: member.user.displayAvatarURL(),
            reason: `Impersonate command, author: ${ctx.author.tag} <${ctx.author.id}>`
        });

        await ctx.delete();
        await webhook.send(args.join(' '));
        await webhook.delete();
    }
}