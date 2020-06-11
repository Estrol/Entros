module.exports = {
    callback: function (ctx) {
        if (ctx.partial) {
            return;
        }

        ctx.dateDeleted = new Date();
        ctx.channel.lastMessageI = ctx;
        setTimeout(() => {
            ctx.channel.lastMessageI.remove(ctx);
        }, 60000);
    }
}