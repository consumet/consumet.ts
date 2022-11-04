"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../../models");
/**
 * @attention Cloudflare bypass is **REQUIRED**.
 */
class KickAssAnime extends models_1.AnimeParser {
    constructor() {
        super(...arguments);
        this.name = 'KickAssAnime';
        this.baseUrl = 'https://www2.kickassanime.ro';
        this.logo = 'https://user-images.githubusercontent.com/65111632/95666535-4f6dba80-0ba6-11eb-8583-e3a2074590e9.png';
        this.classPath = 'ANIME.KickAssAnime';
        /**
         * @param query Search query
         */
        this.search = async (query) => {
            throw new Error('Method not implemented.');
        };
        /**
         * @param id Anime id
         */
        this.fetchAnimeInfo = async (id) => {
            throw new Error('Method not implemented.');
        };
        /**
         *
         * @param episodeId Episode id
         */
        this.fetchEpisodeSources = async (episodeId) => {
            throw new Error('Method not implemented.');
        };
        /**
         *
         * @param episodeId Episode id
         */
        this.fetchEpisodeServers = (episodeId) => {
            throw new Error('Method not implemented.');
        };
    }
}
exports.default = KickAssAnime;
//# sourceMappingURL=kickassanime.js.map