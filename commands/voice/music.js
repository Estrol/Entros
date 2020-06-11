const humanizeDuration = require("humanize-duration");
const fetch = require('node-fetch');
const ytdl = require('ytdl-core-discord');

const hd = humanizeDuration.humanizer({
    languages: {
        youtube: {
            m: () => 'm',
            s: () => 's'
        }
    }
})

module.exports = {
    description: "Play a music!",
    guildOnly: true,
    fn: async (ctx, args) => {
        if (args.length > 0) {
            return ":x: Invalid music subCommand, List available Music's subCommand: `play`, `stop`, `queue`, `skip`";
        }

        return "ℹ️ List available Music's subCommand: `play`, `stop`, `queue`, `skip`"
    },
    subCommands: {
        play: {
            description: "Play a song or add queue!",
            fn: async (ctx, args) => {
                const argumentString = args.join(' ');
                if (argumentString.length < 1) {
                    return ":x: Please input query or youtube url!";
                }

                const voiceChannel = ctx.member.voice.channel;
                if (!voiceChannel) {
                    return ":x: You must be in voice channel to play Music!";
                }

                if (!voiceChannel.permissionsFor(ctx.guild.me).has("CONNECT")) {
                    return ":x: I don't have permission to enter that command!";
                }

                if (ctx.guild.me.voice.channel && ctx.guild.me.voice.channel.id !== voiceChannel.id) {
                    return ":x: You must be in same voice channel with me to use this command!";
                }

                let ytRequest;

                try {
                    ytRequest = await fetch(`https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&q=${encodeURI(argumentString)}&key=${encodeURI(process.env.YT_KEY_API)}`, {
                        method: "GET"
                    });
                } catch (error) {
                    console.log(error);
                    return ":x: There a error while requesting api to remote network!"
                }

                let body = await ytRequest.json();
                console.log(body);
                if (!body.items) {
                    return ":x: The requested video could not be found!";
                }   

                let video = body.items[0];
                if (!video) {
                    return ":x: The requested video could not be found!";
                }

                let videoInfoRequest;

                try {
                    videoInfoRequest = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${encodeURI(video.id.videoId)}&part=contentDetails&key=${encodeURI(process.env.YT_KEY_API)}`, {
                        method: "GET"
                    });
                } catch (error) {
                    console.log(error);
                    return ":x: There a error while requesting api to remote network!"
                }
                
                let videoInfo = await videoInfoRequest.json();
                console.log(videoInfo);

                if (!videoInfo.items) {
                    return ":x: The requested video could not be found!";
                }

                const pthms = videoInfo.items[0].contentDetails.duration;
                const duration = pthmsToMs(pthms);

                if (duration > 61 * 60 * 1000) {
                    return ":x: Songs can't be longer than 60 minutes or 1 hour!";
                }

                const connection = await voiceChannel.join();
                let clearGuildInfo = () => {
                    ctx.main.musicQueues.delete(ctx.guild.id);
                    ctx.main.voiceStreams.delete(ctx.guild.id);
                    ctx.main.playingSongs.delete(ctx.guild.id);
                }

                connection.on('disconnect', async () => {
                    clearGuildInfo();
                });

                connection.on("failed", async (error) => {
                    clearGuildInfo();

                    await voiceChannel.leave();
                });

                connection.on("error", async (error) => {
                    clearGuildInfo();

                    console.error(error);
                    await ctx.reply(":x: An error occured and the error automaticly send to developer!");
                    await voiceChannel.leave();
                });

                await ctx.guild.me.voice.setSelfDeaf(true);

                let playSong = async (currentSong) => {
                    let endReason = null;

                    try {
                        const stream = await downloadSong(currentSong);

                        const dispatcher = connection.play(stream, {
                            passes: 2,
                            type: "opus"
                        });

                        dispatcher.endSong = (reason) => {
                            dispatcher.end();
                            endReason = reason;
                        }

                        dispatcher.on("error", async (error) => {
                            clearGuildInfo();

                            if (error.message === "Connection not established within 15 seconds.") {
                                await ctx.reply(":x: An error occured while playing/connecting to voice channel!");
                                await voiceChannel.leave();
                            } else {
                                console.error(error);
                                await ctx.reply(":x: An error occured and the error automaticly send to developer!");
                                await voiceChannel.leave();
                            }
                        })
    
                        dispatcher.on("finish", async () => {
                            if (endReason === "skip" && ctx.main.playingSongs.has(ctx.guild.id)) {
                                ctx.main.playingSongs.delete(ctx.guild.id);
                            }
    
                            if (endReason === "leave") {
                                ctx.main.playingSongs.delete(ctx.guild.id);
                                ctx.main.musicQueues.delete(ctx.guild.id);
                                ctx.main.voiceStreams.delete(ctx.guild.id);
                                return;
                            }
    
                            if (ctx.main.musicQueues.has(ctx.guild.id) && ctx.main.musicQueues.get(ctx.guild.id).length !== 0) {
                                let currentSong = ctx.main.musicQueues.get(ctx.guild.id)[0];
    
                                ctx.main.playingSongs.set(ctx.guild.id, Object.assign(currentSong, {
                                    startedAt: Date.now()
                                }));
    
                                await playSong(currentSong);
                                ctx.reply(`Now playing: \`${currentSong.video.title}\` by \`${currentSong.video.author}\` \`[${hd(currentSong.video.duration, youtubeHdConfig)}]\`\nQueued by \`${ctx.main.client.users.cache.has(currentSong.user) ? ctx.main.client.users.cache.get(currentSong.user).tag : "Unknown#0000"}\`\n\nURL: <${currentSong.url}>`);
                                ctx.main.musicQueues.set(ctx.guild.id, ctx.main.musicQueues.get(ctx.guild.id).splice(1));
                            } else {
                                ctx.reply(`No more songs in queue, Leaving channel!`);
                                ctx.main.musicQueues.delete(ctx.guild.id);
                                ctx.main.voiceStreams.delete(ctx.guild.id);
                                ctx.main.playingSongs.delete(ctx.guild.id);
                                voiceChannel.leave();
                            }
                        })

                        ctx.main.voiceStreams.set(ctx.guild.id, dispatcher);
                    } catch (error) {
                        connection.emit('error', error);
                    }
                };

                let downloadSong = async (currentSong) => {
                    const msg = await ctx.reply(`Downloading song: \`${currentSong.video.title}\` by \`${currentSong.video.author}\``);

                    const stream = await ytdl(currentSong.url, {
                        filter: "audioonly"
                    });

                    await msg.delete();

                    return stream;
                }
                
                let currentSong = {
                    url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
                    user: ctx.author.id,
                    video: {
                        author: video.snippet.channelTitle,
                        title: video.snippet.title,
                        duration: duration
                    }
                };

                if (ctx.main.voiceStreams.has(ctx.guild.id)) {
                    let queue = ctx.main.musicQueues.get(ctx.guild.id) || [];

                    if (queue.filter(song => song.url === currentSong.url).length > 0) {
                        ctx.reply(":x: This song already in queued. See the queued songs with \`qeueu category\`");
                        return;
                    }

                    queue.push(currentSong);
                    await ctx.main.musicQueues.set(ctx.guild.id, queue);

                    await ctx.reply(`Added to queue: \`${currentSong.video.title}\` by \`${currentSong.video.author}\` \`[${hd(currentSong.video.duration, youtubeHdConfig)}]\`\n\nURL: <${currentSong.url}>`);
                } else {
                    ctx.main.playingSongs.set(ctx.guild.id, Object.assign(currentSong, {
                        startedAt: Date.now()
                    }));

                    console.log(currentSong);
                    await playSong(currentSong);
                    await ctx.reply(`Now playing: \`${currentSong.video.title}\` by \`${currentSong.video.author}\` \`[${hd(currentSong.video.duration, youtubeHdConfig)}]\`\nQueued by: \`${ctx.main.client.users.cache.has(currentSong.user) ? ctx.main.client.users.cache.get(currentSong.user).tag : "Unknown#0000"}\`\n\nURL: <${currentSong.url}>`)
                }
            }
        },
        stop: {
            description: "Stop a song and clear queue",
            fn: async (ctx) => {
                if (!ctx.member.permissions.has("MANAGE_GUILD") && !ctx.main.isAdmin(ctx.author.id)) {
                    return ":x: Only member with MANAGE_GUILD permission can stop the music or use skip instead!";
                }

                const channel = ctx.guild.me.voice.channel;
                if (!channel) {
                    return ":x: I am not in voice channel!";
                }

                const queuedMusic = ctx.main.musicQueues.has(ctx.guild.id) ? ctx.main.musicQueues.get(ctx.guild.id).length : 0;
                ctx.main.musicQueues.delete(ctx.guild.id);

                if (ctx.main.voiceStreams.has(ctx.guild.id)) {
                    ctx.main.voiceStreams.get(ctx.guild.id).endSong("leave");
                    ctx.main.voiceStreams.delete(ctx.guild.id);
                }
                
                await channel.leave();
                return `Left voice channel, removed ${queuedMusic} songs from the queue`;
            }
        },
        queue: {
            description: "Show list of queues",
            fn: async (ctx) => {
                const queue = ctx.main.musicQueues.get(ctx.guild.id);

                if (!queue || queue.length === 0) {
                    return "The song queue is empty, add songs using play `music play <query`";
                }

                let time = 0;
                queue.map(song => {
                    time += song.video.duration;
                })

                let reply = `There about ${queue.length} songs in queue with an estiminate playtime \`[${hd(time, youtubeHdConfig)}]\`\n`;

                let id = 0;
                for (const song of queue.slice(0, 10)) {
                    id++;
                    reply += `**${id}**: \`${song.video.title}\` by \`${song.video.author}\` \`[${hd(song.video.duration, youtubeHdConfig)}]\` - Queued by \`${ctx.main.client.users.cache.has(song.user) ? ctx.main.client.users.cache.get(song.user).tag : 'Unknown#0000'}\`\n`;
                }

                if (queue.length > 10) reply += `\`+ ${queue.length - 10} more\``

                return reply; 
            }
        },
        skip: {
            description: "Skip a song and play next song in queue!",
            fn: async (ctx) => {

            }
        }
    }
}

const youtubeHdConfig = {
    language: 'youtube',
    round: true,
    spacer: '',
    delimiter: ' '
};

const pthmsToMs = (pthms) => {
    const dRegex = /(\d+)D/;
    const hRegex = /(\d+)H/;
    const mRegex = /(\d+)M/;
    const sRegex = /(\d+)S/;
    let time = 0;

    time += dRegex.test(pthms) ? parseInt(pthms.match(dRegex)[1] * 60 * 60 * 24) : 0;
	time += hRegex.test(pthms) ? parseInt(pthms.match(hRegex)[1] * 60 * 60) : 0;
	time += mRegex.test(pthms) ? parseInt(pthms.match(mRegex)[1] * 60) : 0;
    time += sRegex.test(pthms) ? parseInt(pthms.match(sRegex)[1]) : 0;
    
    return time * 1000;
}