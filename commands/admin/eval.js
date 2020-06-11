const util = require('util');

module.exports = {
    description: 'Evaluate ECMAScript javascript code!',
    userPermissions: ['BOT_OWNER'],
    fn: async (ctx, args, argString) => {
        if (!argString) {
            return ctx.reply('code plz');
        }

        try {
            const evaled = await eval(argString);
            const string = util.inspect(evaled, {
                depth: 0
            });

            await ctx.reply(string, {
                code: 'js'
            });

            return;
        } catch (error) {
            await ctx.reply(error, {
                code: 'js'
            });

            return;
        }
    }
}