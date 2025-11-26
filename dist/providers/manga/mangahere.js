"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const utils_1 = require("../../utils/utils");
class MangaHere extends models_1.MangaParser {
    constructor() {
        super(...arguments);
        this.name = 'MangaHere';
        this.baseUrl = 'https://mangahere.cc';
        this.logo = 'https://i.pinimg.com/564x/51/08/62/51086247ed16ff8abae2df0bb06448e4.jpg';
        this.classPath = 'MANGA.MangaHere';
        this.fetchMangaInfo = async (mangaId) => {
            const mangaInfo = {
                id: mangaId,
                title: '',
            };
            try {
                const { data } = await this.client.get(`${this.baseUrl}/manga/${mangaId}`, {
                    headers: {
                        cookie: 'isAdult=1',
                    },
                });
                const $ = (0, cheerio_1.load)(data);
                mangaInfo.title = $('span.detail-info-right-title-font').text();
                mangaInfo.description = $('div.detail-info-right > p.fullcontent').text();
                mangaInfo.headers = { Referer: this.baseUrl };
                mangaInfo.image = $('div.detail-info-cover > img').attr('src');
                mangaInfo.genres = $('p.detail-info-right-tag-list > a')
                    .map((i, el) => { var _a; return (_a = $(el).attr('title')) === null || _a === void 0 ? void 0 : _a.trim(); })
                    .get();
                switch ($('span.detail-info-right-title-tip').text()) {
                    case 'Ongoing':
                        mangaInfo.status = models_1.MediaStatus.ONGOING;
                        break;
                    case 'Completed':
                        mangaInfo.status = models_1.MediaStatus.COMPLETED;
                        break;
                    default:
                        mangaInfo.status = models_1.MediaStatus.UNKNOWN;
                        break;
                }
                mangaInfo.rating = parseFloat($('span.detail-info-right-title-star > span').last().text());
                mangaInfo.authors = $('p.detail-info-right-say > a')
                    .map((i, el) => $(el).attr('title'))
                    .get();
                mangaInfo.chapters = $('ul.detail-main-list > li')
                    .map((i, el) => {
                    var _a;
                    return ({
                        id: (_a = $(el).find('a').attr('href')) === null || _a === void 0 ? void 0 : _a.split('/manga/')[1].slice(0, -7),
                        title: $(el).find('a > div > p.title3').text(),
                        releasedDate: $(el).find('a > div > p.title2').text().trim(),
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
            var _a, _b;
            const chapterPages = [];
            const url = `${this.baseUrl}/manga/${chapterId}/1.html`;
            try {
                const { data } = await this.client.get(url, {
                    headers: {
                        cookie: 'isAdult=1',
                    },
                });
                const $ = (0, cheerio_1.load)(data);
                const copyrightHandle = $('p.detail-block-content').text().match('Dear user') ||
                    $('p.detail-block-content').text().match('blocked');
                if (copyrightHandle) {
                    throw Error((_a = copyrightHandle.input) === null || _a === void 0 ? void 0 : _a.trim());
                }
                const bar = $('script[src*=chapter_bar]').data();
                const html = $.html();
                if (typeof bar !== 'undefined') {
                    const ss = html.indexOf('eval(function(p,a,c,k,e,d)');
                    const se = html.indexOf('</script>', ss);
                    const s = html.substring(ss, se);
                    const ds = (0, utils_1.safeUnpack)(s);
                    const urls = ds.split("['")[1].split("']")[0].split("','");
                    urls.map((url, i) => chapterPages.push({
                        page: i,
                        img: `https:${url}`,
                        headerForImage: { Referer: url },
                    }));
                }
                else {
                    let sKey = this.extractKey(html);
                    const chapterIdsl = html.indexOf('chapterid');
                    const chapterId = html.substring(chapterIdsl + 11, html.indexOf(';', chapterIdsl)).trim();
                    const chapterPagesElmnt = $('body > div:nth-child(6) > div > span').children('a');
                    const pages = parseInt((_b = chapterPagesElmnt.last().prev().attr('data-page')) !== null && _b !== void 0 ? _b : '0');
                    const pageBase = url.substring(0, url.lastIndexOf('/'));
                    let resText = '';
                    for (let i = 1; i <= pages; i++) {
                        const pageLink = `${pageBase}/chapterfun.ashx?cid=${chapterId}&page=${i}&key=${sKey}`;
                        for (let j = 1; j <= 3; j++) {
                            const { data } = await this.client.get(pageLink, {
                                headers: {
                                    Referer: url,
                                    'X-Requested-With': 'XMLHttpRequest',
                                    cookie: 'isAdult=1',
                                },
                            });
                            resText = data;
                            if (resText)
                                break;
                            else
                                sKey = '';
                        }
                        const ds = (0, utils_1.safeUnpack)(resText);
                        const baseLinksp = ds.indexOf('pix=') + 5;
                        const baseLinkes = ds.indexOf(';', baseLinksp) - 1;
                        const baseLink = ds.substring(baseLinksp, baseLinkes);
                        const imageLinksp = ds.indexOf('pvalue=') + 9;
                        const imageLinkes = ds.indexOf('"', imageLinksp);
                        const imageLink = ds.substring(imageLinksp, imageLinkes);
                        chapterPages.push({
                            page: i - 1,
                            img: `https:${baseLink}${imageLink}`,
                            headerForImage: { Referer: url },
                        });
                    }
                }
                return chapterPages;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.search = async (query, page = 1) => {
            const searchRes = {
                currentPage: page,
                results: [],
            };
            try {
                const { data } = await this.client.get(`${this.baseUrl}/search?title=${query}&page=${page}`);
                const $ = (0, cheerio_1.load)(data);
                searchRes.hasNextPage = $('div.pager-list-left > a.active').next().text() !== '>';
                searchRes.results = $('div.container > div > div > ul > li')
                    .map((i, el) => {
                    var _a;
                    return ({
                        id: (_a = $(el).find('a').attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[2],
                        title: $(el).find('p.manga-list-4-item-title > a').text(),
                        headerForImage: { Referer: this.baseUrl },
                        image: $(el).find('a > img').attr('src'),
                        description: $(el).find('p').last().text(),
                        status: $(el).find('p.manga-list-4-show-tag-list-2 > a').text() === 'Ongoing'
                            ? models_1.MediaStatus.ONGOING
                            : $(el).find('p.manga-list-4-show-tag-list-2 > a').text() === 'Completed'
                                ? models_1.MediaStatus.COMPLETED
                                : models_1.MediaStatus.UNKNOWN,
                    });
                })
                    .get();
                return searchRes;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchMangaRanking = async (type = 'total') => {
            let url = '';
            switch (type) {
                case 'total':
                    url = `${this.baseUrl}/totalranking/`;
                    break;
                case 'month':
                    url = `${this.baseUrl}/monthranking/`;
                    break;
                case 'week':
                    url = `${this.baseUrl}/ranking/`;
                    break;
                case 'day':
                    url = `${this.baseUrl}/dayranking/`;
                    break;
                default:
                    url = `${this.baseUrl}/totalranking/`;
                    break;
            }
            return this._getMangaList(url);
        };
        this.fetchMangaHotReleases = async () => this._getMangaList(`${this.baseUrl}/hot/`);
        this.fetchMangaTrending = async () => this._getMangaList(`${this.baseUrl}/trending/`);
        this.fetchMangaRecentUpdate = async (page = 1) => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/latest/${page}/`);
                const $ = (0, cheerio_1.load)(data);
                const recentUpdate = {
                    currentPage: page,
                    hasNextPage: $('div.pager-list-left > a').last().text() === '>',
                    results: [],
                };
                recentUpdate.results = $('ul.manga-list-4-list > li')
                    .map((i, el) => {
                    var _a;
                    const latestChapter = $(el).find('ul.manga-list-4-item-part > li > a').first();
                    const latestChapterUrl = latestChapter.attr('href');
                    const latestChapterText = latestChapter.text();
                    let latestChapterId;
                    if (latestChapterUrl) {
                        latestChapterId = latestChapterUrl.substring('/manga/'.length, latestChapterUrl.lastIndexOf('/'));
                    }
                    let latestChapterNumber;
                    if (latestChapterText) {
                        const match = latestChapterText.match(/(\d+(\.\d+)?)$/);
                        if (match) {
                            latestChapterNumber = parseFloat(match[0]);
                        }
                    }
                    return {
                        id: (_a = $(el).find('a').first().attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[2],
                        title: $(el).find('p.manga-list-4-item-title > a').attr('title'),
                        image: $(el).find('a > img').first().attr('src'),
                        genres: $(el)
                            .find('p.manga-list-4-show-tag-list > a')
                            .map((i, el) => $(el).text())
                            .get(),
                        latestChapterId: latestChapterId,
                        latestChapterNumber: latestChapterNumber,
                        headerForImage: { Referer: this.baseUrl },
                    };
                })
                    .get();
                return recentUpdate;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.browse = async (options = {}) => {
            const { genre, status, sort, page = 1 } = options;
            let path = '/directory/';
            const pathSegments = [];
            if (genre) {
                pathSegments.push(genre);
            }
            if (status && status !== 'all') {
                switch (status) {
                    case 'new':
                        pathSegments.push('new');
                        break;
                    case 'completed':
                        pathSegments.push('completed');
                        break;
                    case 'ongoing':
                        pathSegments.push('on_going');
                        break;
                }
            }
            if (pathSegments.length > 0) {
                path = `/${pathSegments.join('/')}/`;
            }
            let url = `${this.baseUrl}${path}`;
            if (page > 1) {
                url += `${page}.htm`;
            }
            if (sort && sort !== 'popularity') {
                url += `?${sort}`;
            }
            try {
                const { data } = await this.client.get(url, {
                    headers: {
                        cookie: 'isAdult=1',
                    },
                });
                const $ = (0, cheerio_1.load)(data);
                const browseResult = {
                    currentPage: page,
                    hasNextPage: $('.pager-list-left > a').last().text() === '>',
                    results: [],
                };
                browseResult.results = $('.manga-list-1-list > li')
                    .map((i, el) => {
                    var _a;
                    const subtitleLink = $(el).find('p.manga-list-1-item-subtitle > a');
                    const latestChapterUrl = subtitleLink.attr('href');
                    const latestChapterText = subtitleLink.text();
                    let latestChapterId;
                    if (latestChapterUrl) {
                        latestChapterId = latestChapterUrl.substring('/manga/'.length, latestChapterUrl.lastIndexOf('/'));
                    }
                    let latestChapterNumber;
                    if (latestChapterText) {
                        const match = latestChapterText.match(/(\d+(\.\d+)?)$/);
                        if (match) {
                            latestChapterNumber = parseFloat(match[0]);
                        }
                    }
                    return {
                        id: (_a = $(el).find('a').first().attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[2],
                        title: $(el).find('a').first().attr('title'),
                        image: $(el).find('a > img').first().attr('src'),
                        headerForImage: { Referer: this.baseUrl },
                        latestChapterId: latestChapterId,
                        latestChapterNumber: latestChapterNumber,
                    };
                })
                    .get();
                return browseResult;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this._getMangaList = async (url) => {
            try {
                const { data } = await this.client.get(url, {
                    headers: {
                        cookie: 'isAdult=1',
                    },
                });
                const $ = (0, cheerio_1.load)(data);
                const mangaList = {
                    currentPage: 1,
                    hasNextPage: false,
                    results: [],
                };
                mangaList.results = $('.manga-list-1-list > li')
                    .map((i, el) => {
                    var _a;
                    const subtitleLink = $(el).find('p.manga-list-1-item-subtitle > a');
                    const latestChapterUrl = subtitleLink.attr('href');
                    const latestChapterText = subtitleLink.text();
                    let latestChapterId;
                    if (latestChapterUrl) {
                        latestChapterId = latestChapterUrl.substring('/manga/'.length, latestChapterUrl.lastIndexOf('/'));
                    }
                    let latestChapterNumber;
                    if (latestChapterText) {
                        const match = latestChapterText.match(/(\d+(\.\d+)?)$/);
                        if (match) {
                            latestChapterNumber = parseFloat(match[0]);
                        }
                    }
                    return {
                        id: (_a = $(el).find('a').first().attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[2],
                        title: $(el).find('a').first().attr('title'),
                        image: $(el).find('a > img').first().attr('src'),
                        headerForImage: { Referer: this.baseUrl },
                        latestChapterId: latestChapterId,
                        latestChapterNumber: latestChapterNumber,
                    };
                })
                    .get();
                return mangaList;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         *  credit: [tachiyomi-extensions](https://github.com/tachiyomiorg/tachiyomi-extensions/blob/master/src/en/mangahere/src/eu/kanade/tachiyomi/extension/en/mangahere/Mangahere.kt)
         */
        this.extractKey = (html) => {
            const skss = html.indexOf('eval(function(p,a,c,k,e,d)');
            const skse = html.indexOf('</script>', skss);
            const sks = html.substring(skss, skse);
            const skds = (0, utils_1.safeUnpack)(sks);
            const sksl = skds.indexOf("'");
            const skel = skds.indexOf(';');
            const skrs = skds.substring(sksl, skel);
            // return eval(skrs) as string;
            return skrs.slice(1, -1);
        };
    }
}
exports.default = MangaHere;
//# sourceMappingURL=mangahere.js.map