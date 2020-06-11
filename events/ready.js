module.exports = {
    callback: function() {
        this.client.user.setActivity(`EntrosBot | ${this.client.users.cache.size} Users | ${this.client.guilds.cache.size} Guilds`, {
            type: 'WATCHING'
        });

        console.log("Bot is ready!");
    }
}