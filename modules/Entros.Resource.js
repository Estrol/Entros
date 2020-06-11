const discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

module.exports = class Resource {

    constructor(main) {
        this.main = main;
    }

    async loadCommands() {
        const commands = new discord.Collection();

        const loadCommandsIn = async (dir) => {
            for (const subName of fs.readdirSync(dir)) {
                if (fs.lstatSync(path.resolve(dir, subName)).isDirectory()) {
                    loadCommandsIn(path.resolve(dir, subName));
                } else {
                    if (!subName.endsWith(".js")) {
                        continue;
                    }

                    let file = path.resolve(dir, subName);
                    let name = subName.substring(0, subName.lastIndexOf('.')).toLowerCase();

                    if (require.cache[require.resolve(file)]) delete require.cache[require.resolve(file)];

                    const command = require(file);
                    commands.set(name, command);

                    if (command.aliases) {
                        for (const alias of command.aliases) {
                            commands.set(alias, {
                                alias: true,
                                name: name
                            })
                        }
                    }
                }
            }
        }

        try {
            await loadCommandsIn('./commands/');

            this.main.commands = commands;
        } catch (error) {
            throw error;
        }

        return true;
    }

    async loadEvents() {
        const loadEventsIn = async (dir) => {
            for (const subName of fs.readdirSync(dir)) {
                if (!subName.endsWith(".js")) {
                    continue;
                }

                let file = path.resolve(dir, subName);
                let name = subName.substring(0, subName.lastIndexOf('.'));

                if (require.cache[require.resolve(file)]) delete require.cache[require.resolve(file)];

                const event = require(file);
                this.main.client.on(name, event.callback.bind(this.main));
            }
        }

        try {
            await loadEventsIn('./events/');
        } catch (error) {
            throw error;
        }

        return true;
    }

    async loadLibrary() {
        const loadLibraryIn = async (dir) => {
            for (const subName of fs.readdirSync(dir)) {
                if (!subName.endsWith(".js")) {
                    continue;
                }

                let file = path.resolve(dir, subName);
                const library = require(file);

                library(this.main);
            }
        }

        try {
            await loadLibraryIn("./library/");
        } catch (error) {
            throw error;
        }

        return true;
    }

    async loadModules() {
        const loadExternalModules = async (dir) => {
            for (const subName of fs.readdirSync(dir)) {
                if (!subName.endsWith(".js")) {
                    continue;
                }

                let file = path.resolve(dir, subName);
                let name = subName.substring(0, subName.lastIndexOf('.'));

                const module = require(file);
                
                this.main.modules[name] = module;
            }
        }

        try {
            await loadExternalModules("./extModules/");
        } catch (error) {
            throw error;
        }

        return true;
    }

    loadDatabase() {
        const db = new Database('.data/entros.db');

        this.main.db = db;

        db.prepare('CREATE TABLE IF NOT EXISTS warns (guild_id TEXT NOT NULL, id NOT NULL, reason TEXT NOT NULL, mod TEXT NOT NULL, action TEXT NOT NULL, guild_case_id TEXT NOT NULL)').run()
        db.prepare('CREATE TABLE IF NOT EXISTS guild_prefix (guild_id TEXT NOT NULL, prefix TEXT NOT NULL)').run()
        db.prepare('CREATE TABLE IF NOT EXISTS guild_mute (guild_id TEXT NOT NULL, user_id TEXT NOT NULL, duration TEXT)').run()
        db.prepare('CREATE TABLE IF NOT EXISTS tags (name TEXT NOT NULL, content TEXT NOT NULL, userid TEXT NOT NULL)').run()
        db.prepare('CREATE TABLE IF NOT EXISTS cmd_blacklist (type TEXT NOT NULL, user_id TEXT NOT NULL)').run()

        return true;
    }

}