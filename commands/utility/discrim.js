export default {
    description: "",
    fn: async (ctx, args, argString) => {
        let discriminator = ctx.author.discriminator;
        
        if (argString || ctx.mentions.users.size > 0) {
            if (!isNaN(argString) || /^\d{4}$/.test(argString)) {
                discriminator = argString;
            } else if (ctx.mentions.users.size > 0) {
                discriminator = ctx.mentions.users.first().discriminator;
            } else {
                return ':x: argument must be Mention or Discriminator!';
            }
        }

        let resultArray = [];

        const results = await ctx.main.client.shard.broadcastEval(`
            this.users.cache.filter(usr => usr.discriminator === "${discriminator}").map(usr => usr.tag);
        `);

        for (const shardResults of results) {
            for (const tag of shardResults)
                if (!resultArray.includes(tag)) resultArray.push(tag);
        }

        return `Found ${resultArray.length} users\`\`\`${resultArray.join('\n') || 'No matching user found.'}\`\`\``;
    }
}