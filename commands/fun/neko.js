export default {
    description: "Get neko images uWu",
    fn: async (ctx, args) => {
        const nameTag = (args.shift() || "").toLowerCase();
        let image;
        let tag;

        if (!nameTag) {
            const { sfw } = ctx.main.modules.nekos;
            tag = sfw[Math.floor(Math.random() * sfw.length)];

            const response = await ctx.main.modules.nekos.get(tag);
            image = response.url;
        } else {
            const { sfw, nsfw } = ctx.main.modules.nekos;
            const combinedTags = [...sfw, ...nsfw];

            if (!combinedTags.includes(nameTag)) {
                return `:x: Neko tag ${nameTag} not found!`
            }

            if (nsfw.includes(nameTag) && !ctx.channel.nsfw) {
                return `:x: Neko tag ${nameTag} is restricted to NSFW channel only!`
            }

            const response = await ctx.main.modules.nekos.get(nameTag);
            image = response.url;
        }

        const embed = new ctx.main.discord.MessageEmbed()
            .setImage(image)
            .setDescription(`EntrosWeebAPI Image: ${!nameTag ? `Random tag ${tag}` : nameTag}`)
            .setTimestamp()
            .setFooter("Entros - entrosbot.xyz");

        return ctx.reply(embed);
    },
    subCommands: {
        sfw: {
            description: "Get random safe-at-work neko images!",
            fn: async (ctx) => {
                const { sfw } = ctx.main.modules.nekos;
                const tag = sfw[Math.floor(Math.random() * sfw.length)];

                const response = await ctx.main.modules.nekos.get(tag);
                const image = response.url;

                const embed = new ctx.main.discord.MessageEmbed()
                    .setImage(image)
                    .setDescription(`EntrosWeebAPI Image: random tag ${tag}`)
                    .setTimestamp()
                    .setFooter("Entros - entrosbot.xyz");

                return ctx.reply(embed);
            }
        },
        nsfw: {
            description: "Get random not-safe-at-work neko images!",
            nsfw: true,
            fn: async (ctx) => {
                const { nsfw } = ctx.main.modules.nekos;
                const tag = nsfw[Math.floor(Math.random() * nsfw.length)];

                const response = await ctx.main.modules.nekos.get(tag);
                const image = response.url;

                const embed = new ctx.main.discord.MessageEmbed()
                    .setImage(image)
                    .setDescription(`EntrosWeebAPI Image: Random tag ${tag}`)
                    .setTimestamp()
                    .setFooter("Entros - entrosbot.xyz");

                return ctx.reply(embed);
            }
        }
    }
}