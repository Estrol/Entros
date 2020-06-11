const { ShardingManager, Collection } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

class Entros extends ShardingManager {

    constructor() {
        super('./shardScript.js', {
            totalShards: "auto",
            token: process.env.token,
            mode: "process"
        });

        this.ratelimits = new Collection();
        this.on("shardCreate", shard => shard.on("message", message => this.handleShardMessage(shard, message)));

        this.spawn();
    }

    async handleShardMessage(shard, message) {
        switch (message.type) {
            case "ratelimit": {
                const reply = Object.assign(this.handleRatelimit(message), {
                    id: message.id,
                    type: 'ratelimit'
                });

                shard.send(reply);
                break;
            }
        }
    }

    handleRatelimit(message) { // Sharding based Ratelimits
        const { user, command, cmdCooldown } = message;

        if (!this.ratelimits.has(user)) {
            const intialRatelimit = new Collection();
            intialRatelimit.set(command, {
                expiresAt: Date.now() + cmdCooldown,
                hitBefore: false
            });

            this.ratelimits.set(user, intialRatelimit);
        } else {
            const userRateLimitInfo = this.ratelimits.get(user);
            if (userRateLimitInfo.has(command)) {
                const commandRatelimitInfo = userRateLimitInfo.get(command);
                if (commandRatelimitInfo.expiresAt > Date.now()) {
                    const response = { 
                        limited: true, 
                        firstHit: !commandRatelimitInfo.hitBefore ? true : false, 
                        delay: commandRatelimitInfo.expiresAt - Date.now() 
                    }

                    if (!commandRatelimitInfo.hitBefore) {
                        commandRatelimitInfo.hitBefore = true;

                        this.ratelimits.set(command, commandRatelimitInfo);
                    }

                    return response;
                }

                if (commandRatelimitInfo.expiresAt < Date.now()) {
                    userRateLimitInfo.set(command, {
                        expiresAt: Date.now() + cmdCooldown,
                        hitBefore: false
                    });
    
                    this.ratelimits.set(user, userRateLimitInfo);
                }
            } else {
                userRateLimitInfo.set(command, {
                    expiresAt: Date.now() + cmdCooldown,
                    hitBefore: false
                });

                this.ratelimits.set(user, userRateLimitInfo);
            }
        }

        return { limited: false }
    }

}

new Entros();