"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../../models");
const cheerio_1 = require("cheerio");
class ComicK extends models_1.MangaParser {
    constructor() {
        super(...arguments);
        this.name = 'ComicK';
        this.baseUrl = 'https://comick.art';
        this.logo = 'https://th.bing.com/th/id/OIP.fw4WrmAoA2PmKitiyMzUIgAAAA?pid=ImgDet&rs=1';
        this.classPath = 'MANGA.ComicK';
        this.apiUrl = 'https://comick.art/api';
        this.referer = 'https://comick.art';
        /**
         * @description Fetches info about the manga
         * @param mangaId Comic slug
         * @returns Promise<IMangaInfo>
         */
        this.fetchMangaInfo = async (mangaId) => {
            try {
                const data = await this.getComicData(mangaId);
                const links = Object.values(data.links ?? []).filter(link => link !== null);
                const mangaInfo = {
                    id: data.slug,
                    title: data.title,
                    altTitles: data.md_titles ? data.md_titles.map(title => title.title) : [],
                    description: data.desc,
                    genres: data.md_comic_md_genres?.map(genre => genre.md_genres.name),
                    status: data.status ?? 0 === 0 ? models_1.MediaStatus.ONGOING : models_1.MediaStatus.COMPLETED,
                    image: data.default_thumbnail,
                    malId: data.links?.mal,
                    links: links,
                    chapters: [],
                };
                const allChapters = await this.fetchAllChapters(mangaInfo.id, 1);
                for (const chapter of allChapters) {
                    mangaInfo.chapters?.push({
                        id: `${mangaInfo.id}/${chapter.hid}-chapter-${chapter.chap}-${chapter.lang}`,
                        title: chapter.title ?? chapter.chap,
                        chapterNumber: chapter.chap,
                        volumeNumber: chapter.vol,
                        releaseDate: chapter.created_at,
                        lang: chapter.lang,
                    });
                }
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
         * @param chapterId Chapter ID '{slug}/{hid}-chapter-{chap}-{lang}'
         * @returns Promise<IMangaChapterPage[]>
         */
        this.fetchChapterPages = async (chapterId) => {
            try {
                const data = await this._axios().get(`/comics/${chapterId}`);
                const pages = [];
                data.data.chapter.images.map((image, index) => {
                    pages.push({
                        img: image.url,
                        page: index,
                    });
                });
                return pages;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        // also need to implement and advanced search with filters
        /**
         * @param query search query
         * @param page page number (default: 1)
         * @param limit limit of results to return (default: 20) (max: 100) (min: 1)
         */
        this.search = async (query, cursor) => {
            try {
                const req = await this._axios().get(`/search?q=${encodeURIComponent(query)}&cursor=${cursor}`);
                const results = {
                    results: [],
                    prev_cursor: req.data.prev_cursor,
                    next_cursor: req.data.next_cursor,
                };
                const data = await req.data.data;
                for (const manga of data) {
                    results.results.push({
                        id: manga.slug,
                        title: manga.title ?? manga.slug,
                        altTitles: manga.md_titles ? manga.md_titles.map(title => title.title) : [],
                        image: manga.default_thumbnail,
                    });
                }
                return results;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchAllChapters = async (hid, page) => {
            if (page <= 0) {
                page = 1;
            }
            const req = await this._axios().get(`/comics/${hid}/chapter-list?page=${page}`);
            return req.data.data;
        };
        this.getComicData = async (mangaId) => {
            const req = await this._axios().get(`${this.baseUrl}/comic/${mangaId}`);
            const $ = (0, cheerio_1.load)(req.data);
            return JSON.parse($("script[id='comic-data']").text());
        };
    }
    _axios() {
        return axios_1.default.create({
            baseURL: this.apiUrl,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                Referer: this.referer,
            },
        });
    }
}
// (async () => {
//   const md = new MangaDex();
//   const search = await md.search('solo leveling');
//   const manga = await md.fetchMangaInfo(search.results[0].id);
//   const chapterPages = await md.fetchChapterPages(manga.chapters![0].id);
//   console.log(chapterPages);
// })();
exports.default = ComicK;
//# sourceMappingURL=comick.js.map