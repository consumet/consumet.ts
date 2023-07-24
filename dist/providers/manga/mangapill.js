"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
class MangaPill extends models_1.MangaParser {
    constructor() {
        super(...arguments);
        this.name = 'MangaPill';
        this.baseUrl = 'https://mangapill.com';
        this.logo = 'https://scontent-man2-1.xx.fbcdn.net/v/t39.30808-6/300819578_399903675586699_2357525969702348451_n.png?_nc_cat=100&ccb=1-7&_nc_sid=09cbfe&_nc_ohc=Md2cQ4wRNWwAX-_U0fz&_nc_ht=scontent-man2-1.xx&oh=00_AfCJjAYDk9bsndz8uyNG-GdFIYcPvdIzbHnetHGzf1pVSw&oe=63BDD131';
        this.classPath = 'MANGA.MangaPill';
        /**
         *
         * @param query Search query
         */
        this.search = async (query) => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
                const $ = (0, cheerio_1.load)(data);
                const results = $('div.container div.my-3.justify-end > div')
                    .map((i, el) => {
                    var _a;
                    return ({
                        id: (_a = $(el).find('a').attr('href')) === null || _a === void 0 ? void 0 : _a.split('/manga/')[1],
                        title: $(el).find('div > a > div').text().trim(),
                        image: $(el).find('a img').attr('data-src'),
                    });
                })
                    .get();
                return {
                    results: results,
                };
            }
            catch (err) {
                //   console.log(err);
                throw new Error(err.message);
            }
        };
        this.fetchMangaInfo = async (mangaId) => {
            const mangaInfo = {
                id: mangaId,
                title: '',
            };
            try {
                const { data } = await this.client.get(`${this.baseUrl}/manga/${mangaId}`);
                const $ = (0, cheerio_1.load)(data);
                mangaInfo.title = $('div.container div.my-3 div.flex-col div.mb-3 h1').text().trim();
                mangaInfo.description = $('div.container div.my-3  div.flex-col p.text--secondary')
                    .text()
                    .split('\n')
                    .join(' ');
                mangaInfo.releaseDate = $('div.container div.my-3 div.flex-col div.gap-3.mb-3 div:contains("Year")')
                    .text()
                    .split('Year\n')[1]
                    .trim();
                mangaInfo.genres = $('div.container div.my-3 div.flex-col div.mb-3:contains("Genres")')
                    .text()
                    .split('\n')
                    .filter((genre) => genre !== 'Genres' && genre !== '')
                    .map(genre => genre.trim());
                mangaInfo.chapters = $('div.container div.border-border div#chapters div.grid-cols-1 a')
                    .map((i, el) => {
                    var _a;
                    return ({
                        id: (_a = $(el).attr('href')) === null || _a === void 0 ? void 0 : _a.split('/chapters/')[1],
                        title: $(el).text().trim(),
                        chapter: $(el).text().split('Chapter ')[1],
                    });
                })
                    .get();
                return mangaInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchChapterPages = async (chapterId) => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/chapters/${chapterId}`);
                const $ = (0, cheerio_1.load)(data);
                const chapterSelector = $('chapter-page');
                const pages = chapterSelector
                    .map((i, el) => ({
                    img: $(el).find('div picture img').attr('data-src'),
                    page: parseFloat($(el).find(`div[data-summary] > div`).text().split('page ')[1]),
                }))
                    .get();
                return pages;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
}
// (async () => {
//   const manga = new MangaPill();
//   const search = await manga.search('one piece');
//   const info = await manga.fetchMangaInfo(search.results[1].id);
//   const pages = await manga.fetchChapterPages(info.chapters![0].id);
//   console.log(pages);
// })();
exports.default = MangaPill;
//# sourceMappingURL=mangapill.js.map