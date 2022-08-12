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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../../models");
class Enime extends models_1.AnimeParser {
    constructor() {
        super(...arguments);
        this.name = 'Enime';
        this.baseUrl = 'https://enime.moe';
        this.logo = 'https://enime.moe/favicon.ico';
        this.classPath = 'ANIME.Enime';
        this.enimeApi = 'https://api.enime.moe';
        /**
         * @param query Search query
         * @param page Page number (optional)
         */
        this.search = (query, page = 1, perPage = 15) => __awaiter(this, void 0, void 0, function* () {
            const res = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            const { data } = yield axios_1.default.get(`${this.enimeApi}/search/${query}?page=${page}&perPage=${perPage}`);
            if (data.currentPage !== res.currentPage)
                res.hasNextPage = true;
            res.results = data.data.map((anime) => {
                var _a, _b;
                return ({
                    id: anime.id,
                    anilistId: anime.anilistId,
                    malId: anime.mappings.mal,
                    title: (_b = (_a = anime.title.english) !== null && _a !== void 0 ? _a : anime.title.romaji) !== null && _b !== void 0 ? _b : anime.title.native,
                    image: anime.coverImage,
                    cover: anime.bannerImage,
                    releaseDate: anime.year,
                    description: anime.description,
                    genres: anime.genre,
                    rating: anime.averageScore,
                    status: anime.status,
                    mappings: anime.mappings,
                });
            });
            return res;
        });
        /**
         * @param id Anime id
         */
        this.fetchAnimeInfo = (id) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const animeInfo = {
                id: id,
                title: '',
            };
            const { data } = yield axios_1.default.get(`${this.enimeApi}/anime/${id}`).catch(() => {
                throw new Error('Anime not found');
            });
            animeInfo.anilistId = data.anilistId;
            animeInfo.malId = data.mappings.mal;
            animeInfo.title = (_b = (_a = data.title.english) !== null && _a !== void 0 ? _a : data.title.romaji) !== null && _b !== void 0 ? _b : data.title.native;
            animeInfo.image = data.coverImage;
            animeInfo.cover = data.bannerImage;
            animeInfo.season = data.season;
            animeInfo.releaseDate = data.year;
            animeInfo.duration = data.duration;
            animeInfo.popularity = data.popularity;
            animeInfo.description = data.description;
            animeInfo.genres = data.genre;
            animeInfo.rating = data.averageScore;
            animeInfo.status = data.status;
            animeInfo.synonyms = data.synonyms;
            animeInfo.mappings = data.mappings;
            data.episodes = data.episodes.sort((a, b) => b.number - a.number);
            animeInfo.episodes = data.episodes.map((episode) => ({
                id: episode.id,
                number: episode.number,
                title: episode.title,
            }));
            return animeInfo;
        });
        this.fetchEpisodeSources = (episodeId, ...args) => __awaiter(this, void 0, void 0, function* () {
            const res = {
                headers: {},
                sources: [],
            };
            const { data } = yield axios_1.default.get(`${this.enimeApi}/episode/${episodeId}`);
            const { data: { url, referer }, } = yield axios_1.default.get(`${this.enimeApi}/source/${data.sources[0].id}`);
            res.headers['Referer'] = referer;
            res.sources.push({
                url: url,
                isM3U8: url.includes('.m3u8'),
            });
            return res;
        });
    }
    /**
     * @deprecated
     */
    fetchEpisodeServers(episodeId) {
        throw new Error('Method not implemented.');
    }
}
exports.default = Enime;
//# sourceMappingURL=enime.js.map