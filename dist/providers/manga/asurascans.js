"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
let cloudscraper;
class AsuraScans extends models_1.MangaParser {
    constructor() {
        try {
            cloudscraper = require('cloudscraper');
        }
        catch (err) {
            if (err.message.includes("Cannot find module 'request'")) {
                throw new Error('Request is not installed. Please install it by running "npm i request" or "yarn add request"');
            }
            else if (err.message.includes("Cannot find module 'cloudscraper'")) {
                throw new Error('Cloudscraper is not installed. Please install it by running "npm i cloudscraper" or "yarn add cloudscraper"');
            }
            else {
                throw new Error(err.message);
            }
        }
        super();
        this.name = 'AsuraScans';
        this.baseUrl = 'https://www.asurascans.com/';
        this.logo = 'https://www.asurascans.com/wp-content/uploads/2021/03/Group_1.png';
        this.classPath = 'MANGA.AsuraScans';
        this.fetchMangaInfo = async (mangaId) => {
            const options = {
                method: 'GET',
                url: `${this.baseUrl}/manga/${mangaId.trim()}`,
                headers: {
                    'User-Agent': 'Ubuntu Chromium/34.0.1847.116 Chrome/34.0.1847.116 Safari/537.36',
                    'Cache-Control': 'private',
                    Accept: 'application/xml,application/xhtml+xml,text/html;q=0.9, text/plain;q=0.8,image/png,*/*;q=0.5',
                },
                cloudflareTimeout: 5000,
                cloudflareMaxTimeout: 30000,
                followAllRedirects: true,
                challengesToSolve: 3,
                decodeEmails: false,
                gzip: true,
            };
            const mangaInfo = {
                id: mangaId,
                title: '',
            };
            try {
                const data = await cloudscraper(options).then((response) => response);
                const $ = (0, cheerio_1.load)(data);
                const seriesTitleSelector = 'h1.entry-title';
                const seriesArtistSelector = ".infotable tr:icontains('artist') td:last-child, .tsinfo .imptdt:icontains('artist') i, .fmed b:icontains('artist')+span, span:icontains('artist')";
                const seriesAuthorSelector = ".infotable tr:icontains('author') td:last-child, .tsinfo .imptdt:icontains('author') i, .fmed b:icontains('author')+span, span:icontains('author')";
                const seriesDescriptionSelector = '.desc, .entry-content[itemprop=description]';
                const seriesAltNameSelector = ".alternative, .wd-full:icontains('alt') span, .alter, .seriestualt";
                const seriesGenreSelector = 'div.gnr a, .mgen a, .seriestugenre a';
                const seriesStatusSelector = ".infotable tr:icontains('status') td:last-child, .tsinfo .imptdt:icontains('status') i, .fmed b:icontains('status')+span span:icontains('status')";
                const seriesThumbnailSelector = '.infomanga > div[itemprop=image] img, .thumb img';
                const seriesChaptersSelector = 'div.bxcl li, div.cl li, #chapterlist li, ul li:has(div.chbox):has(div.eph-num)';
                mangaInfo.title = $(seriesTitleSelector).text().trim();
                mangaInfo.altTitles = $(seriesAltNameSelector).text()
                    ? $(seriesAltNameSelector)
                        .text()
                        .split(',')
                        .map(item => item.trim())
                    : [];
                mangaInfo.description = $(seriesDescriptionSelector).text().trim();
                mangaInfo.headerForImage = { Referer: this.baseUrl };
                mangaInfo.image = $(seriesThumbnailSelector).attr('src');
                mangaInfo.genres = $(seriesGenreSelector)
                    .map((i, el) => $(el).text())
                    .get();
                switch ($(seriesStatusSelector).text().trim()) {
                    case 'Completed':
                        mangaInfo.status = models_1.MediaStatus.COMPLETED;
                        break;
                    case 'Ongoing':
                        mangaInfo.status = models_1.MediaStatus.ONGOING;
                        break;
                    case 'Dropped':
                        mangaInfo.status = models_1.MediaStatus.CANCELLED;
                        break;
                    default:
                        mangaInfo.status = models_1.MediaStatus.UNKNOWN;
                        break;
                }
                mangaInfo.authors = $(seriesAuthorSelector).text().replace('-', '').trim()
                    ? $(seriesAuthorSelector)
                        .text()
                        .split(',')
                        .map(item => item.trim())
                    : [];
                mangaInfo.artist = $(seriesArtistSelector).text().trim()
                    ? $(seriesArtistSelector).text().trim()
                    : 'N/A';
                mangaInfo.chapters = $(seriesChaptersSelector)
                    .map((i, el) => {
                    var _a, _b;
                    return ({
                        id: (_b = (_a = $(el).find('a').attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[3]) !== null && _b !== void 0 ? _b : '',
                        title: $(el).find('.lch a, .chapternum').text(),
                        releasedDate: $(el).find('.chapterdate').text(),
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
            const options = {
                method: 'GET',
                url: `${this.baseUrl}/${chapterId.trim()}`,
                headers: {
                    'User-Agent': 'Ubuntu Chromium/34.0.1847.116 Chrome/34.0.1847.116 Safari/537.36',
                    'Cache-Control': 'private',
                    Accept: 'application/xml,application/xhtml+xml,text/html;q=0.9, text/plain;q=0.8,image/png,*/*;q=0.5',
                },
                cloudflareTimeout: 5000,
                cloudflareMaxTimeout: 30000,
                followAllRedirects: true,
                challengesToSolve: 3,
                decodeEmails: false,
                gzip: true,
            };
            try {
                const data = await cloudscraper(options).then((response) => response);
                const $ = (0, cheerio_1.load)(data);
                const pageSelector = 'div#readerarea img';
                const pages = $(pageSelector)
                    .map((i, el) => ({
                    img: $(el).attr('src'),
                    page: i,
                    headerForImage: { Referer: this.baseUrl },
                }))
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
        this.search = async (query) => {
            try {
                const options = {
                    method: 'GET',
                    url: `${this.baseUrl}/?s=${query.replace(/ /g, '%20')}`,
                    headers: {
                        'User-Agent': 'Ubuntu Chromium/34.0.1847.116 Chrome/34.0.1847.116 Safari/537.36',
                        'Cache-Control': 'private',
                        Accept: 'application/xml,application/xhtml+xml,text/html;q=0.9, text/plain;q=0.8,image/png,*/*;q=0.5',
                    },
                    cloudflareTimeout: 5000,
                    cloudflareMaxTimeout: 30000,
                    followAllRedirects: true,
                    challengesToSolve: 3,
                    decodeEmails: false,
                    gzip: true,
                };
                const data = await cloudscraper(options).then((response) => response);
                const $ = (0, cheerio_1.load)(data);
                const searchMangaSelector = '.utao .uta .imgu, .listupd .bs .bsx, .listo .bs .bsx';
                const results = $(searchMangaSelector)
                    .map((i, el) => {
                    var _a, _b;
                    return ({
                        id: (_b = (_a = $(el).find('a').attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[4]) !== null && _b !== void 0 ? _b : '',
                        title: $(el).find('a').attr('title'),
                        image: $(el).find('img').attr('src'),
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
exports.default = AsuraScans;
//# sourceMappingURL=asurascans.js.map