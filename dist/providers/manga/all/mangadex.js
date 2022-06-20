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
const ascii_url_encoder_1 = require("ascii-url-encoder");
const models_1 = require("../../../models/");
class MangaDex extends models_1.MangaParser {
    constructor() {
        super(...arguments);
        this.name = 'MangaDex';
        this.baseUrl = 'https://mangadex.org';
        this.logo = 'https://nitter.net/pic/pbs.twimg.com%2Fprofile_images%2F1391016345714757632%2Fxbt_jW78.jpg';
        this.classPath = 'MANGA.all.MangaDex';
        this.apiUrl = 'https://api.mangadex.org';
        this.fetchMangaInfo = (mangaId) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { data } = yield axios_1.default.get(`${this.apiUrl}/manga/${mangaId}`);
                const mangaInfo = {
                    id: data.data.id,
                    title: data.data.attributes.title.en,
                    altTtitles: data.data.attributes.altTitles,
                    descitption: data.data.attributes.description,
                    genres: data.data.attributes.tags
                        .filter((tag) => tag.attributes.group === 'genre')
                        .map((tag) => tag.attributes.name.en),
                    themes: data.data.attributes.tags
                        .filter((tag) => tag.attributes.group === 'theme')
                        .map((tag) => tag.attributes.name.en),
                    status: data.data.attributes.status,
                    releaseDate: data.data.attributes.year,
                    chapters: [],
                };
                const allChapters = yield this.fetchAllChapters(mangaId, 0);
                for (const chapter of allChapters) {
                    (_a = mangaInfo.chapters) === null || _a === void 0 ? void 0 : _a.push({
                        id: chapter.id,
                        title: chapter.attributes.title ? chapter.attributes.title : chapter.attributes.chapter,
                        pages: chapter.attributes.pages,
                    });
                }
                return mangaInfo;
            }
            catch (err) {
                if (err.code == 'ERR_BAD_REQUEST') {
                    throw new Error('Bad request. Make sure you have entered a valid query.');
                }
                throw new Error(err.message);
            }
        });
        /**
         * @currently only supports english
         */
        this.fetchChapterPages = (chapterId, ...args) => __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield axios_1.default.get(`${this.apiUrl}/at-home/server/${chapterId}`);
                const pages = [];
                for (const id of res.data.chapter.data) {
                    pages.push({
                        img: `${res.data.baseUrl}/data/${res.data.chapter.hash}/${id}`,
                        page: parseInt(id.split('-')[0]),
                    });
                }
                return pages;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        /**
         * @param query search query
         * @param page page number (default: 1)
         * @param limit limit of results to return (default: 20) (max: 100) (min: 1)
         */
        this.search = (query, page = 1, limit = 20) => __awaiter(this, void 0, void 0, function* () {
            if (page <= 0)
                throw new Error('Page number must be greater than 0');
            if (limit > 100)
                throw new Error('Limit must be less than or equal to 100');
            if (limit * (page - 1) >= 10000)
                throw new Error('not enough results');
            try {
                const res = yield axios_1.default.get(`${this.apiUrl}/manga?limit=${limit}&title=${(0, ascii_url_encoder_1.encode)(query)}&limit=${limit}&offset=${limit * (page - 1)}&order[relevance]=desc`);
                if (res.data.result == 'ok') {
                    const results = {
                        currentPage: page + 1,
                        results: [],
                    };
                    for (const manga of res.data.data) {
                        results.results.push({
                            id: manga.id,
                            title: Object.values(manga.attributes.title)[0],
                            altTtitles: manga.attributes.altTitles,
                            descitption: Object.values(manga.attributes.description)[0],
                            status: manga.attributes.status,
                            releaseDate: manga.attributes.year,
                            contentRating: manga.attributes.contentRating,
                            lastVolume: manga.attributes.lastVolume,
                            lastChapter: manga.attributes.lastChapter,
                        });
                    }
                    return results;
                }
                else {
                    throw new Error(res.data.message);
                }
            }
            catch (err) {
                if (err.code == 'ERR_BAD_REQUEST') {
                    throw new Error('Bad request. Make sure you have entered a valid query.');
                }
                throw new Error(err.message);
            }
        });
        this.fetchAllChapters = (mangaId, offset, res) => __awaiter(this, void 0, void 0, function* () {
            var _b, _c;
            if (((_b = res === null || res === void 0 ? void 0 : res.data) === null || _b === void 0 ? void 0 : _b.offset) + 96 >= ((_c = res === null || res === void 0 ? void 0 : res.data) === null || _c === void 0 ? void 0 : _c.total)) {
                return [];
            }
            const response = yield axios_1.default.get(`${this.apiUrl}/manga/${mangaId}/feed?offset=${offset}&limit=96&order[volume]=desc&order[chapter]=desc&translatedLanguage[]=en`);
            return [
                ...response.data.data,
                ...(yield this.fetchAllChapters(mangaId, offset + 96, response)),
            ];
        });
    }
}
exports.default = MangaDex;
//# sourceMappingURL=mangadex.js.map