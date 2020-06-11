const { Structures } = require('discord.js');

module.exports = () => {
    Structures.extend("Message", Message => {
        return class EntrosMessage extends Message {

            constructor(...params) {
                super(...params)
    
                Object.defineProperty(this, "main", { value: this.client.main });
                Object.defineProperty(this, "_command", { value: null, writable: true });
                Object.defineProperty(this, '_cmdName', { value: null, writable: true });
                Object.defineProperty(this, "dateDeleted", { value: null, writable: true });
            }
    
            get command() {
                return this._command;
            }
    
            set command(name) {
                if (this.main.commands.has(name)) {
                    let cmd = this.main.commands.get(name);
                    if (cmd.alias) cmd = this.main.commands.get(cmd.name);
    
                    this._cmdName = name;
                    this._command = cmd;
                } else {
                    this._cmdName = null;
                    this._command = null;
                }
            }
    
            reply(...args) {
                return this.handleMessage(args);
            }
    
            handleMessage(args) {
                if (this.deleted) {
                    return;
                }
    
                if (args.length !== 0 && typeof args[0] === "string" && (args[0].includes(this.client.token))) {
                    console.log(`[SECURITY] A command ${this._cmdName} tried to send bot token from author ${this.author.id}`)
                    args[0] = args[0].replace(new RegExp(this.client.token, "g"), "<redacted>");
                }
    
                return this.channel.send(...args);
            }
    
        }
    })
}