import * as discord from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';

export default class Resource {

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
                    let uri = `file://${file}`;

                    const command = (await import(uri)).default;
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
                let uri = `file://${file}`;

                const event = (await import(uri)).default;

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
                let uri = `file://${file}`;

                const library = (await import(uri)).default;

                library();
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
                let uri = `file://${file}`;

                const module = (await import(uri));
                
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

}