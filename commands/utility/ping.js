module.exports = {
    description: 'A ping command, that checking bot message time and discord gateway time!',
    fn: async (ctx) => {
        const message = await ctx.reply('Pinging...');

        console.log(ctx.main);

        return message.edit(`Pong!, Message: ${message.createdTimestamp - ctx.createdTimestamp}ms, Gateway: ${ctx.main.client.ws.ping}ms`);
    }
}