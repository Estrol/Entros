const fetch = require('node-fetch');

const get = async (neko) => {
    const url = 'https://weeb.entrosbot.xyz/api/v1';

    try {
        let response;

        if (sfw.includes(neko) || nsfw.includes(neko)) {
            response = await fetch(`${url}/${neko}`);
        } else {
            throw new NekoError('Invalid neko category!');
        }

        const responseJson = await response.json();

        return { 
            url: responseJson.url || null, 
            nsfw: responseJson.nsfw || false, 
        }
    } catch (error) {
        throw error;
    }
}

class NekoError extends Error {
    constructor(message) {
        super(message)
        this.name = "NekoError";
    }
}

const sfw = [
    'tickle',  'slap',       'poke',
    'pat',     'neko',       'meow',
    'lizard',  'kiss',       'hug',
    'foxGirl', 'feed',       'cuddle',
    'nekoGif', 'kemonomimi', 'holo',
    'smug',    'baka',       'woof',
    'goose',   'gecg',       'avatar',
    'waifu'
]

const nsfw = [
    'randomHentaiGif', 'pussy',      'nekoGif',
    'lewd',            'lesbian',    'kuni',
    'cumsluts',        'classic',    'boobs',
    'bJ',              'anal',       'avatar',
    'yuri',            'trap',       'tits',
    'girlSoloGif',     'girlSolo',   'pussyWankGif',
    'pussyArt',        'kemonomimi', 'kitsune',
    'keta',            'holo',       'holoEro',
    'hentai',          'futanari',   'femdom',
    'feetGif',         'eroFeet',    'feet',
    'ero',             'eroKitsune', 'eroKemonomimi',
    'eroNeko',         'eroYuri',    'cumArts',
    'blowJob',         'spank',      'gasm'
]

module.exports = { get, NekoError, sfw, nsfw};