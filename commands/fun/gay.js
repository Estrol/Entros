import fetch from 'node-fetch';
import path from 'path';
import module from 'module';
import url from 'url';

const { createCanvas, loadImage } = require('canvas');
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default {
    description: 'Add rainbow effect (or gay flag whatever) into image!',
    guildOnly: true,
    fn: async (ctx, args, argString) => {
        if (!argString) {
            return ":x: Please input member to add effect!"
        }

        const member = ctx.main.Utils.stringMember(ctx, argString);
        if (!member) {
            return ":x: Member not found!"
        }

        try {
            const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'gay.png'));

            const msg = await ctx.reply("Downloading Avatar Image...");
            const response = await fetch(member.user.displayAvatarURL({ format: 'png', size: 1024 }));
            const body = await await response.buffer()

            await msg.edit("Processing Image...")
            const avatar = await loadImage(body);
            const canvas = createCanvas(avatar.width, avatar.height);
            const context = canvas.getContext('2d');

            context.drawImage(avatar, 0, 0);
            context.drawImage(base, 0, 0, avatar.width, avatar.height);

            await msg.delete();
            return ctx.reply({
                files: [{
                    attachment: canvas.toBuffer(),
                    name: 'gay.png'
                }]
            });
        } catch (error) {
            console.error(error);
            return ":x: There a error while processing your image";
        }
    }
}