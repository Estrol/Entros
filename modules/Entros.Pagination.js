const eventEmitter = require('events');
const emojis = ['⏮', '◀', '▶', '⏭', '⏹'];

module.exports = class PaginationUtil {

    constructor(main) {
        this.main = main;

        this.timeout = 6000;
        this.emojis = ['⏮', '◀', '▶', '⏭', '⏹'];
    }

    async handleReactionAdd(ctxReaction, user) {
        if (user.bot || !ctxReaction.pagination || ctxReaction.pagination.invokerID !== user.id) {
            return;
        }

        if (ctxReaction.guild && ctxReaction.channel.permissionFor(ctxReaction.guild.me).has("MANAGE_MESSAGE")) {
            return;
        }
    }

    InitPagination(ctx, invoker, pageCount) {
        if (ctx.guild && !ctx.channel.permissionFor(ctx.guild.me).has("ADD_REACTIONS")) {
            ctx.edit(":x: I'm missing `ADD_REACTIONS` permission to make this command work", {
                embed: []
            });
            return false;
        }

        const pgObject = {
            invokerUserID = invoker.id,
            pageCount: pageCount,
            currentPage = 1,
            eventEmitter = new EventEmitter(),
            timer: setTimeout()
        }
    }

    stopPagination(ctx, main) {
        for (const reaction of ctx.reactions.values()) {
            if (emojis.includes(reaction.emoji.name)) {
                for (const user of reaction.users.values()) {
                    if (user.id === main.client.user.id || (ctx.guild && ctx.channel.permissionFor(ctx.guild.id).has("MANAGE_MESSAGE"))) {
                        reaction.users.remove(user);
                    }
                }
            }
        }
    }

}