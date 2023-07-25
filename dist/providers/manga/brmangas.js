"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
class BRMangas extends models_1.MangaParser {
    constructor() {
        super(...arguments);
        this.name = 'BRMangas';
        this.baseUrl = 'https://www.brmangas.net';
        this.logo = 'https://www.brmangas.net/wp-content/themes/brmangasnew/images/svg/logo.svg';
        this.classPath = 'MANGA.BRMangas';
        this.fetchMangaInfo = async (mangaId) => {
            const mangaInfo = {
                id: mangaId,
                title: '',
            };
            try {
                const { data } = await this.client.get(`${this.baseUrl}/manga/${mangaId}`);
                const $ = (0, cheerio_1.load)(data);
                const title = $('body > div.scroller-inner > div.wrapper > main > section > div > h1.titulo').text();
                const descriptionAndAltTitles = $('body > div.scroller-inner > div.wrapper > main > div > div > div.col > div.serie-texto > div > p:nth-child(3)')
                    .text()
                    .split('\n');
                mangaInfo.title = title.slice(3, title.length - 7).trim();
                mangaInfo.altTitles = descriptionAndAltTitles.filter((_, i) => i > 0);
                mangaInfo.description = descriptionAndAltTitles[0];
                mangaInfo.headerForImage = { Referer: this.baseUrl };
                mangaInfo.image = $('body > div.scroller-inner > div.wrapper > main > div > div > div.serie-geral > div.infoall > div.serie-capa > img').attr('src');
                mangaInfo.genres = $('body > div.scroller-inner > div.wrapper > main > div > div > div.serie-geral > div.infoall > div.serie-infos > ul > li:nth-child(3)')
                    .text()
                    .slice(11)
                    .split(',')
                    .map(genre => genre.trim());
                mangaInfo.status = models_1.MediaStatus.UNKNOWN;
                mangaInfo.views = null;
                mangaInfo.authors = [
                    $('body > div.scroller-inner > div.wrapper > main > div > div > div.serie-geral > div.infoall > div.serie-infos > ul > li:nth-child(2)')
                        .text()
                        .replace('Autor: ', '')
                        .trim(),
                ];
                mangaInfo.chapters = $('body > div.scroller-inner > div.wrapper > main > div > div > div:nth-child(2) > div.manga > div.container_t > div.lista_manga > ul > li')
                    .map((i, el) => {
                    var _a;
                    return {
                        id: `${(_a = $(el).find('a').attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[4]}`,
                        title: $(el).find('a').text(),
                        views: null,
                        releasedDate: null,
                    };
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
                const url = `${this.baseUrl}/ler/${chapterId}`;
                const { data } = await this.client.get(url);
                const $ = (0, cheerio_1.load)(data);
                const script = $('script');
                const pageURLs = JSON.parse(script
                    .filter((i, el) => $(el).text().includes('imageArray'))
                    .text()
                    .trim()
                    .slice(13, -2)
                    .replace(/\\/g, ''));
                console.log(pageURLs.images);
                const pages = pageURLs.images.map((img, i) => ({
                    img: img,
                    page: i,
                    title: `Page ${i + 1}`,
                    headerForImage: { Referer: this.baseUrl },
                }));
                return pages;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         *
         * @param query Search query
         */
        this.search = async (query) => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/?s=${query.replace(/ /g, '+')}`);
                const $ = (0, cheerio_1.load)(data);
                const results = $('body > div.scroller-inner > div.wrapper > main > div.container > div.listagem > div.col')
                    .map((i, row) => {
                    var _a;
                    return ({
                        id: (_a = $(row).find('div.item > a').attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[4],
                        title: $(row).find('div.item > a > h2').text(),
                        image: $(row).find('div.item > a > div > img').attr('src'),
                        headerForImage: { Referer: this.baseUrl },
                    });
                })
                    .get();
                return {
                    results: results,
                };
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
}
exports.default = BRMangas;
//# sourceMappingURL=brmangas.js.map