/** Declarating CommonJS compatibility inside EMCAScript module */
global.require = module.createRequire(import.meta.url);

import * as discord from 'discord.js';
import * as module from 'module';
import dotenv from 'dotenv';
import Resource from './modules/Entros.Resource.js';
import MessageHandler from './modules/Entros.MessageHandler.js';
import EntrosClient from './modules/Entros.Client.js';
import Utils from './modules/Entros.Utils.js';

dotenv.config();

process.on('unhandledRejection', (error, promise) => {
    console.error(error);
});

export default class EntrosShardChild {
    
    constructor() {
        this.discord = discord;
        this.db = null;

        this.client = new EntrosClient({
            disableMentions: 'everyone',
            partials: ['MESSAGE'],
            admins: ['523854355955449896'],
            main: this,
        });

        this.commands = new discord.Collection();
        this.messageCaches = new discord.Collection(); 
        this.musicQueues = new discord.Collection();
        this.voiceStreams = new discord.Collection();
        this.playingSongs = new discord.Collection();
        this.modules = {};

        this.Resource = new Resource(this);
        this.Resource.loadLibrary();
        this.Resource.loadCommands();
        this.Resource.loadEvents();
        this.Resource.loadModules();
        this.Resource.loadDatabase();

        this.Utils = new Utils(this);

        this.MessageHandler = new MessageHandler(this);

        this.client.login(process.env.token);
    }

}

new EntrosShardChild();

