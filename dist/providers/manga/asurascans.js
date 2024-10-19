"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
class AsuraScans extends models_1.MangaParser {
    constructor() {
        super(...arguments);
        this.name = 'AsuraScans';
        this.baseUrl = 'https://asuracomic.net';
        this.logo = 'https://asuracomic.net/images/logo.png';
        this.classPath = 'MANGA.AsuraScans';
        this.fetchMangaInfo = async (mangaId) => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/${mangaId}`);
                const $ = (0, cheerio_1.load)(data);
                const dom = $('html');
                const topInfoWrapper = dom.find('.relative.col-span-12.space-y-3.px-6');
                const info = {
                    id: mangaId,
                    title: dom.find('.text-xl.font-bold:nth-child(1)').text().trim(),
                    image: $(topInfoWrapper).find('img').attr('src'),
                    rating: $(topInfoWrapper).find('div > div.px-2.py-1 > p').text().trim(),
                    status: this.determineMediaState($(topInfoWrapper).find('div > div.flex.flex-row > div:nth-child(1) > h3:nth-child(2)').text().trim()),
                    description: dom.find('span.font-medium.text-sm').text().trim(),
                    authors: dom
                        .find('.grid.grid-cols-1.gap-5.mt-8 > div:nth-child(2) > h3:nth-child(2)')
                        .text()
                        .trim()
                        .split('/')
                        .map(ele => ele.trim()),
                    artist: dom.find('.grid.grid-cols-1.gap-5.mt-8 > div:nth-child(3) > h3:nth-child(2)').text().trim(),
                    updatedOn: dom
                        .find('.grid.grid-cols-1.gap-5.mt-8 > div:nth-child(5) > h3:nth-child(2)')
                        .text()
                        .trim(),
                    genres: dom
                        .find('.space-y-1.pt-4 > div > button')
                        .map((index, ele) => $(ele).text().trim())
                        .get(),
                    chapters: dom
                        .find('.pl-4.pr-2.pb-4.overflow-y-auto > div')
                        .map((index, ele) => {
                        return {
                            id: $(ele).find('h3:nth-child(1) > a').attr('href'),
                            title: $(ele).find('h3:nth-child(1) > a').text().trim(),
                            releaseDate: $(ele).find('h3:nth-child(2)').text().trim(),
                        };
                    })
                        .get(),
                    recommendations: dom
                        .find('.grid.grid-cols-2.gap-3.p-4 > a')
                        .map((index, ele) => {
                        return {
                            id: $(ele).attr('href'),
                            title: $(ele).find('div > h2.font-bold').text().trim(),
                            image: $(ele).find('div > div > img').attr('src'),
                            latestChapter: $(ele).find('div > h2:nth-child(3)').text().trim(),
                            status: this.determineMediaState($(ele).find('div > div:nth-child(1) > span').text().trim()),
                            rating: $(ele).find('div > div.block > span > label').text().trim(),
                        };
                    })
                        .get(),
                };
                return info;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchChapterPages = async (chapterId) => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/series/${chapterId}`);
                const $ = (0, cheerio_1.load)(data);
                const dom = $('html');
                const pages = dom
                    .find('.w-full.mx-auto.center > img')
                    .map((index, ele) => {
                    return {
                        img: $(ele).attr('src'),
                        page: index + 1,
                    };
                })
                    .get();
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
        this.search = async (query, page = 1) => {
            try {
                const formattedQuery = encodeURI(query.toLowerCase());
                const { data } = await this.client.get(`${this.baseUrl}/series?page=${page}&name=${formattedQuery}`);
                const $ = (0, cheerio_1.load)(data);
                const dom = $('html');
                const results = dom
                    .find('.grid.grid-cols-2.gap-3.p-4 > a')
                    .map((index, ele) => {
                    return {
                        id: $(ele).attr('href'),
                        title: $(ele).find('div > div > div:nth-child(2) > span:nth-child(1)').text().trim(),
                        image: $(ele).find('div > div > div:nth-child(1) > img').attr('src'),
                        status: this.determineMediaState($(ele).find('div > div > div:nth-child(1) > span').text().trim()),
                        latestChapter: $(ele).find('div > div > div:nth-child(2) > span:nth-child(2)').text().trim(),
                        rating: $(ele).find('div > div > div:nth-child(2) > span:nth-child(3) > label').text().trim(),
                    };
                })
                    .get();
                const searchResults = {
                    currentPage: page,
                    hasNextPage: dom.find('.flex.items-center.justify-center > a').attr('style')
                        .split('pointer-events:')[1]
                        .slice(1, -1) === 'auto'
                        ? true
                        : false,
                    results: results,
                };
                return searchResults;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
    determineMediaState(state) {
        switch (state.toLowerCase().trim()) {
            case 'completed':
                return models_1.MediaStatus.COMPLETED;
            case 'ongoing':
                return models_1.MediaStatus.ONGOING;
            case 'dropped':
                return models_1.MediaStatus.CANCELLED;
            default:
                return models_1.MediaStatus.UNKNOWN;
        }
    }
}
exports.default = AsuraScans;
//# sourceMappingURL=asurascans.js.map