const { createCanvas, loadImage } = require('canvas');
const fetch = require('node-fetch');
const path = require('path');

module.exports = {
    description: 'Create a fake tweet!',
    guildOnly: true,
    fn: async (ctx, args) => {
        if (args.length < 1) {
            return ":x: Please input member to who become author of tweet!";
        }

        const member = ctx.main.Utils.stringMember(ctx, args.shift());
        if (!member) {
            return ":x: Member not found!";
        }

        if (args.length < 1) {
            return ":x: What text you gonna tweet it?";
        }

        const rawTweetText = args.join(" ");
        if (rawTweetText.length > 100) {
            return ":x: The text is too long (> 100)";
        }

        try {
            const avatarArg = [41, 37, 100, 100];
            const whoLiked = [400, 470, 51, 50];
            const text1 = [160, 80];
            const text2 = [160, 120];
            const text3 = [50, 215];
            const text4 = [50, 265];

            const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'tweet.png'));
            const blank = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'blank.png'));

            const msg = await ctx.reply("Downloading image....");
            const random9Avatars = [];

            const randomMembers = ctx.guild.members.cache.array()
                .filter(mem => mem.user.avatarURL() !== null)
                .sort(() => Math.random() - 0.5);
                
            for (let i = 0; i < 9; i++) {
                random9Avatars.push(randomMembers[i]);
            }

            const imageArrays = await Promise.all(random9Avatars.map(async m => {
                const body = await fetch(m.user.displayAvatarURL({ format: 'png', size: 1024 }));
                return loadImage(await body.buffer());
            }));

            const avatarRequest = await fetch(member.user.displayAvatarURL({ format: 'png', size: 1024 }));
            const avatar = await loadImage(await avatarRequest.buffer());

            await msg.edit("Processing image....");
            const canvas = createCanvas(base.width, base.height);
            const context = canvas.getContext('2d');

            context.drawImage(blank, 0, 0);
            context.drawImage(avatar, ...avatarArg);
            context.drawImage(base, 0, 0);

            context.font = "40px Arial";
            context.fillText(member.user.username, ...text1);

            let originalFillSyle = context.fillStyle;

            context.font = "27px Arial";
            context.fillStyle = "#737373";
            context.fillText(`@${member.user.username}`, ...text2);

            for (const img of imageArrays) {
                context.drawImage(img, ...whoLiked);
                whoLiked[0] += 60;
            }

            let tText1 = rawTweetText;
            let tText2;

            if (tText1.length > 50) {
                tText1 = rawTweetText.substring(0, 50);
                tText2 = rawTweetText.substring(50, 100);
            }

            context.font = "40px Arial";
            context.fillStyle = originalFillSyle;
            context.fillText(tText1, ...text3);

            if (tText2) {
                context.fillText(tText2, ...text4)
            }

            await msg.delete();
            return ctx.reply({
                files: [{
                    attachment: canvas.toBuffer(),
                    name: 'tweet.png'
                }]
            });
        } catch (error) {
            console.error(error);
            return ":x: There a error while processing your image";
        }
    }
}