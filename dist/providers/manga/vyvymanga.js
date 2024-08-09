"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../../models");
const cheerio_1 = require("cheerio");
class VyvyManga extends models_1.MangaParser {
    constructor() {
        super(...arguments);
        this.name = 'Vyvymanga';
        this.baseUrl = 'https://vyvymanga.net/api';
        this.logo = 'https://vyvymanga.net/web/img/icon.png';
        this.classPath = 'MANGA.VyvyManga';
        this.baseWebsiteUrl = 'https://vyvymanga.net';
        this.search = async (query, page = 1) => {
            if (page < 1)
                throw new Error('page must be equal to 1 or greater');
            try {
                const formattedQuery = query.trim().toLowerCase().split(' ').join('+');
                const { data } = await this.client.get(`${this.baseWebsiteUrl}/search?search_po=0&q=${formattedQuery}&page=${page}`);
                const $ = (0, cheerio_1.load)(data);
                const dom = $('html');
                const result = dom
                    .find('.row.book-list > div > div > a')
                    .map((index, ele) => {
                    return {
                        id: $(ele).find('div.comic-image').attr('data-background-image')
                            .split('cover/')[1]
                            .split('/')[0],
                        title: $(ele).find('div.comic-title').text().trim(),
                        image: $(ele).find('div.comic-image').attr('data-background-image'),
                        lastChapter: $(ele).find('div.comic-image > span').text().trim(),
                    };
                })
                    .get();
                const pagination = dom.find('ul.pagination > li');
                if (!pagination.length) {
                    return {
                        currentPage: page,
                        hasNextPage: false,
                        totalPages: page,
                        results: result,
                    };
                }
                const lastPage = parseInt($(pagination[pagination.length - 2])
                    .find('a')
                    .text()
                    .trim());
                return {
                    currentPage: page,
                    hasNextPage: page === lastPage ? false : true,
                    totalPages: lastPage,
                    results: result,
                };
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.searchApi = async (query) => {
            try {
                const formattedQuery = query.toLowerCase().split(' ').join('%20');
                const { data } = await this.client.request({
                    method: 'get',
                    url: `${this.baseUrl}/manga/search?search=${formattedQuery}&uid=`,
                    headers: {
                        Accept: 'application/json, text/javascript, */*; q=0.01',
                        Referer: `${this.baseWebsiteUrl}/`,
                    },
                });
                const result = {
                    currentPage: 1,
                    hasNextPage: false,
                    totalPages: 1,
                    totalResults: data.result.length,
                    results: this.formatSearchResultData(data.result),
                };
                return result;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchMangaInfo = async (mangaId) => {
            try {
                const { data } = await this.client.request({
                    method: 'get',
                    url: `${this.baseUrl}/manga-detail/${mangaId}?userid=`,
                    headers: {
                        Accept: 'application/json, text/javascript, */*; q=0.01',
                        Referer: `${this.baseWebsiteUrl}/`,
                    },
                });
                const $ = (0, cheerio_1.load)(data);
                const dom = $('html');
                const title = dom.find('.img-manga').attr('title');
                const img = dom.find('.img-manga').attr('src');
                const authors = $(dom.find('.col-md-7 > p:nth-child(2) > a'))
                    .map((index, ele) => $(ele).text().trim())
                    .get();
                const status = $(dom.find('div.col-md-7 > p')[1])
                    .find('span:nth-child(3)')
                    .text()
                    .trim();
                const genres = $(dom.find('div.col-md-7 > p')[2])
                    .find('a')
                    .map((index, ele) => $(ele).text().trim())
                    .get();
                const description = dom.find('.summary > .content').text().trim();
                const chapters = dom
                    .find('.list-group > a')
                    .map((index, ele) => {
                    const releaseDate = $(ele).find('p').text().trim();
                    const title = $(ele).text().replace(releaseDate, '').trim();
                    const chapterObj = {
                        id: $(ele).attr('href'),
                        title: title,
                        releaseDate: releaseDate,
                    };
                    return chapterObj;
                })
                    .get()
                    .reverse();
                const mangaInfo = {
                    id: mangaId,
                    title,
                    img,
                    authors,
                    status,
                    genres,
                    description,
                    chapters,
                };
                return mangaInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchChapterPages = async (chapterId) => {
            try {
                const { data } = await this.client.get(chapterId);
                const $ = (0, cheerio_1.load)(data);
                const dom = $('html');
                const images = dom
                    .find('.vview.carousel-inner > div > img')
                    .map((index, ele) => {
                    return {
                        img: $(ele).attr('data-src').slice(0, -5),
                        page: index + 1,
                    };
                })
                    .get();
                return images;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.formatSearchResultData = (searchResultData) => {
            return searchResultData.map(ele => {
                return {
                    id: `${ele.id}`,
                    title: ele.name,
                    altTitles: ele.title
                        .split(',')
                        .filter(ele => ele.length)
                        .map(ele => ele.trim()),
                    description: ele.description,
                    image: ele.thumbnail,
                    status: ele.completed === 1 ? models_1.MediaStatus.COMPLETED : models_1.MediaStatus.ONGOING,
                    score: ele.scored,
                    views: ele.viewed,
                    votes: ele.voted,
                    latestChapterId: ele.latest_chapter_id,
                    lastChapter: ele.lastChapter,
                };
            });
        };
    }
}
exports.default = VyvyManga;
//# sourceMappingURL=vyvymanga.js.map