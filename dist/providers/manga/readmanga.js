"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
var RankingType;
(function (RankingType) {
    RankingType["TOPRATED"] = "top-rated";
    RankingType["NEW"] = "new";
})(RankingType || (RankingType = {}));
class ReadManga extends models_1.MangaParser {
    constructor() {
        super(...arguments);
        this.name = 'ReadManga';
        this.baseUrl = 'https://readmanga.app';
        this.logo = 'https://readmanga.app/assets/new/images/readmangapp-light.png'; // light logo
        this.classPath = 'MANGA.ReadManga';
        this.darkLogo = 'https://readmanga.app/assets/new/images/readmangaapp-dark.png';
        /**
         *
         * @param query Search query
         */
        this.search = async (query) => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/search/autocomplete?dataType=json&query=${query}`, {
                    headers: {
                        Referer: this.baseUrl,
                    },
                });
                const result = {
                    currentPage: 1,
                    hasNextPage: false,
                    totalPages: 1,
                    totalResults: data.results.length,
                    results: this.formatSearchResultData(data.results),
                };
                return result;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchNewManga = async (page = 1) => {
            if (page < 1) {
                throw new Error('please provide a page number that is greater than- or equal to 1');
            }
            try {
                const { data } = await this.client.get(`${this.baseUrl}/ranking/${RankingType.NEW}/${page}`, {
                    headers: {
                        accept: 'application/json, text/javascript, */*; q=0.01',
                        'accept-language': 'en-US,en;q=0.9',
                        'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"Windows"',
                        'sec-fetch-dest': 'empty',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-site': 'same-origin',
                        'x-requested-with': 'XMLHttpRequest',
                        Referer: this.baseUrl,
                        'Referrer-Policy': 'strict-origin-when-cross-origin',
                    },
                });
                const result = this.getRankingTitleCardData(data, page);
                return result;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchTopRatedManga = async (page = 1) => {
            if (page < 1) {
                throw new Error('please provide a page number that is greater than- or equal to 1');
            }
            try {
                const { data } = await this.client.get(`${this.baseUrl}/ranking/${RankingType.TOPRATED}/${page}`, {
                    headers: {
                        accept: 'application/json, text/javascript, */*; q=0.01',
                        'accept-language': 'en-US,en;q=0.9',
                        'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"Windows"',
                        'sec-fetch-dest': 'empty',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-site': 'same-origin',
                        'x-requested-with': 'XMLHttpRequest',
                        Referer: this.baseUrl,
                        'Referrer-Policy': 'strict-origin-when-cross-origin',
                    },
                });
                const result = this.getRankingTitleCardData(data, page);
                return result;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchMangaInfo = async (mangaId) => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/${mangaId}`, {
                    headers: {
                        accept: 'application/json, text/javascript, */*; q=0.01',
                        'accept-language': 'en-US,en;q=0.9',
                        'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"Windows"',
                        'sec-fetch-dest': 'empty',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-site': 'same-origin',
                        'x-requested-with': 'XMLHttpRequest',
                        Referer: this.baseUrl,
                        'Referrer-Policy': 'strict-origin-when-cross-origin',
                    },
                });
                const $ = (0, cheerio_1.load)(data);
                const dom = $('html');
                const title = dom.find('.section-header.mb-2 > .section-header-title.me-auto > h2').text().trim();
                const image = dom.find('.novels-detail > .novels-detail-left > img').attr('src');
                const altTitles = dom
                    .find('.novels-detail > .novels-detail-right > ul > li:nth-child(1) > div:nth-child(2) > span')
                    .text()
                    .split(',');
                const status = dom
                    .find('.novels-detail > .novels-detail-right > ul > li:nth-child(2) > div:nth-child(2)')
                    .text()
                    .trim();
                const genres = dom
                    .find('.novels-detail > .novels-detail-right > ul > li:nth-child(3) > div:nth-child(2) > a')
                    .map((index, ele) => $(ele).text().trim())
                    .get();
                const type = dom
                    .find('.novels-detail > .novels-detail-right > ul > li:nth-child(4) > div:nth-child(2) > span')
                    .text()
                    .trim();
                const rating = dom
                    .find('.novels-detail > .novels-detail-right > ul > li:nth-child(5) > div:nth-child(2) > span')
                    .text()
                    .trim();
                const authors = dom
                    .find('.novels-detail > .novels-detail-right > ul > li:nth-child(6) > div:nth-child(2) > a')
                    .map((index, ele) => $(ele).text().trim())
                    .get();
                const artists = dom
                    .find('.novels-detail > .novels-detail-right > ul > li:nth-child(7) > div:nth-child(2)')
                    .text()
                    .trim();
                const views = dom
                    .find('.novels-detail > .novels-detail-right > ul > li:nth-child(8) > div:nth-child(2)')
                    .text()
                    .trim();
                const description = dom.find('.col-md-12.mb-3 > .empty-box > p').text();
                const chapters = dom
                    .find('div > .cm-tabs-content > ul > li > a')
                    .map((index, ele) => {
                    // link to chapter is not always baseUrl -> id = entire link
                    const chapter = {
                        id: ele.attribs['href'],
                        title: $(ele).text().trim(),
                    };
                    return chapter;
                })
                    .get();
                const result = {
                    authors,
                    genres,
                    chapters,
                    id: mangaId,
                    title,
                    altTitles,
                    image,
                    description,
                    status: this.getStatus(status),
                    rating,
                    artists,
                    type,
                    views,
                };
                return result;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchChapterPages = async (chapterId) => {
            try {
                const { data } = await this.client.get(chapterId, {
                    headers: {
                        accept: 'application/json, text/javascript, */*; q=0.01',
                        'accept-language': 'en-US,en;q=0.9',
                        'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"Windows"',
                        'sec-fetch-dest': 'empty',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-site': 'same-origin',
                        'x-requested-with': 'XMLHttpRequest',
                        Referer: this.baseUrl,
                        'Referrer-Policy': 'strict-origin-when-cross-origin',
                    },
                });
                const $ = (0, cheerio_1.load)(data);
                const dom = $('html');
                const imageSources = dom
                    .find('.chapter-detail-novel-big-image.text-center > img')
                    .map((index, ele) => {
                    const chapterPage = {
                        img: ele.attribs['src'],
                        page: index + 1,
                    };
                    return chapterPage;
                })
                    .get();
                return imageSources;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.getRankingTitleCardData = (text, page) => {
            const $ = (0, cheerio_1.load)(text);
            const dom = $('html');
            const titles = dom
                .find('.category-items.ranking-category.cm-list > ul > li')
                .map((index, ele) => {
                return {
                    title: $(ele).find('.category-name > a').text().trim(),
                    id: $(ele).find('div > a').attr('href').replace('/', ''),
                    img: $(ele).find('div:nth-child(2) > div > a > img').attr('src'),
                    description: $(ele)
                        .find('div:nth-child(2) > div:nth-child(2) > div > a > span')
                        .text()
                        .split('\n')
                        .join(' ')
                        .trim(),
                    status: this.getStatus($(ele).find('div:nth-child(2) > div:nth-child(2) > ul > li:nth-child(1) > span').text().trim()),
                    categories: $(ele)
                        .find('div:nth-child(2) > div:nth-child(2) > ul > li:nth-child(2) > a')
                        .map((index, str) => $(str).text())
                        .get(),
                    type: $(ele).find('div:nth-child(2) > div:nth-child(2) > ul > li:nth-child(3) > span').text(),
                    views: parseInt($(ele).find('div:nth-child(2) > div:nth-child(2) > ul > li:nth-child(4) > span').text()),
                    rate: parseInt($(ele).find('div:nth-child(2) > div:nth-child(2) > ul > li:nth-child(5) > span').text()),
                };
            })
                .get();
            const totalPages = dom.find('nav.cm-pagination > a:last-child').attr('href') === '#'
                ? page
                : this.getTotalPages(dom.find('nav.cm-pagination > a:last-child').attr('href'), '/');
            const result = {
                results: titles,
                currentPage: page,
                totalPages: totalPages,
                hasNextPage: !(dom.find('nav.cm-pagination > a:last-child').attr('href') === '#'),
            };
            return result;
        };
        this.getTotalPages = (str, splitOn) => {
            const split = str.split(splitOn);
            return parseInt(split[split.length - 1]);
        };
        this.formatSearchResultData = (results) => {
            const formattedResults = results.map(result => {
                const split = result.link.split('/');
                const id = split[split.length - 1];
                return {
                    id: id,
                    title: result.original_title,
                    altTitles: result.overview,
                    image: result.image,
                };
            });
            return formattedResults;
        };
        this.getStatus = (statusStr) => {
            switch (statusStr) {
                case models_1.MediaStatus.CANCELLED:
                    return models_1.MediaStatus.CANCELLED;
                case models_1.MediaStatus.COMPLETED:
                    return models_1.MediaStatus.COMPLETED;
                case models_1.MediaStatus.HIATUS:
                    return models_1.MediaStatus.HIATUS;
                case models_1.MediaStatus.NOT_YET_AIRED:
                    return models_1.MediaStatus.NOT_YET_AIRED;
                case models_1.MediaStatus.ONGOING:
                    return models_1.MediaStatus.ONGOING;
                default:
                    return models_1.MediaStatus.UNKNOWN;
            }
        };
    }
}
exports.default = ReadManga;
//# sourceMappingURL=readmanga.js.map