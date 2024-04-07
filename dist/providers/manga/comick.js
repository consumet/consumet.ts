"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../../models");
class ComicK extends models_1.MangaParser {
    constructor() {
        super(...arguments);
        this.name = 'ComicK';
        this.baseUrl = 'https://comick.app';
        this.logo = 'https://th.bing.com/th/id/OIP.fw4WrmAoA2PmKitiyMzUIgAAAA?pid=ImgDet&rs=1';
        this.classPath = 'MANGA.ComicK';
        this.apiUrl = 'https://api.comick.io';
        /**
         * @description Fetches info about the manga
         * @param mangaId Comic slug
         * @returns Promise<IMangaInfo>
         */
        this.fetchMangaInfo = async (mangaId) => {
            var _a, _b, _c, _d, _e, _f;
            try {
                const req = await this._axios().get(`/comic/${mangaId}`);
                const data = req.data.comic;
                const links = Object.values((_a = data.links) !== null && _a !== void 0 ? _a : []).filter(link => link !== null);
                const mangaInfo = {
                    id: data.hid,
                    title: data.title,
                    altTitles: data.md_titles ? data.md_titles.map(title => title.title) : [],
                    description: data.desc,
                    genres: (_b = data.md_comic_md_genres) === null || _b === void 0 ? void 0 : _b.map(genre => genre.md_genres.name),
                    status: ((_c = data.status) !== null && _c !== void 0 ? _c : 0 === 0) ? models_1.MediaStatus.ONGOING : models_1.MediaStatus.COMPLETED,
                    image: `https://meo.comick.pictures${data.md_covers ? data.md_covers[0].b2key : ''}`,
                    malId: (_d = data.links) === null || _d === void 0 ? void 0 : _d.mal,
                    links: links,
                    chapters: [],
                };
                const allChapters = await this.fetchAllChapters(mangaId, 1);
                for (const chapter of allChapters) {
                    (_e = mangaInfo.chapters) === null || _e === void 0 ? void 0 : _e.push({
                        id: chapter.hid,
                        title: (_f = chapter.title) !== null && _f !== void 0 ? _f : chapter.chap,
                        chapterNumber: chapter.chap,
                        volumeNumber: chapter.vol,
                        releaseDate: chapter.created_at,
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
         * @param chapterId Chapter ID (HID)
         * @returns Promise<IMangaChapterPage[]>
         */
        this.fetchChapterPages = async (chapterId) => {
            try {
                const { data } = await this._axios().get(`/chapter/${chapterId}`);
                const pages = [];
                data.chapter.md_images.map((image, index) => {
                    pages.push({
                        img: `https://meo.comick.pictures/${image.b2key}?width=${image.w}`,
                        page: index,
                    });
                });
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
            var _a;
            if (page < 1)
                throw new Error('Page number must be greater than 1');
            if (limit > 300)
                throw new Error('Limit must be less than or equal to 300');
            if (limit * (page - 1) >= 10000)
                throw new Error('not enough results');
            try {
                const req = await this._axios().get(`/v1.0/search?q=${encodeURIComponent(query)}&limit=${limit}&page=${page}`);
                const results = {
                    currentPage: page,
                    results: [],
                };
                const data = await req.data;
                for (const manga of data) {
                    let cover = manga.md_covers ? manga.md_covers[0] : null;
                    if (cover && cover.b2key != undefined) {
                        cover = `https://meo.comick.pictures${cover.b2key}`;
                    }
                    results.results.push({
                        id: manga.slug,
                        title: (_a = manga.title) !== null && _a !== void 0 ? _a : manga.slug,
                        altTitles: manga.md_titles ? manga.md_titles.map(title => title.title) : [],
                        image: cover,
                    });
                }
                return results;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchAllChapters = async (mangaId, page) => {
            if (page <= 0) {
                page = 1;
            }
            const comicId = await this.getComicId(mangaId);
            const req = await this._axios().get(`/comic/${comicId}/chapters?page=${page}`);
            return req.data.chapters;
        };
    }
    _axios() {
        return axios_1.default.create({
            baseURL: this.apiUrl,
            headers: {
                'User-Agent': 'Mozilla/5.0',
            },
        });
    }
    /**
     * @description Fetches the comic HID from the slug
     * @param id Comic slug
     * @returns Promise<string> empty if not found
     */
    async getComicId(id) {
        const req = await this._axios().get(`/comic/${id}`);
        const data = req.data['comic'];
        return data ? data.hid : '';
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