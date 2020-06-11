const discord = require('discord.js');
const dotenv = require('dotenv');
const Resource = require('./modules/Entros.Resource.js');
const MessageHandler = require('./modules/Entros.MessageHandler.js');
const EntrosClient = require('./modules/Entros.Client.js');
const Utils = require('./modules/Entros.Utils.js');

dotenv.config();

process.on('unhandledRejection', (error, promise) => {
    console.error(error);
});

class EntrosShardChild {
    
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

module.exports = new EntrosShardChild();

