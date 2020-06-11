const os = require('os');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
    description: "",
    fn: async (ctx) => {
        const shardGuilds = await ctx.main.client.shard.fetchClientValues('guilds.cache.size');
        const shardUsers = await ctx.main.client.shard.fetchClientValues('users.cache.size');

        const totalUsers = shardUsers.reduce((p, v) => p + v, 0);
        const totalGuilds = shardGuilds.reduce((p, v) => p + v, 0);

        let field1 = `A Fun-Utility bot made by Estrol#0021\n` +
            `**CPU:** ${os.cpus()[0].model}\n` +
            `**RAM:** ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n` +
            `**Uptime:** ${moment.duration(ctx.main.client.uptime).format(" D [D], H [H], M [M]")}\n` +
            `**Discord.js:** ${ctx.main.discord.version}\n` +
            `**Node.JS:** ${process.version}`

        let field2 = `**Guilds:** ${totalGuilds}\n` +
            `**Users:** ${totalUsers}\n`

        const embed = new ctx.main.discord.MessageEmbed()
            .setAuthor(ctx.main.client.user.username, ctx.main.client.user.displayAvatarURL())
            .addField(`❯ About Entros`, field1, true)
            .addField(`❯ Shard Stats`, field2, true)
            .setTimestamp()
            .setFooter("Entros - entrosbot.xyz");

        return ctx.reply(embed);
    }
}