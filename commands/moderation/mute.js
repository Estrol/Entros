import ms from 'ms';

export default {
    description: "Mute a member!",
    guildOnly: true,
    userPermissions: ["MANAGE_MESSAGE"],
    fn: async (ctx, args) => {
        if (args.size < 1) {
            return ":x: Please mention someone!"
        }

        const member = ctx.main.Utils.stringMember(ctx, args.shift());
        if (!member) {
            return ":x: Invalid member!"
        }

        const rawTime = args.shift();
        if (!rawTime) {
            return ":x: Muted cannot permanent!";
        }

        const time = ms(rawTime);

        if (time > 6.048e+8) {
            return ":x: Duration must not more than a week!";
        }

        const reason = args.join(" ");
        let role = ctx.guild.roles.cache.find(ro => {
            const name = ro.name.toLowerCase();

            return name === "muted";
        });

        if (!role) {
            role = await ctx.guild.roles.create({
                data: {
                    name: "Muted",
                    reason: "Create missing muted role to make muted work!"
                }
            })
        }

        if (role.permissions.has("SEND_MESSAGES")) {
            await role.permissions.remove('SEND_MESSAGES', 'Remove send message permission to make muted work!');
        }

        ctx.main.db.prepare('INSERT INTO guild_mute(guild_id, user_id, duration) VALUES (?, ?, ?)')
            .run(ctx.guild.id, member.user.id, Date.now() + time);
        
        const caseID = ctx.main.Utils.getGuildCaseID(ctx.guild.id);
        ctx.main.Utils.insertGuildWarn(ctx.guild.id, member.user.id, reason, ctx.author.id, "muted", caseID);

        await member.roles.add(role, `CaseID: ${caseID}, muted the user for ${ms(time, { long: true })}`);
        return `:x: Successfully muted \`${member.tag}\` for \`${ms(time, { long: true })}\``;
    }
}