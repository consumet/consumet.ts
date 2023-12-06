"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
class NovelUpdates extends models_1.LightNovelParser {
    constructor() {
        super(...arguments);
        this.name = 'NovelUpdates';
        this.baseUrl = 'https://www.novelupdates.com';
        this.proxyURL = 'http://translate.google.com/translate?sl=ja&tl=en&u=';
        this.logo = 'https://www.novelupdates.com/appicon.png';
        this.classPath = 'LIGHT_NOVELS.NovelUpdates';
        /**
         *
         * @param lightNovelUrl light novel link or id
         * @param chapterPage chapter page number (optional) if not provided, will fetch all chapter pages.
         */
        this.fetchLightNovelInfo = async (lightNovelUrl, chapterPage = -1) => {
            var _a, _b, _c, _d, _e, _f, _g;
            if (!lightNovelUrl.startsWith(this.baseUrl)) {
                lightNovelUrl = `${this.baseUrl}/series/${lightNovelUrl}`;
            }
            const lightNovelInfo = {
                id: (_a = lightNovelUrl.split('/')) === null || _a === void 0 ? void 0 : _a.pop(),
                title: '',
                url: lightNovelUrl,
            };
            try {
                const page = await fetch(`${this.proxyURL}${encodeURIComponent(lightNovelUrl)}`, {
                    headers: {
                        Referer: lightNovelUrl,
                    },
                });
                const $ = (0, cheerio_1.load)(await page.text());
                if ($('title').html() === 'Just a moment...' ||
                    $('title').html() === 'Attention Required! | Cloudflare') {
                    throw new Error('Client is blocked from accessing the site.');
                }
                lightNovelInfo.title = (_b = $('div.seriestitlenu').text()) === null || _b === void 0 ? void 0 : _b.trim();
                lightNovelInfo.image = $('div.seriesimg img').attr('src');
                lightNovelInfo.author = $('div#showauthors a').text();
                lightNovelInfo.genres = $('div#seriesgenre a')
                    .map((i, el) => $(el).text())
                    .get();
                lightNovelInfo.rating = parseFloat($('div.col-xs-12.col-sm-8.col-md-8.desc > div.rate > div.small > em > strong:nth-child(1) > span').text());
                lightNovelInfo.views = parseInt($('div.col-xs-12.col-sm-4.col-md-4.info-holder > div.info > div:nth-child(4) > span').text());
                lightNovelInfo.description = (_c = $('div#editdescription').text()) === null || _c === void 0 ? void 0 : _c.trim();
                const status = (_d = $('div#editstatus').text()) === null || _d === void 0 ? void 0 : _d.trim();
                if (status.includes('Complete')) {
                    lightNovelInfo.status = models_1.MediaStatus.COMPLETED;
                }
                else if (status.includes('Ongoing')) {
                    lightNovelInfo.status = models_1.MediaStatus.ONGOING;
                }
                else {
                    lightNovelInfo.status = models_1.MediaStatus.UNKNOWN;
                }
                const postId = $('input#mypostid').attr('value');
                lightNovelInfo.chapters = await this.fetchChapters(postId);
                lightNovelInfo.rating =
                    Number((_g = (_f = (_e = $('h5.seriesother span.uvotes').text()) === null || _e === void 0 ? void 0 : _e.split(' /')[0]) === null || _f === void 0 ? void 0 : _f.substring(1)) !== null && _g !== void 0 ? _g : 0) * 2;
                return lightNovelInfo;
            }
            catch (err) {
                console.error(err);
                throw new Error(err.message);
            }
        };
        this.fetchChapters = async (postId) => {
            const chapters = [];
            const chapterData = (await (await fetch(`${this.baseUrl}/wp-admin/admin-ajax.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    Cookie: '_ga=;',
                },
                body: `action=nd_getchapters&mypostid=${postId}&mypostid2=0`,
            })).text()).substring(1);
            const $ = (0, cheerio_1.load)(chapterData);
            $('li.sp_li_chp a[data-id]').each((index, el) => {
                const id = $(el).attr('data-id');
                const title = $(el).find('span').text();
                chapters.push({
                    id: id,
                    title: title,
                    url: `${this.baseUrl}/extnu/${id}`,
                });
            });
            return chapters;
        };
        /**
         *
         * @param chapterId chapter id or url
         */
        this.fetchChapterContent = async (chapterId) => {
            if (!chapterId.startsWith(this.baseUrl)) {
                chapterId = `${this.baseUrl}/extnu/${chapterId}`;
            }
            const contents = {
                novelTitle: '',
                chapterTitle: '',
                text: '',
            };
            try {
                const page = await fetch(`${this.proxyURL}${encodeURIComponent(chapterId)}`);
                const data = await page.text();
                const $ = (0, cheerio_1.load)(data);
                contents.novelTitle = $('title').text();
                contents.chapterTitle = $('title').text();
                contents.text = data;
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
                const res = await fetch(`${this.proxyURL}${encodeURIComponent(`${this.baseUrl}/series-finder/?sf=1&sh=${encodeURIComponent(query)}`)}`, {
                    headers: {
                        Referer: this.baseUrl,
                    },
                });
                const $ = (0, cheerio_1.load)(await res.text());
                $('div.search_main_box_nu').each((i, el) => {
                    var _a;
                    result.results.push({
                        id: (_a = $(el)
                            .find('div.search_body_nu div.search_title a')
                            .attr('href')) === null || _a === void 0 ? void 0 : _a.split('/series/')[1].split('/')[0],
                        title: $(el).find('div.search_body_nu div.search_title a').text(),
                        url: $(el).find('div.search_body_nu div.search_title a').attr('href'),
                        image: $(el).find('div.search_img_nu img').attr('src'),
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
exports.default = NovelUpdates;
// (async () => {
//   const ln = new ReadLightNovels();
//   const chap = await ln.fetchChapterContent('youkoso-jitsuryoku-shijou-shugi-no-kyoushitsu-e/volume-1-prologue-the-structure-of-japanese-society');
//   console.log(chap);
// })();
//# sourceMappingURL=novelupdates.js.map