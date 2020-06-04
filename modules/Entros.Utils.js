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

}