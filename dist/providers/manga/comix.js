"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../../models");
const cheerio_1 = require("cheerio");
class Comix extends models_1.MangaParser {
    constructor() {
        super(...arguments);
        this.name = 'Comix';
        this.baseUrl = 'https://comix.to';
        this.classPath = 'MANGA.Comix';
        this.apiUrl = 'https://comick.art/api';
        this.referer = 'https://comix.to';
        this.baseHeaders = {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Sec-GPC': '1',
            Connection: 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            Priority: 'u=0, i',
            Pragma: 'no-cache',
            'Cache-Control': 'no-cache',
        };
        /**
         * @description Fetches info about the manga
         * @param mangaId just the id
         * @returns Promise<IMangaInfo>
         */
        this.fetchMangaInfo = async (mangaId) => {
            var _a, _b, _c, _d, _e;
            try {
                const { data } = await axios_1.default.get(`${this.baseUrl}/title/${mangaId}`, {
                    headers: this.baseHeaders,
                });
                const $ = (0, cheerio_1.load)(data);
                let extractedData = null;
                $('script').each((_, el) => {
                    const content = $(el).html() || '';
                    const pushMatches = Array.from(content.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g));
                    for (const match of pushMatches) {
                        let payloadString = match[1];
                        try {
                            const unescaped = JSON.parse(`"${payloadString}"`);
                            if (unescaped.startsWith('d:')) {
                                const jsonPart = unescaped.substring(2);
                                const data = JSON.parse(jsonPart);
                                if (Array.isArray(data)) {
                                    for (const item of data) {
                                        if (item && typeof item === 'object') {
                                            if (item.manga) {
                                                extractedData = item.manga;
                                                if (item.scanlationGroups)
                                                    extractedData.scanlationGroups = item.scanlationGroups;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        catch (e) {
                            // ignore
                        }
                    }
                });
                if (!extractedData) {
                    throw new Error('Failed to extract manga data');
                }
                const mangaInfo = {
                    id: mangaId,
                    title: extractedData.title,
                    altTitles: extractedData.alt_titles,
                    description: extractedData.synopsis,
                    genres: ((_a = extractedData.genre) === null || _a === void 0 ? void 0 : _a.map((g) => g.title)) || [],
                    status: ((_b = extractedData.status) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === 'releasing' ? models_1.MediaStatus.ONGOING : models_1.MediaStatus.COMPLETED,
                    rating: extractedData.rated_avg,
                    views: extractedData.follows_total,
                    image: (_c = extractedData.poster) === null || _c === void 0 ? void 0 : _c.large,
                    authors: ((_d = extractedData.author) === null || _d === void 0 ? void 0 : _d.map((a) => a.title)) || [],
                    artist: ((_e = extractedData.artist) === null || _e === void 0 ? void 0 : _e.map((a) => a.title)) || [],
                };
                return mangaInfo;
            }
            catch (err) {
                if (err.code == 'ERR_BAD_REQUEST')
                    throw new Error(`[${this.name}] Bad request. Make sure you have entered a valid query.`);
                throw new Error(err.message);
            }
        };
        /**
         *
         * @param chapterId Chapter ID '{hashid-slug}/{chapterid}'
         * @returns Promise<IMangaChapterPage[]>
         */
        this.fetchChapterPages = async (chapterId) => {
            try {
                const { data } = await axios_1.default.get(`${this.baseUrl}/title/${chapterId}`, {
                    headers: this.baseHeaders,
                });
                const $ = (0, cheerio_1.load)(data);
                let images = [];
                $('script').each((_, el) => {
                    const content = $(el).html() || '';
                    const pushMatches = Array.from(content.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g));
                    for (const match of pushMatches) {
                        let payloadString = match[1];
                        try {
                            const unescaped = JSON.parse(`"${payloadString}"`);
                            if (unescaped.startsWith('d:')) {
                                const jsonPart = unescaped.substring(2);
                                const data = JSON.parse(jsonPart);
                                if (Array.isArray(data)) {
                                    for (const item of data) {
                                        if (item && typeof item === 'object') {
                                            // Check for chapter data with images
                                            if (item.chapter && Array.isArray(item.chapter.images)) {
                                                images = item.chapter.images;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        catch (e) {
                            // ignore
                        }
                    }
                });
                if (images.length === 0) {
                    throw new Error('Failed to extract chapter images');
                }
                return images.map((image, index) => ({
                    img: image.url,
                    page: index,
                    headersForUrl: this.baseUrl,
                }));
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
        this.search = async (query, page) => {
            try {
                const { data } = await axios_1.default.get(`${this.baseUrl}/api/v2/manga`, {
                    params: {
                        'order[relevance]': 'desc',
                        keyword: query,
                        genres_mode: 'or',
                        limit: 28,
                        page: page,
                    },
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0',
                        Accept: '*/*',
                        Referer: `${this.baseUrl}/browser?keyword=${encodeURIComponent(query)}&order=relevance%3Adesc&genres_mode=or`,
                        'Content-Type': 'application/json',
                        'Sec-Fetch-Dest': 'empty',
                        'Sec-Fetch-Mode': 'cors',
                        'Sec-Fetch-Site': 'same-origin',
                        Connection: 'keep-alive',
                    },
                });
                const results = {
                    results: [],
                };
                if (data.result && data.result.items) {
                    data.result.items.forEach((item) => {
                        var _a;
                        results.results.push({
                            id: item.slug,
                            title: item.title,
                            altTitles: item.alt_titles || [],
                            image: (_a = item.poster) === null || _a === void 0 ? void 0 : _a.large,
                            description: item.synopsis,
                            status: item.status === 'releasing' ? models_1.MediaStatus.ONGOING : models_1.MediaStatus.COMPLETED,
                            rating: item.rated_avg,
                            views: item.follows_total,
                        });
                    });
                    if (data.result.pagination) {
                        results.pagination = data.result.pagination;
                    }
                }
                return results;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
    async fetchChapters(hid, page) {
        const chapters = [];
        let currentPage = page || 1;
        let hasNextPage = true;
        let pagination = undefined;
        // If page is provided, we only fetch that page.
        // If not provided, we loop.
        const loop = !page;
        while (hasNextPage) {
            try {
                const { data } = await axios_1.default.get(`${this.baseUrl}/api/v2/manga/${hid}/chapters`, {
                    params: {
                        limit: 100, // fetching more at once
                        page: currentPage,
                        'order[number]': 'desc',
                    },
                    headers: this.baseHeaders,
                });
                if (data.result && data.result.items) {
                    data.result.items.forEach((item) => {
                        var _a;
                        chapters.push({
                            id: item.chapter_id.toString(), // Using chapter_id as key
                            title: item.name || `Chapter ${item.number}`,
                            number: item.number,
                            releaseDate: item.created_at ? new Date(item.created_at * 1000).toISOString() : undefined,
                            isOfficial: item.is_official === 1,
                            scanlationGroup: (_a = item.scanlation_group) === null || _a === void 0 ? void 0 : _a.name,
                        });
                    });
                    pagination = data.result.pagination;
                    if (loop && pagination && pagination.current_page < pagination.last_page) {
                        currentPage++;
                    }
                    else {
                        hasNextPage = false;
                    }
                }
                else {
                    hasNextPage = false;
                }
            }
            catch (e) {
                console.error('Error fetching chapters page', currentPage, e);
                hasNextPage = false;
            }
        }
        return { chapters, pagination };
    }
}
//IIFE
// (async () => {
// const comix = new Comix();
// const search = await comix.search('solo leveling');
// console.log(search)
// const manga = await comix.fetchMangaInfo("rm2xv-the-grand-dukes-bride-is-a-hellborn-warrior");
// console.log(manga)
// const { chapters, pagination } = await comix.fetchChapters("rm2xv", 1);
// console.log(chapters, pagination);
// const pages = await comix.fetchChapterPages("rm2xv-the-grand-dukes-bride-is-a-hellborn-warrior/7304879-chapter-44");
// console.log(pages);
// })();
exports.default = Comix;
//# sourceMappingURL=comix.js.map