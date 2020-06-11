const discord = require('discord.js');

module.exports = class EntrosClient extends discord.Client {
    constructor(options) {
        super(options);

        this.main = options.main;
        this.admins = options.admins || [];
    }

    isAdmin(userid) {
        return this.admins.includes(userid);
    }
}