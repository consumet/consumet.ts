"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        this.search = (query) => __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
        /**
         * @param id Anime id
         */
        this.fetchAnimeInfo = (id) => __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
        /**
         *
         * @param episodeId Episode id
         */
        this.fetchEpisodeSources = (episodeId) => __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
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