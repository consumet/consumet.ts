"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../../models");
const utils_1 = require("../../utils");
class Crunchyroll extends models_1.AnimeParser {
    constructor() {
        super(...arguments);
        this.name = 'Crunchyroll';
        this.baseUrl = 'https://cronchy.consumet.stream';
        this.logo = 'https://play-lh.googleusercontent.com/CjzbMcLbmTswzCGauGQExkFsSHvwjKEeWLbVVJx0B-J9G6OQ-UCl2eOuGBfaIozFqow';
        this.classPath = `ANIME.${this.name}`;
        this.locale = 'en-US';
        this.TOKEN = undefined;
        this.locales = [
            '[ar-ME] Arabic',
            '[ar-SA] Arabic (Saudi Arabia)',
            '[de-DE] German',
            '[en-US] English',
            '[es-419] Spanish (Latin America)',
            '[es-ES] Spanish (Spain)',
            '[fr-FR] French',
            '[he-IL] Hebrew',
            '[it-IT] Italian',
            '[pt-BR] Portuguese (Brazil)',
            '[pt-PT] Portuguese (Portugal)',
            '[pl-PL] Polish',
            '[ru-RU] Russian',
            '[ro-RO] Romanian',
            '[sv-SE] Swedish',
            '[tr-TR] Turkish',
            '[uk-UK] Ukrainian',
            '[zh-CN] Chinese (Simplified)',
            '[zh-TW] Chinese (Traditional)',
        ];
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
         * @param query Search query
         */
        this.search = async (query) => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/search/${query}`, this.options);
                return data;
            }
            catch (error) {
                throw new Error(`Couldn't fetch data from ${this.name}`);
            }
        };
        /**
         * @param id Anime id
         * @param mediaType Anime type (series, movie)
         * @param fetchAllSeasons Fetch all episode seasons
         */
        this.fetchAnimeInfo = async (id, mediaType, fetchAllSeasons = false) => {
            if (mediaType == 'series') {
                const { data } = await this.client.get(`${this.baseUrl}/info/${id}?type=${mediaType}&fetchAllSeasons=${fetchAllSeasons}`, this.options);
                return data;
            }
            else {
                throw new Error("Couldn't fetch data from Crunchyroll");
            }
        };
        /**
         *
         * @param episodeId Episode id
         * @param format subtitle format (default: `srt`) (srt, vtt, ass)
         * @param type Video type (default: `adaptive_hls` (m3u8)) `adaptive_dash` (dash), `drm_adaptive_dash` (dash with drm)
         */
        this.fetchEpisodeSources = async (episodeId) => {
            const { data } = await this.client.get(`${this.baseUrl}/episode/${episodeId}`, this.options);
            //TODO: Add hardcoded subtitles for all languages
            return data;
        };
        /**
         *
         * @param episodeId Episode id
         */
        this.fetchEpisodeServers = (episodeId) => {
            throw new Error('Method not implemented.');
        };
    }
    get options() {
        var _a;
        return {
            headers: {
                'User-Agent': utils_1.USER_AGENT,
                Authorization: 'Bearer ' + ((_a = this.TOKEN) === null || _a === void 0 ? void 0 : _a.access_token),
            },
        };
    }
    static async create(locale, token, accessToken, proxyConfig, adapter) {
        var _a;
        const instance = new Crunchyroll(proxyConfig, adapter);
        instance.TOKEN = (_a = instance.TOKEN) !== null && _a !== void 0 ? _a : (await axios_1.default.get(`${instance.baseUrl}/token`)).data;
        return instance;
    }
}
exports.default = Crunchyroll;
// (async () => {
//   const crunchyroll = await Crunchyroll.create();
//   const search = await crunchyroll.search('spy-x-family');
//   const res = await crunchyroll.fetchAnimeInfo(search.results[0].id, search.results[0].type!);
//   const sources = await crunchyroll.fetchEpisodeSources(res.episodes![res.episodes?.length! - 1].id);
// })();
//# sourceMappingURL=crunchyroll.js.map