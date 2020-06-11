const { createCanvas, loadImage } = require('canvas');
const fetch = require('node-fetch');
const path = require('path');

module.exports = {
    description: 'Create slap image using superhero slap template',
    guildOnly: true,
    fn: async (ctx, args) => {
        if (!args) {
            return ":x: Please input member to add effect!"
        }

        let member1;
        let member2

        let isSelf = false;

        member1 = ctx.main.Utils.stringMember(ctx, args.shift());
        if (!member1) {
            return ":x: Member not found!"
        }

        if (member1.user.id === ctx.author.id) {
            isSelf = true;
        }

        if (args.length > 0) {
            member2 = ctx.main.Utils.stringMember(ctx, args.shift())
            if (!member2) {
                return ":x: Member not found!"
            }

            isSelf = false;
        } else {
            if (isSelf) {
                member2 = member1;
                member1 = ctx.guild.me;
            } else {
                member2 = member1;
                member1 = ctx.member;
            }
        }

        try {
            const imgArgv1 = [350, 70, 200, 200];
            const imgArgv2 = [580, 260, 220, 220];

            const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'blank.png'));
            const base2 = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'slap.png'));

            const msg = await ctx.reply("Downloading Avatar Image...");
            const res1 = await fetch(member1.user.displayAvatarURL({ size: 1024, format: 'png' }));
            const res2 = await fetch(member2.user.displayAvatarURL({ size: 1024, format: 'png' }));
            const body1 = await res1.buffer();
            const body2 = await res2.buffer();

            await msg.edit("Processing image....");
            const avatar1 = await loadImage(body1);
            const avatar2 = await loadImage(body2);

            const canvas = createCanvas(base.width, base.height);
            const context = canvas.getContext('2d');

            context.drawImage(base, 0, 0);
            context.drawImage(base2, 0, 0);
            context.drawImage(avatar1, ...imgArgv1);
            context.drawImage(avatar2, ...imgArgv2);

            await msg.delete();
            return ctx.reply({
                files: [{
                    attachment: canvas.toBuffer(),
                    name: 'slap.png'
                }]
            });
        } catch (error) {
            console.error(error);
            return ":x: There a error while processing your image";
        }
    }
}