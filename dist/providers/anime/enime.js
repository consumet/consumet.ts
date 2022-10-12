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
                    type: anime.format,
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
            animeInfo.type = data.format;
            data.episodes = data.episodes.sort((a, b) => b.number - a.number);
            animeInfo.episodes = data.episodes.map((episode) => ({
                id: episode.id,
                number: episode.number,
                title: episode.title,
            }));
            return animeInfo;
        });
        /**
         * @param id anilist id
         */
        this.fetchAnimeInfoByAnilistId = (id, type) => __awaiter(this, void 0, void 0, function* () {
            var _c, _d;
            const animeInfo = {
                id: id,
                title: '',
            };
            const { data } = yield axios_1.default.get(`${this.enimeApi}/mapping/anilist/${id}`).catch(() => {
                throw new Error('Anime not found');
            });
            animeInfo.anilistId = data.anilistId;
            animeInfo.malId = data.mappings.mal;
            animeInfo.title = (_d = (_c = data.title.english) !== null && _c !== void 0 ? _c : data.title.romaji) !== null && _d !== void 0 ? _d : data.title.native;
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
            animeInfo.type = data.format;
            data.episodes = data.episodes.sort((a, b) => b.number - a.number);
            let useType = undefined;
            if (type == 'gogoanime' &&
                data.episodes.every((e) => e.sources.find((s) => s.target.includes('episode'))))
                useType = 'gogoanime';
            else if (type == 'zoro' &&
                data.episodes.every((e) => e.sources.find((s) => s.target.includes('?ep='))))
                useType = 'zoro';
            else
                throw new Error('Anime not found on Enime');
            animeInfo.episodes = data.episodes.map((episode) => {
                var _a, _b;
                return ({
                    id: episode.id,
                    slug: (_a = episode.sources
                        .find((source) => useType === 'zoro' ? source.target.includes('?ep=') : source.target.includes('episode'))) === null || _a === void 0 ? void 0 : _a.target.split('/').pop().replace('?ep=', '$episode$'),
                    description: episode.description,
                    number: episode.number,
                    title: episode.title,
                    image: (_b = episode === null || episode === void 0 ? void 0 : episode.image) !== null && _b !== void 0 ? _b : animeInfo.image,
                });
            });
            return animeInfo;
        });
        this.fetchEpisodeSources = (episodeId, ...args) => __awaiter(this, void 0, void 0, function* () {
            if (episodeId.includes('enime'))
                return this.fetchSourceFromSourceId(episodeId.replace('-enime', ''));
            return this.fetchSourceFromEpisodeId(episodeId);
        });
        this.fetchSourceFromEpisodeId = (episodeId) => __awaiter(this, void 0, void 0, function* () {
            const res = {
                headers: {},
                sources: [],
            };
            const { data } = yield axios_1.default.get(`${this.enimeApi}/episode/${episodeId}`);
            const { data: { url, referer }, } = yield axios_1.default.get(`${this.enimeApi}/source/${data.sources[0].id}`);
            res.headers['Referer'] = referer;
            const resResult = yield axios_1.default.get(url);
            const resolutions = resResult.data.match(/(RESOLUTION=)(.*)(\s*?)(\s*.*)/g);
            resolutions.forEach((ress) => {
                var index = url.lastIndexOf('/');
                var quality = ress.split('\n')[0].split('x')[1].split(',')[0];
                var urll = url.slice(0, index);
                res.sources.push({
                    url: urll + '/' + ress.split('\n')[1],
                    isM3U8: (urll + ress.split('\n')[1]).includes('.m3u8'),
                    quality: quality + 'p',
                });
            });
            res.sources.push({
                url: url,
                isM3U8: url.includes('.m3u8'),
                quality: 'default',
            });
            return res;
        });
        this.fetchSourceFromSourceId = (sourceId) => __awaiter(this, void 0, void 0, function* () {
            const res = {
                headers: {},
                sources: [],
            };
            const { data: { url, referer }, } = yield axios_1.default.get(`${this.enimeApi}/source/${sourceId}`);
            res.headers['Referer'] = referer;
            const resResult = yield axios_1.default.get(url).catch(() => {
                throw new Error('Source not found');
            });
            const resolutions = resResult.data.match(/(RESOLUTION=)(.*)(\s*?)(\s*.*)/g);
            resolutions.forEach((ress) => {
                var index = url.lastIndexOf('/');
                var quality = ress.split('\n')[0].split('x')[1].split(',')[0];
                var urll = url.slice(0, index);
                res.sources.push({
                    url: urll + '/' + ress.split('\n')[1],
                    isM3U8: (urll + ress.split('\n')[1]).includes('.m3u8'),
                    quality: quality + 'p',
                });
            });
            res.sources.push({
                url: url,
                isM3U8: url.includes('.m3u8'),
                quality: 'default',
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