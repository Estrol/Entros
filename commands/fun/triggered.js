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

        const member1 = ctx.main.Utils.stringMember(ctx, args.shift());
        if (!member1) {
            return ":x: Member not found!"
        }

        try {

            const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'triggered.png'));
            const blank = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'blank.png'));

            const msg = await ctx.reply("Downloading image...");
            const response = await fetch(member1.user.displayAvatarURL({ format: 'png', size: 1024 })); // this is how you fetch image!

            await msg.edit("Processing image...");
            const body = await response.buffer()
            const avatar = await loadImage(body)

            const canvas = createCanvas(avatar.width, avatar.height);
            const context = canvas.getContext('2d');

            context.drawImage(blank, 0, 0);
            context.drawImage(avatar, 0, 0);
            context.drawImage(base, 0, 0);

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