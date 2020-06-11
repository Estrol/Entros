const { MessageEmbed } = require('discord.js');

module.exports = {
    description: 'Shows Entros\'s bot information e.g Status, Server stats',
    fn: (ctx) => {
        const embed = new MessageEmbed()
            .setTitle('Entros Information')
            .setDescription('A bot running in ECMAScript module')
        
        return ctx.reply(embed);
    }
}