"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const utils_1 = require("../../utils");
class Gogoanime extends models_1.AnimeParser {
    constructor() {
        super(...arguments);
        this.name = 'Gogoanime';
        this.baseUrl = 'https://gogoanime.gg';
        this.logo = 'https://i0.wp.com/cloudfuji.com/wp-content/uploads/2021/12/gogoanime.png?fit=300%2C400&ssl=1';
        this.classPath = 'ANIME.Gogoanime';
        this.ajaxUrl = 'https://ajax.gogo-load.com/ajax';
        /**
         *
         * @param query search query string
         * @param page page number (default 1) (optional)
         */
        this.search = (query, page = 1) => __awaiter(this, void 0, void 0, function* () {
            const searchResult = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            try {
                const res = yield axios_1.default.get(`${this.baseUrl}/search.html?keyword=${encodeURIComponent(query)}&page=${page}`);
                const $ = (0, cheerio_1.load)(res.data);
                searchResult.hasNextPage =
                    $('div.anime_name.new_series > div > div > ul > li.selected').next().length > 0;
                $('div.last_episodes > ul > li').each((i, el) => {
                    var _a;
                    searchResult.results.push({
                        id: (_a = $(el).find('p.name > a').attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[2],
                        title: $(el).find('p.name > a').attr('title'),
                        url: `${this.baseUrl}/${$(el).find('p.name > a').attr('href')}`,
                        image: $(el).find('div > a > img').attr('src'),
                        releaseDate: $(el).find('p.released').text().trim(),
                        subOrDub: $(el).find('p.name > a').text().toLowerCase().includes('dub')
                            ? models_1.SubOrSub.DUB
                            : models_1.SubOrSub.SUB,
                    });
                });
                return searchResult;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        /**
         *
         * @param animeUrl anime id
         */
        this.fetchAnimeInfo = (id) => __awaiter(this, void 0, void 0, function* () {
            if (!id.startsWith(this.baseUrl))
                id = `${this.baseUrl}/category/${id}`;
            const animeInfo = {
                id: '',
                title: '',
                url: id,
                genres: [],
                totalEpisodes: 0,
            };
            try {
                const res = yield axios_1.default.get(id);
                const $ = (0, cheerio_1.load)(res.data);
                animeInfo.id = new URL(id).pathname.split('/')[2];
                animeInfo.title = $('section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > h1')
                    .text()
                    .trim();
                animeInfo.url = id;
                animeInfo.image = $('div.anime_info_body_bg > img').attr('src');
                animeInfo.releaseDate = $('div.anime_info_body_bg > p:nth-child(7)')
                    .text()
                    .trim()
                    .split('Released: ')[1];
                animeInfo.description = $('div.anime_info_body_bg > p:nth-child(5)')
                    .text()
                    .trim()
                    .replace('Plot Summary: ', '');
                animeInfo.subOrDub = animeInfo.title.toLowerCase().includes('dub')
                    ? models_1.SubOrSub.DUB
                    : models_1.SubOrSub.SUB;
                animeInfo.type = $('div.anime_info_body_bg > p:nth-child(4) > a').text().trim();
                animeInfo.status = models_1.MediaStatus.UNKNOWN;
                switch ($('div.anime_info_body_bg > p:nth-child(8) > a').text().trim()) {
                    case 'Ongoing':
                        animeInfo.status = models_1.MediaStatus.ONGOING;
                        break;
                    case 'Completed':
                        animeInfo.status = models_1.MediaStatus.COMPLETED;
                        break;
                    case 'Upcoming':
                        animeInfo.status = models_1.MediaStatus.NOT_YET_AIRED;
                        break;
                    default:
                        animeInfo.status = models_1.MediaStatus.UNKNOWN;
                        break;
                }
                animeInfo.otherName = $('div.anime_info_body_bg > p:nth-child(9)')
                    .text()
                    .replace('Other name: ', '')
                    .replace(/;/g, ',');
                $('div.anime_info_body_bg > p:nth-child(6) > a').each((i, el) => {
                    var _a;
                    (_a = animeInfo.genres) === null || _a === void 0 ? void 0 : _a.push($(el).attr('title').toString());
                });
                const ep_start = $('#episode_page > li').first().find('a').attr('ep_start');
                const ep_end = $('#episode_page > li').last().find('a').attr('ep_end');
                const movie_id = $('#movie_id').attr('value');
                const alias = $('#alias_anime').attr('value');
                const html = yield axios_1.default.get(`${this.ajaxUrl}/load-list-episode?ep_start=${ep_start}&ep_end=${ep_end}&id=${movie_id}&default_ep=${0}&alias=${alias}`);
                const $$ = (0, cheerio_1.load)(html.data);
                animeInfo.episodes = [];
                $$('#episode_related > li').each((i, el) => {
                    var _a, _b, _c;
                    (_a = animeInfo.episodes) === null || _a === void 0 ? void 0 : _a.push({
                        id: (_b = $(el).find('a').attr('href')) === null || _b === void 0 ? void 0 : _b.split('/')[1],
                        number: parseInt($(el).find(`div.name`).text().replace('EP ', '')),
                        url: `${this.baseUrl}/${(_c = $(el).find(`a`).attr('href')) === null || _c === void 0 ? void 0 : _c.trim()}`,
                    });
                });
                animeInfo.episodes = animeInfo.episodes.reverse();
                animeInfo.totalEpisodes = parseInt(ep_end !== null && ep_end !== void 0 ? ep_end : '0');
                return animeInfo;
            }
            catch (err) {
                throw new Error("Anime doesn't exist.");
            }
        });
        /**
         *
         * @param episodeId episode id
         * @param server server type (default 'GogoCDN') (optional)
         */
        this.fetchEpisodeSources = (episodeId, server = models_1.StreamingServers.GogoCDN) => __awaiter(this, void 0, void 0, function* () {
            if (episodeId.startsWith('http')) {
                const serverUrl = new URL(episodeId);
                switch (server) {
                    case models_1.StreamingServers.GogoCDN:
                        return {
                            headers: { Referer: serverUrl.href },
                            sources: yield new utils_1.GogoCDN().extract(serverUrl),
                        };
                    case models_1.StreamingServers.StreamSB:
                        return {
                            headers: { Referer: serverUrl.href, watchsb: 'streamsb', 'User-Agent': utils_1.USER_AGENT },
                            sources: yield new utils_1.StreamSB().extract(serverUrl),
                        };
                    default:
                        return {
                            headers: { Referer: serverUrl.href },
                            sources: yield new utils_1.GogoCDN().extract(serverUrl),
                        };
                }
            }
            try {
                const res = yield axios_1.default.get(`${this.baseUrl}/${episodeId}`);
                const $ = (0, cheerio_1.load)(res.data);
                let serverUrl;
                switch (server) {
                    case models_1.StreamingServers.GogoCDN:
                        serverUrl = new URL(`https:${$('#load_anime > div > div > iframe').attr('src')}`);
                        break;
                    case models_1.StreamingServers.StreamSB:
                        serverUrl = new URL($('div.anime_video_body > div.anime_muti_link > ul > li.streamsb > a').attr('data-video'));
                        break;
                    default:
                        serverUrl = new URL(`https:${$('#load_anime > div > div > iframe').attr('src')}`);
                        break;
                }
                return yield this.fetchEpisodeSources(serverUrl.href, server);
            }
            catch (err) {
                console.error(err);
                throw new Error('Episode not found.');
            }
        });
        /**
         *
         * @param episodeId episode link or episode id
         */
        this.fetchEpisodeServers = (episodeId) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!episodeId.startsWith(this.baseUrl))
                    episodeId = `${this.baseUrl}/${episodeId}`;
                const res = yield axios_1.default.get(episodeId);
                const $ = (0, cheerio_1.load)(res.data);
                const servers = [];
                $('div.anime_video_body > div.anime_muti_link > ul > li').each((i, el) => {
                    let url = $(el).find('a').attr('data-video');
                    if (!(url === null || url === void 0 ? void 0 : url.startsWith('http')))
                        url = `https:${url}`;
                    servers.push({
                        name: $(el).find('a').text().replace('Choose this server', '').trim(),
                        url: url,
                    });
                });
                return servers;
            }
            catch (err) {
                throw new Error('Episode not found.');
            }
        });
        /**
         * @param page page number (optional)
         * @param type type of media. (optional) (default `1`) `1`: Japanese with subtitles, `2`: english/dub with no subtitles, `3`: chinese with english subtitles
         */
        this.fetchRecentEpisodes = (page = 1, type = 1) => __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield axios_1.default.get(`${this.ajaxUrl}/page-recent-release.html?page=${page}&type=${type}`);
                const $ = (0, cheerio_1.load)(res.data);
                const recentEpisodes = [];
                $('div.last_episodes.loaddub > ul > li').each((i, el) => {
                    var _a, _b, _c, _d;
                    recentEpisodes.push({
                        id: (_b = (_a = $(el).find('a').attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[1]) === null || _b === void 0 ? void 0 : _b.split('-episode')[0],
                        episodeId: (_c = $(el).find('a').attr('href')) === null || _c === void 0 ? void 0 : _c.split('/')[1],
                        episodeNumber: parseInt($(el).find('p.episode').text().replace('Episode ', '')),
                        title: $(el).find('p.name > a').attr('title'),
                        image: $(el).find('div > a > img').attr('src'),
                        url: `${this.baseUrl}${(_d = $(el).find('a').attr('href')) === null || _d === void 0 ? void 0 : _d.trim()}`,
                    });
                });
                const hasNextPage = !$('div.anime_name_pagination.intro > div > ul > li')
                    .last()
                    .hasClass('selected');
                return {
                    currentPage: page,
                    hasNextPage: hasNextPage,
                    results: recentEpisodes,
                };
            }
            catch (err) {
                throw new Error('Something went wrong. Please try again later.');
            }
        });
        this.fetchTopAiring = (page = 1) => __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield axios_1.default.get(`${this.ajaxUrl}/page-recent-release-ongoing.html?page=${page}`);
                const $ = (0, cheerio_1.load)(res.data);
                const topAiring = [];
                $('div.added_series_body.popular > ul > li').each((i, el) => {
                    var _a, _b;
                    topAiring.push({
                        id: (_a = $(el).find('a:nth-child(1)').attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[2],
                        title: $(el).find('a:nth-child(1)').attr('title'),
                        image: (_b = $(el)
                            .find('a:nth-child(1) > div')
                            .attr('style')) === null || _b === void 0 ? void 0 : _b.match('(https?://.*.(?:png|jpg))')[0],
                        url: `${this.baseUrl}${$(el).find('a:nth-child(1)').attr('href')}`,
                        genres: $(el)
                            .find('p.genres > a')
                            .map((i, el) => $(el).attr('title'))
                            .get(),
                    });
                });
                const hasNextPage = !$('div.anime_name.comedy > div > div > ul > li')
                    .last()
                    .hasClass('selected');
                return {
                    currentPage: page,
                    hasNextPage: hasNextPage,
                    results: topAiring,
                };
            }
            catch (err) {
                throw new Error('Something went wrong. Please try again later.');
            }
        });
    }
}
exports.default = Gogoanime;
//# sourceMappingURL=gogoanime.js.map