export default {
    description: 'Shows last deleted message (from user if provied) in that channel!',
    aliases: ['snipe'],
    fn: async (ctx, args) => {
        let member;

        if (args.length > 0) {
            member = ctx.main.Utils.stringMember(ctx, args.join(" "));
        }

        let msg;
        if (member) {
            msg = ctx.channel.lastMessageI.filter(m => {
                if (m) {
                    const invokedID = m.author.id;
                    const targetID = member.user.id;

                    return invokedID === targetID;
                } else return false;
            })[0];
        } else {
            msg = ctx.channel.lastMessageI[0];
        }

        if (!msg) {
            return ':x: No recent deleted message in this channel yet!';
        }

        ctx.channel.lastMessageI.remove(msg);
        const time = Math.floor(Date.now() - msg.dateDeleted);
        const content = msg.content.length < 1 ? (msg.attachments.size > 0 ? "[No message content but Image]" : "[No message content]") : msg.content;

        const embed = new ctx.main.discord.MessageEmbed()
            .setDescription(`**Message deleted in ${MsToTime(time)}**\n${content}`)
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ format: "png" }))
            .setTimestamp()
            .setFooter('Message Sniper data requested by ' + ctx.author.tag);

        return ctx.reply(embed);
    }
}

function MsToTime(ms) {
    let minutes = Math.floor(ms / 60000);
    let seconds = ((ms % 60000) / 1000).toFixed(0);

    return `${minutes} minutes and ${seconds} seconds ago`
}