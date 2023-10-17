"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const form_data_1 = __importDefault(require("form-data"));
const models_1 = require("../../models");
const utils_1 = require("../../utils");
class ReadLightNovels extends models_1.LightNovelParser {
    constructor() {
        super(...arguments);
        this.name = 'Read Light Novels';
        this.baseUrl = 'https://readlightnovels.net';
        this.logo = 'https://i.imgur.com/RDPjbc6.png';
        this.classPath = 'LIGHT_NOVELS.ReadLightNovels';
        /**
         *
         * @param lightNovelUrl light novel link or id
         * @param chapterPage chapter page number (optional) if not provided, will fetch all chapter pages.
         */
        this.fetchLightNovelInfo = async (lightNovelUrl, chapterPage = -1) => {
            var _a, _b;
            if (!lightNovelUrl.startsWith(this.baseUrl)) {
                lightNovelUrl = `${this.baseUrl}/${lightNovelUrl}.html`;
            }
            const lightNovelInfo = {
                id: (_b = (_a = lightNovelUrl.split('/')) === null || _a === void 0 ? void 0 : _a.pop()) === null || _b === void 0 ? void 0 : _b.replace('.html', ''),
                title: '',
                url: lightNovelUrl,
            };
            try {
                const page = await this.client.get(lightNovelUrl, {
                    headers: {
                        Referer: lightNovelUrl,
                    },
                });
                const $ = (0, cheerio_1.load)(page.data);
                const novelId = parseInt($('#id_post').val());
                lightNovelInfo.title = $('div.col-xs-12.col-sm-8.col-md-8.desc > h3').text();
                lightNovelInfo.image = $('div.col-xs-12.col-sm-4.col-md-4.info-holder > div.books > div > img').attr('src');
                lightNovelInfo.author = $('div.col-xs-12.col-sm-4.col-md-4.info-holder > div.info > div:nth-child(1) > a').text();
                lightNovelInfo.genres = $(' div.col-xs-12.col-sm-4.col-md-4.info-holder > div.info > div:nth-child(2) > a')
                    .map((i, el) => $(el).text())
                    .get();
                lightNovelInfo.rating = parseFloat($('div.col-xs-12.col-sm-8.col-md-8.desc > div.rate > div.small > em > strong:nth-child(1) > span').text());
                lightNovelInfo.views = parseInt($('div.col-xs-12.col-sm-4.col-md-4.info-holder > div.info > div:nth-child(4) > span').text());
                lightNovelInfo.description = $('div.col-xs-12.col-sm-8.col-md-8.desc > div.desc-text > hr')
                    .eq(0)
                    .nextUntil('hr')
                    .text();
                const pages = Math.max(...$('#pagination > ul > li')
                    .map((i, el) => parseInt($(el).find('a').attr('data-page')))
                    .get()
                    .filter(x => !isNaN(x)));
                switch ($('div.col-xs-12.col-sm-4.col-md-4.info-holder > div.info > div:nth-child(3) > span').text()) {
                    case 'Completed':
                        lightNovelInfo.status = models_1.MediaStatus.COMPLETED;
                        break;
                    case 'On Going':
                        lightNovelInfo.status = models_1.MediaStatus.ONGOING;
                        break;
                    default:
                        lightNovelInfo.status = models_1.MediaStatus.UNKNOWN;
                        break;
                }
                lightNovelInfo.pages = pages;
                lightNovelInfo.chapters = [];
                if (chapterPage === -1) {
                    lightNovelInfo.chapters = await this.fetchAllChapters(novelId, pages, lightNovelUrl);
                }
                else {
                    lightNovelInfo.chapters = await this.fetchChapters(novelId, chapterPage, lightNovelUrl);
                }
                return lightNovelInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchChapters = async (novelId, chapterPage, referer) => {
            var _a;
            const chapters = [];
            const bodyFormData = new form_data_1.default();
            bodyFormData.append('action', 'tw_ajax');
            bodyFormData.append('type', 'pagination');
            bodyFormData.append('page', chapterPage);
            bodyFormData.append('id', novelId);
            const page = await this.client({
                method: 'post',
                url: `${this.baseUrl}/wp-admin/admin-ajax.php`,
                data: bodyFormData,
                headers: {
                    referer: referer,
                    'content-type': 'multipart/form-data',
                    origin: this.baseUrl,
                    'user-agent': utils_1.USER_AGENT,
                },
            });
            const $ = (0, cheerio_1.load)(page.data.list_chap);
            for (const chapter of $('ul.list-chapter > li')) {
                const subId = (_a = $(chapter).find('a').attr('href').split('/')) === null || _a === void 0 ? void 0 : _a.pop().replace('.html', '');
                const id = $(chapter).find('a').attr('href').split('/')[3];
                chapters.push({
                    id: `${id}/${subId}`,
                    title: $(chapter).find('a > span').text().trim(),
                    url: $(chapter).find('a').attr('href'),
                });
            }
            return chapters;
        };
        this.fetchAllChapters = async (novelId, pages, referer) => {
            const chapters = [];
            for (const pageNumber of Array.from({ length: pages }, (_, i) => i + 1)) {
                const chaptersPage = await this.fetchChapters(novelId, pageNumber, referer);
                chapters.push(...chaptersPage);
            }
            return chapters;
        };
        /**
         *
         * @param chapterId chapter id or url
         */
        this.fetchChapterContent = async (chapterId) => {
            if (!chapterId.startsWith(this.baseUrl)) {
                chapterId = `${this.baseUrl}/${chapterId}.html`;
            }
            const contents = {
                novelTitle: '',
                chapterTitle: '',
                text: '',
            };
            try {
                const page = await this.client.get(chapterId);
                const $ = (0, cheerio_1.load)(page.data);
                contents.novelTitle = $('.truyen-title').text();
                contents.chapterTitle = $('.chapter-title').text();
                for (const line of $('div.chapter-content > p')) {
                    if ($(line).text() != '﻿') {
                        contents.text += `${$(line).text()}\n`;
                    }
                }
                return contents;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         *
         * @param query search query string
         */
        this.search = async (query) => {
            const result = { results: [] };
            try {
                const res = await this.client.post(`${this.baseUrl}/?s=${query}`);
                const $ = (0, cheerio_1.load)(res.data);
                $('div.col-xs-12.col-sm-12.col-md-9.col-truyen-main > div:nth-child(1) > div > div:nth-child(2) > div.col-md-3.col-sm-6.col-xs-6.home-truyendecu').each((i, el) => {
                    var _a;
                    result.results.push({
                        id: (_a = $(el).find('a').attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[3].replace('.html', ''),
                        title: $(el).find('a > div > h3').text(),
                        url: $(el).find('a').attr('href'),
                        image: $(el).find('a > img').attr('src'),
                    });
                });
                return result;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
}
exports.default = ReadLightNovels;
// (async () => {
//   const ln = new ReadLightNovels();
//   const chap = await ln.fetchChapterContent('youkoso-jitsuryoku-shijou-shugi-no-kyoushitsu-e/volume-1-prologue-the-structure-of-japanese-society');
//   console.log(chap);
// })();
//# sourceMappingURL=readlightnovels.js.map