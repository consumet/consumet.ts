"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../../models");
function getYear(isoTimeString) {
    const date = new Date(isoTimeString);
    const json = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
    };
    return json;
}
class Crunchyroll extends models_1.AnimeParser {
    constructor() {
        super(...arguments);
        this.name = 'Crunchyroll';
        this.baseUrl = 'https://www.crunchyroll.com';
        this.logo = 'https://play-lh.googleusercontent.com/CjzbMcLbmTswzCGauGQExkFsSHvwjKEeWLbVVJx0B-J9G6OQ-UCl2eOuGBfaIozFqow';
        this.classPath = 'ANIME.Crunchyroll';
        this.locale = 'en-US';
        this.channelId = 'crunchyroll';
        this.languageNames = new Intl.DisplayNames(['en'], {
            type: 'language',
        });
        this.subOrder = [
            'Subbed',
            'English Dub',
            'German Dub',
            'French Dub',
            'Spanish Dub',
            'Italian Dub',
            'Portuguese Dub',
        ];
        /**
         * @param id Anime id
         * @param mediaType Anime type (series, movie)
         */
        //https://crunchy.consumet.org/info/id?type
        //https://crunchy.consumet.org/episodes/id?type
        this.fetchAnimeInfo = async (id, mediaType, locale = 'en-US', fetchAllSeason = false) => {
            const data = await (await axios_1.default.get(`https://cronchy.consumet.stream/info/${id}?type=${mediaType}&locale=${locale}&fetchAllSeasons=${fetchAllSeason}`)).data;
            return data;
        };
        this.fetchEpisodeSources = async (episodeId, locale = 'en-US') => {
            const data = await (await axios_1.default.get(`https://cronchy.consumet.stream/episode/${episodeId}?locale=${locale}`)).data;
            return data;
        };
    }
    fetchEpisodeServers(episodeId) {
        throw new Error('Method not implemented.');
    }
    async search(query, locale = 'en-US') {
        const data = await (await axios_1.default.get(`https://cronchy.consumet.stream/search/${query}?locale=${locale}`)).data;
        return data;
    }
}
exports.default = Crunchyroll;
(async () => {
    const cr = new Crunchyroll();
    try {
        console.time('doSomething');
        //console.log(await cr.fetchAnimeInfo('GRMG8ZQZR', 'series', 'en-US', true));
        //console.log(await cr.fetchEpisodeSources('G6P8ZP8M6', 'en-US'));
        console.log(await cr.search('Classroom of the Elite', 'en-US'));
        console.timeEnd('doSomething');
    }
    catch (err) {
        console.error(err);
    }
})();
//# sourceMappingURL=crunchyroll.js.map