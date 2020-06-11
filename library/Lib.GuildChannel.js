const { Structures } = require('discord.js');

module.exports = () => {
    Structures.extend("TextChannel", TextChannel => {
        return class EntrosTextChannel extends TextChannel {

            constructor(...params) {
                super(...params)

                Object.defineProperty(this, "_lastMessageI", { value: [] });
            }

            get lastMessageI() {
                const newArry = [...this._lastMessageI].reverse();
                return newArry;
            }

            set lastMessageI(value) {
                this._lastMessageI.push(value);
            }

        }
    })
}