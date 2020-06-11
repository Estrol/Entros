module.exports = {
    description: "Unmute a muted member!",
    guildOnly: true,
    userPermissions: ["MANAGE_MESSAGE"],
    fn: async (ctx, args, argString) => {
        if (!ctx.guild.roles.cache.find(x => x.name.toLowerCase === "muted")) {
            return ":x: This guild doesn't have a role with name \"Muted\"!";
        }

        const member = ctx.main.Utils.stringMember(ctx, argString);
        if (!member) {
            return ":x: Invalid member!";
        }

        let response = `Success unmuted user ${member}!`

        const row = ctx.main.db.prepare('SELECT * FROM guild_mute WHERE guild_id = ? and user_id = ?')
        .get(ctx.guild.id, member.user.id);

        if (row) {
            ctx.main.db.prepare('DELETE FROM guild_mute WHERE guild_id = ? and user_id = ?')
            .run(ctx.guild.id, member.user.id);
        } else {
            response += `\nPls.... Stop mixing other's bot mute command, this muted is not registered in my database!`;
        }

        const role = ctx.guild.roles.cache.find(mRole => mRole.name.toLowerCase() === "muted");
        
        if (!member.roles.cache.has(role)) {
            return ":x: This user already unmuted!"
        }

        await member.roles.remove(role);
        return response;
    }
}