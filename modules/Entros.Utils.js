export default class Utils {
    
    constructor(main) {
        this.main = main;
    }

    stringMember(ctx, text) {
        if (!ctx.guild) {
            return;
        }

        if (!text) {
            return;
        }

        let mostRecentTimestamp = 0;
        let match;

        for (const member of ctx.guild.members.cache.array()) {
            if (!(member.user.tag.toLowerCase().includes(text.toLowerCase())) &&
                !(member.nickname && member.nickname.toLowerCase().includes(text.toLowerCase())) &&
                !(member.user.id === text.replace(/[^\d]/g, '')) ||
                ((member.lastMessage ? member.lastMessage.createdTimestamp : 0) < mostRecentTimestamp)) continue;
            mostRecentTimestamp = member.lastMessage ? member.lastMessage.createdTimestamp : 0;
            match = member;
        }

        return match;
    }

    async stringUser(ctx, text) {
        if (!text) {
            return;
        }

        if (!ctx) {
            return;
        }

        let user;

        if (!isNaN(text)) {
            user = await this.main.client.users.fetch(text);
        } else {
            const member = this.stringMember(ctx, text);
            if (member) {
                user = member.user;
            }
        }

        if (!user) {
            throw new Error("Invalid user!");
        }

        return user;
    }

    getGuildCaseID(guildID) {
        Array.max = function(array) {
            return Math.max.apply(Math, array);
        }

        const rows = this.main.db.prepare("SELECT * FROM warns WHERE guild_id = ?").all(guildID);

        if (rows.length === 0) {
            return 0;
        }

        const results = rows.map(r => r.guild_case_id);

        return Array.max(results);
    }

    insertGuildWarn(guildID, userID, reason = "No Reason provided", authorID, action, guildCaseID) {
        this.main.db.prepare("INSERT INTO warns(guild_id, id, reason, mod, action, guild_case_id) VALUES(?, ?, ?, ?, ?, ?)")
        .run(guildID, userID, reason, authorID, action, guildCaseID);

        return true;
    }
}