export default (main) => {
    setInterval(async () => {
        const rows = main.db.prepare('SELECT * FROM guild_mute')
            .all()

        for (const row of rows) {
            const guild = main.client.guilds.cache.get(row.guild_id);
            if (!guild) {
                continue;
            }

            if (!guild.available) {
                continue;
            }
            const mutedUser = guild.member(row.user_id);
            if (!mutedUser) {
                continue;
            }
            const duration = row.duration;

            if (Date.now() > duration) {
                const role = guild.roles.cache.find(mRole => mRole.name.toLowerCase() === "muted");

                await mutedUser.roles.remove(role, `From caseID: ${row.guild_case_id}, automaticly unmute the user!`);
                main.db.prepare('DELETE FROM guild_mute WHERE guild_id = ? and user_id = ?')
                .run(guild.id, mutedUser.user.id);
            }
        }
    }, 1000)
}