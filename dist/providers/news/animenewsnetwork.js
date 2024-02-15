"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("../../utils/utils");
const models_1 = require("../../models");
class NewsFeed {
    constructor(title, id, uploadedAt, topics, preview, thumbnail, thumbnailHash, url) {
        this.title = title;
        this.id = id;
        this.uploadedAt = uploadedAt;
        this.topics = topics;
        this.preview = preview;
        this.thumbnail = thumbnail;
        this.thumbnailHash = thumbnailHash;
        this.url = url;
    }
    async getInfo() {
        return await scrapNewsInfo(this.url).catch((err) => {
            throw new Error(err.message);
        });
    }
}
async function scrapNewsInfo(url) {
    const { data } = await axios_1.default.get(url);
    const $ = (0, cheerio_1.load)(data);
    const title = $('#page_header').text().replace('News', '').trim();
    const intro = $('.intro').first().text().trim();
    const description = $('.meat > p').text().trim().split('\n\n').join('\n');
    const time = $('#page-title > small > time').text().trim();
    const thumbnailSlug = $('.meat > figure.fright').first().find('img').attr('data-src');
    const thumbnail = thumbnailSlug
        ? `https://animenewsnetwork.com${thumbnailSlug}`
        : 'https://i.imgur.com/KkkVr1g.png';
    const thumbnailHash = (0, utils_1.getHashFromImage)(thumbnailSlug ? `https://animenewsnetwork.com${thumbnailSlug}` : 'https://i.imgur.com/KkkVr1g.png');
    return {
        id: url.split('news/')[1],
        title,
        uploadedAt: time,
        intro,
        description,
        thumbnail,
        thumbnailHash,
        url,
    };
}
class AnimeNewsNetwork extends models_1.NewsParser {
    constructor() {
        super(...arguments);
        this.name = 'Anime News Network';
        this.baseUrl = 'https://www.animenewsnetwork.com';
        this.classPath = 'NEWS.ANN';
        this.logo = 'https://i.imgur.com/KkkVr1g.png';
        /**
         * @param topic Topic for fetching the feeds
         */
        this.fetchNewsFeeds = async (topic) => await axios_1.default
            .get(`${this.baseUrl}/news${topic && Object.values(models_1.Topics).includes(topic) ? `/?topic=${topic}` : ''}`)
            .then(({ data }) => {
            const $ = (0, cheerio_1.load)(data);
            const feeds = [];
            $('.herald.box.news').each((i, el) => {
                const thumbnailSlug = $(el).find('.thumbnail').attr('data-src');
                const thumbnail = thumbnailSlug ? `${this.baseUrl}${thumbnailSlug}` : this.logo;
                const thumbnailHash = (0, utils_1.getHashFromImage)(thumbnailSlug ? `${this.baseUrl}${thumbnailSlug}` : this.logo);
                const title = $(el).find('h3').text().trim();
                const slug = $(el).find('h3 > a').attr('href') || '';
                const url = `${this.baseUrl}${slug}`;
                const byline = $(el).find('.byline');
                const time = byline.find('time').text().trim();
                const topics = [];
                byline.find('.topics > a').each((i, el) => {
                    topics.push($(el).text().trim());
                });
                const El = $(el).find('.preview');
                const preview = {
                    intro: El.find('.intro').text().trim(),
                    full: El.find('.full').text().replace('―', '').trim(),
                };
                feeds.push(new NewsFeed(title, slug.replace('/news/', ''), time, topics, preview, thumbnail, thumbnailHash, url));
            });
            return feeds;
        })
            .catch((err) => {
            throw new Error(err.message);
        });
        /**
         * @param id ID of the news from Anime News Network
         * @example
         * fetchNewsInfo('2022-08-26/higurashi-no-naku-koro-ni-rei-oni-okoshi-hen-manga-ends/.188996') // --> https://www.animenewsnetwork.com/news/2022-08-26/higurashi-no-naku-koro-ni-rei-oni-okoshi-hen-manga-ends/.188996
         */
        this.fetchNewsInfo = async (id) => {
            if (!id || typeof id !== 'string')
                throw new TypeError(`The type of parameter "id" should be of type "string", received type "${typeof id}" instead`);
            return await scrapNewsInfo(`${this.baseUrl}/news/${id}`).catch((err) => {
                throw new Error(err.message);
            });
        };
    }
}
exports.default = AnimeNewsNetwork;
//# sourceMappingURL=animenewsnetwork.js.map