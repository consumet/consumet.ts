"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ascii_url_encoder_1 = require("ascii-url-encoder");
const models_1 = require("../../models");
const utils_1 = require("../../utils");
class MangaDex extends models_1.MangaParser {
    constructor() {
        super(...arguments);
        this.name = 'MangaDex';
        this.baseUrl = 'https://mangadex.org';
        this.logo = 'https://pbs.twimg.com/profile_images/1391016345714757632/xbt_jW78_400x400.jpg';
        this.classPath = 'MANGA.MangaDex';
        this.apiUrl = 'https://api.mangadex.org';
        this.fetchMangaInfo = async (mangaId) => {
            var _a;
            try {
                const { data } = await this.client.get(`${this.apiUrl}/manga/${mangaId}`);
                const mangaInfo = {
                    id: data.data.id,
                    title: data.data.attributes.title.en,
                    altTitles: data.data.attributes.altTitles,
                    description: data.data.attributes.description,
                    genres: data.data.attributes.tags
                        .filter((tag) => tag.attributes.group === 'genre')
                        .map((tag) => tag.attributes.name.en),
                    themes: data.data.attributes.tags
                        .filter((tag) => tag.attributes.group === 'theme')
                        .map((tag) => tag.attributes.name.en),
                    status: (0, utils_1.capitalizeFirstLetter)(data.data.attributes.status),
                    releaseDate: data.data.attributes.year,
                    chapters: [],
                };
                const allChapters = await this.fetchAllChapters(mangaId, 0);
                for (const chapter of allChapters) {
                    (_a = mangaInfo.chapters) === null || _a === void 0 ? void 0 : _a.push({
                        id: chapter.id,
                        title: chapter.attributes.title ? chapter.attributes.title : chapter.attributes.chapter,
                        chapterNumber: chapter.attributes.chapter,
                        volumeNumber: chapter.attributes.volume,
                        pages: chapter.attributes.pages,
                    });
                }
                const findCoverArt = data.data.relationships.find((rel) => rel.type === 'cover_art');
                const coverArt = await this.fetchCoverImage(findCoverArt === null || findCoverArt === void 0 ? void 0 : findCoverArt.id);
                mangaInfo.image = `${this.baseUrl}/covers/${mangaInfo.id}/${coverArt}`;
                return mangaInfo;
            }
            catch (err) {
                if (err.code == 'ERR_BAD_REQUEST')
                    throw new Error(`[${this.name}] Bad request. Make sure you have entered a valid query.`);
                throw new Error(err.message);
            }
        };
        /**
         * @currently only supports english
         */
        this.fetchChapterPages = async (chapterId) => {
            try {
                const res = await this.client.get(`${this.apiUrl}/at-home/server/${chapterId}`);
                const pages = [];
                for (const id of res.data.chapter.data) {
                    pages.push({
                        img: `${res.data.baseUrl}/data/${res.data.chapter.hash}/${id}`,
                        page: parseInt((0, utils_1.substringBefore)(id, '-').replace(/[^0-9.]/g, '')),
                    });
                }
                return pages;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * @param query search query
         * @param page page number (default: 1)
         * @param limit limit of results to return (default: 20) (max: 100) (min: 1)
         */
        this.search = async (query, page = 1, limit = 20) => {
            if (page <= 0)
                throw new Error('Page number must be greater than 0');
            if (limit > 100)
                throw new Error('Limit must be less than or equal to 100');
            if (limit * (page - 1) >= 10000)
                throw new Error('not enough results');
            try {
                const res = await this.client.get(`${this.apiUrl}/manga?limit=${limit}&title=${(0, ascii_url_encoder_1.encode)(query)}&limit=${limit}&offset=${limit * (page - 1)}&order[relevance]=desc`);
                if (res.data.result == 'ok') {
                    const results = {
                        currentPage: page,
                        results: [],
                    };
                    for (const manga of res.data.data) {
                        results.results.push({
                            id: manga.id,
                            title: Object.values(manga.attributes.title)[0],
                            altTitles: manga.attributes.altTitles,
                            description: Object.values(manga.attributes.description)[0],
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
        };
        this.fetchRandom = async () => {
            try {
                const res = await this.client.get(`${this.apiUrl}/manga/random`);
                if (res.data.result == 'ok') {
                    const results = {
                        currentPage: 1,
                        results: [],
                    };
                    results.results.push({
                        id: res.data.data.id,
                        title: Object.values(res.data.data.attributes.title)[0],
                        altTitles: res.data.data.attributes.altTitles,
                        description: Object.values(res.data.data.attributes.description)[0],
                        status: res.data.data.attributes.status,
                        releaseDate: res.data.data.attributes.year,
                        contentRating: res.data.data.attributes.contentRating,
                        lastVolume: res.data.data.attributes.lastVolume,
                        lastChapter: res.data.data.attributes.lastChapter,
                    });
                    return results;
                }
                else {
                    throw new Error(res.data.message);
                }
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchRecentlyAdded = async (page = 1, limit = 20) => {
            if (page <= 0)
                throw new Error('Page number must be greater than 0');
            if (limit > 100)
                throw new Error('Limit must be less than or equal to 100');
            if (limit * (page - 1) >= 10000)
                throw new Error('not enough results');
            try {
                const res = await this.client.get(`${this.apiUrl}/manga?includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&order[createdAt]=desc&hasAvailableChapters=true&limit=${limit}&offset=${limit * (page - 1)}`);
                if (res.data.result == 'ok') {
                    const results = {
                        currentPage: page,
                        results: [],
                    };
                    for (const manga of res.data.data) {
                        results.results.push({
                            id: manga.id,
                            title: Object.values(manga.attributes.title)[0],
                            altTitles: manga.attributes.altTitles,
                            description: Object.values(manga.attributes.description)[0],
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
                throw new Error(err.message);
            }
        };
        this.fetchLatestUpdates = async (page = 1, limit = 20) => {
            if (page <= 0)
                throw new Error('Page number must be greater than 0');
            if (limit > 100)
                throw new Error('Limit must be less than or equal to 100');
            if (limit * (page - 1) >= 10000)
                throw new Error('not enough results');
            try {
                const res = await this.client.get(`${this.apiUrl}/manga?order[latestUploadedChapter]=desc&limit=${limit}&offset=${limit * (page - 1)}`);
                if (res.data.result == 'ok') {
                    const results = {
                        currentPage: page,
                        results: [],
                    };
                    for (const manga of res.data.data) {
                        results.results.push({
                            id: manga.id,
                            title: Object.values(manga.attributes.title)[0],
                            altTitles: manga.attributes.altTitles,
                            description: Object.values(manga.attributes.description)[0],
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
                throw new Error(err.message);
            }
        };
        this.fetchPopular = async (page = 1, limit = 20) => {
            if (page <= 0)
                throw new Error('Page number must be greater than 0');
            if (limit > 100)
                throw new Error('Limit must be less than or equal to 100');
            if (limit * (page - 1) >= 10000)
                throw new Error('not enough results');
            try {
                const res = await this.client.get(`${this.apiUrl}/manga?includes[]=cover_art&includes[]=artist&includes[]=author&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive&hasAvailableChapters=true&limit=${limit}&offset=${limit * (page - 1)}`);
                if (res.data.result == 'ok') {
                    const results = {
                        currentPage: page,
                        results: [],
                    };
                    for (const manga of res.data.data) {
                        results.results.push({
                            id: manga.id,
                            title: Object.values(manga.attributes.title)[0],
                            altTitles: manga.attributes.altTitles,
                            description: Object.values(manga.attributes.description)[0],
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
                throw new Error(err.message);
            }
        };
        this.fetchAllChapters = async (mangaId, offset, res) => {
            var _a, _b;
            if (((_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.offset) + 96 >= ((_b = res === null || res === void 0 ? void 0 : res.data) === null || _b === void 0 ? void 0 : _b.total)) {
                return [];
            }
            const response = await this.client.get(`${this.apiUrl}/manga/${mangaId}/feed?offset=${offset}&limit=96&order[volume]=desc&order[chapter]=desc&translatedLanguage[]=en`);
            return [...response.data.data, ...(await this.fetchAllChapters(mangaId, offset + 96, response))];
        };
        this.fetchCoverImage = async (coverId) => {
            const { data } = await this.client.get(`${this.apiUrl}/cover/${coverId}`);
            const fileName = data.data.attributes.fileName;
            return fileName;
        };
    }
}
// (async () => {
//   const md = new MangaDex();
//   const search = await md.search('solo leveling');
//   const manga = await md.fetchMangaInfo(search.results[0].id);
//   const chapterPages = await md.fetchChapterPages(manga.chapters![0].id);
//   console.log(chapterPages);
// })();
exports.default = MangaDex;
//# sourceMappingURL=mangadex.js.map