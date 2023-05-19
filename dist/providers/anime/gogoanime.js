"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const utils_1 = require("../../utils");
const extractors_1 = require("../../extractors");
class Gogoanime extends models_1.AnimeParser {
    constructor(proxyConfig) {
        super('https://www.gogoanime.dk', proxyConfig);
        this.name = 'Gogoanime';
        this.baseUrl = 'https://gogoanime.cl';
        this.logo = 'https://play-lh.googleusercontent.com/MaGEiAEhNHAJXcXKzqTNgxqRmhuKB1rCUgb15UrN_mWUNRnLpO5T1qja64oRasO7mn0';
        this.classPath = 'ANIME.Gogoanime';
        this.ajaxUrl = 'https://ajax.gogo-load.com/ajax';
        /**
         *
         * @param query search query string
         * @param page page number (default 1) (optional)
         */
        this.search = async (query, page = 1) => {
            const searchResult = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            try {
                const res = await this.client.get(`/search.html?keyword=${encodeURIComponent(query)}&page=${page}`);
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
        };
        /**
         *
         * @param id anime id
         */
        this.fetchAnimeInfo = async (id) => {
            if (!id.includes('gogoanime'))
                id = `/category/${id}`;
            const animeInfo = {
                id: '',
                title: '',
                url: `${this.baseUrl}${id}`,
                genres: [],
                totalEpisodes: 0,
            };
            try {
                const res = await this.client.get(id);
                const $ = (0, cheerio_1.load)(res.data);
                animeInfo.id = new URL(animeInfo.url).pathname.split('/')[2];
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
                animeInfo.subOrDub = animeInfo.title.toLowerCase().includes('dub') ? models_1.SubOrSub.DUB : models_1.SubOrSub.SUB;
                animeInfo.type = $('div.anime_info_body_bg > p:nth-child(4) > a')
                    .text()
                    .trim()
                    .toUpperCase();
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
                const html = await axios_1.default.get(`${this.ajaxUrl}/load-list-episode?ep_start=${ep_start}&ep_end=${ep_end}&id=${movie_id}&default_ep=${0}&alias=${alias}`);
                const $$ = (0, cheerio_1.load)(html.data);
                animeInfo.episodes = [];
                $$('#episode_related > li').each((i, el) => {
                    var _a, _b, _c;
                    (_a = animeInfo.episodes) === null || _a === void 0 ? void 0 : _a.push({
                        id: (_b = $(el).find('a').attr('href')) === null || _b === void 0 ? void 0 : _b.split('/')[1],
                        number: parseFloat($(el).find(`div.name`).text().replace('EP ', '')),
                        url: `${this.baseUrl}/${(_c = $(el).find(`a`).attr('href')) === null || _c === void 0 ? void 0 : _c.trim()}`,
                    });
                });
                animeInfo.episodes = animeInfo.episodes.reverse();
                animeInfo.totalEpisodes = parseInt(ep_end !== null && ep_end !== void 0 ? ep_end : '0');
                return animeInfo;
            }
            catch (err) {
                throw new Error(`failed to fetch anime info: ${err}`);
            }
        };
        /**
         *
         * @param episodeId episode id
         * @param server server type (default 'GogoCDN') (optional)
         */
        this.fetchEpisodeSources = async (episodeId, server = models_1.StreamingServers.VidStreaming) => {
            var _a;
            if (episodeId.startsWith('http')) {
                const serverUrl = new URL(episodeId);
                switch (server) {
                    case models_1.StreamingServers.GogoCDN:
                        return {
                            headers: { Referer: serverUrl.href },
                            sources: await new extractors_1.GogoCDN().extract(serverUrl),
                            download: `https://gogohd.net/download${serverUrl.search}`,
                        };
                    case models_1.StreamingServers.StreamSB:
                        return {
                            headers: { Referer: serverUrl.href, watchsb: 'streamsb', 'User-Agent': utils_1.USER_AGENT },
                            sources: await new extractors_1.StreamSB().extract(serverUrl),
                            download: `https://gogohd.net/download${serverUrl.search}`,
                        };
                    default:
                        return {
                            headers: { Referer: serverUrl.href },
                            sources: await new extractors_1.GogoCDN().extract(serverUrl),
                            download: `https://gogohd.net/download${serverUrl.search}`,
                        };
                }
            }
            try {
                const res = await this.client.get(`/${episodeId}`);
                const $ = (0, cheerio_1.load)(res.data);
                let serverUrl;
                switch (server) {
                    case models_1.StreamingServers.GogoCDN:
                        serverUrl = new URL(`${$('#load_anime > div > div > iframe').attr('src')}`);
                        break;
                    case models_1.StreamingServers.VidStreaming:
                        serverUrl = new URL(`${(_a = $('div.anime_video_body > div.anime_muti_link > ul > li.vidcdn > a')
                            .attr('data-video')) === null || _a === void 0 ? void 0 : _a.replace('.pro', '.net')}`);
                        break;
                    case models_1.StreamingServers.StreamSB:
                        serverUrl = new URL($('div.anime_video_body > div.anime_muti_link > ul > li.streamsb > a').attr('data-video'));
                        break;
                    default:
                        serverUrl = new URL(`${$('#load_anime > div > div > iframe').attr('src')}`);
                        break;
                }
                return await this.fetchEpisodeSources(serverUrl.href, server);
            }
            catch (err) {
                console.log(err);
                throw new Error('Episode not found.');
            }
        };
        /**
         *
         * @param episodeId episode link or episode id
         */
        this.fetchEpisodeServers = async (episodeId) => {
            try {
                if (!episodeId.startsWith(this.baseUrl))
                    episodeId = `/${episodeId}`;
                const res = await this.client.get(episodeId);
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
        };
        /**
         *
         * @param episodeId episode link or episode id
         */
        this.fetchAnimeIdFromEpisodeId = async (episodeId) => {
            try {
                if (!episodeId.startsWith(this.baseUrl))
                    episodeId = `/${episodeId}`;
                const res = await this.client.get(episodeId);
                const $ = (0, cheerio_1.load)(res.data);
                return $('#wrapper_bg > section > section.content_left > div:nth-child(1) > div.anime_video_body > div.anime_video_body_cate > div.anime-info > a').attr('href').split('/')[2];
            }
            catch (err) {
                throw new Error('Episode not found.');
            }
        };
        /**
         * @param page page number (optional)
         * @param type type of media. (optional) (default `1`) `1`: Japanese with subtitles, `2`: english/dub with no subtitles, `3`: chinese with english subtitles
         */
        this.fetchRecentEpisodes = async (page = 1, type = 1) => {
            try {
                const res = await axios_1.default.get(`${this.ajaxUrl}/page-recent-release.html?page=${page}&type=${type}`);
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
                const hasNextPage = !$('div.anime_name_pagination.intro > div > ul > li').last().hasClass('selected');
                return {
                    currentPage: page,
                    hasNextPage: hasNextPage,
                    results: recentEpisodes,
                };
            }
            catch (err) {
                throw new Error('Something went wrong. Please try again later.');
            }
        };
        this.fetchGenreInfo = async (genre, page = 1) => {
            try {
                const res = await this.client.get(`/genre/${genre}?page=${page}`);
                const $ = (0, cheerio_1.load)(res.data);
                const genreInfo = [];
                $('div.last_episodes > ul > li').each((i, elem) => {
                    var _a;
                    genreInfo.push({
                        id: (_a = $(elem).find('p.name > a').attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[2],
                        title: $(elem).find('p.name > a').attr('title'),
                        image: $(elem).find('div > a > img').attr('src'),
                        released: $(elem).find('p.released').text().replace('Released: ', '').trim(),
                        url: this.baseUrl + '/' + $(elem).find('p.name > a').attr('href'),
                    });
                });
                return {
                    currentPage: page,
                    results: genreInfo,
                };
            }
            catch (err) {
                throw new Error('Something went wrong. Please try again later.');
            }
        };
        this.fetchTopAiring = async (page = 1) => {
            try {
                const res = await axios_1.default.get(`${this.ajaxUrl}/page-recent-release-ongoing.html?page=${page}`);
                const $ = (0, cheerio_1.load)(res.data);
                const topAiring = [];
                $('div.added_series_body.popular > ul > li').each((i, el) => {
                    var _a, _b;
                    topAiring.push({
                        id: (_a = $(el).find('a:nth-child(1)').attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[2],
                        title: $(el).find('a:nth-child(1)').attr('title'),
                        image: (_b = $(el).find('a:nth-child(1) > div').attr('style')) === null || _b === void 0 ? void 0 : _b.match('(https?://.*.(?:png|jpg))')[0],
                        url: `${this.baseUrl}${$(el).find('a:nth-child(1)').attr('href')}`,
                        genres: $(el)
                            .find('p.genres > a')
                            .map((i, el) => $(el).attr('title'))
                            .get(),
                    });
                });
                const hasNextPage = !$('div.anime_name.comedy > div > div > ul > li').last().hasClass('selected');
                return {
                    currentPage: page,
                    hasNextPage: hasNextPage,
                    results: topAiring,
                };
            }
            catch (err) {
                throw new Error('Something went wrong. Please try again later.');
            }
        };
    }
}
// (async () => {
//   const gogo = new Gogoanime();
//   const search = await gogo.fetchEpisodeSources('jigokuraku-dub-episode-1');
//   console.log(search);
// })();
exports.default = Gogoanime;
//# sourceMappingURL=gogoanime.js.map