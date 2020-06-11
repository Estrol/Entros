module.exports = {
    description: 'Asking the magic 8ball about whatever future',
    fn: (ctx, args) => {
        if (args.length < 1) {
            return "What you gonna ask?"
        }

        const probablyAnswer = ["I guess so", "Maybe?", "I think? yes"];
        const nopeAnswer = ["Nah", "Nope", "NO!", "LOL no"];
        const yesAnswer = ["Yes", "Yes it's", "Ye"];

        const answerList = [probablyAnswer, nopeAnswer, yesAnswer];
        const random = answerList[Math.floor(Math.random() * answerList.length)];
        const answer = random[Math.floor(Math.random() * random.length)];

        const embed = new ctx.main.discord.MessageEmbed()
            .setDescription(`**Q**: ${args.join(" ")}\n**A**: ${answer}`)
            .setAuthor("8Ball o Magic", "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/241/pool-8-ball_1f3b1.png")
            .setTimestamp()
            .setFooter("Entros - entrosbot.xyz");

        return ctx.reply(embed);
    }
}