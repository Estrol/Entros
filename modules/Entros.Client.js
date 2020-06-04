import * as discord from 'discord.js';

export default class EntrosClient extends discord.Client {
    constructor(options) {
        super(options);

        this.main = options.main;
        this.admins = options.admins || [];
    }

    isAdmin(userid) {
        return this.admins.includes(userid);
    }
}