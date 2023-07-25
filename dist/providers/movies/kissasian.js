"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const extractors_1 = require("../../extractors");
class KissAsian extends models_1.MovieParser {
    constructor() {
        super(...arguments);
        this.name = 'KissAsian';
        this.baseUrl = 'https://kissasian.mx';
        this.logo = 'https://kissasian.mx/Content/images/logo.png';
        this.classPath = 'MOVIES.KissAsian';
        this.supportedTypes = new Set([models_1.TvType.MOVIE, models_1.TvType.TVSERIES]);
        this.search = async (query, page = 1) => {
            try {
                const searchResult = {
                    currentPage: page,
                    hasNextPage: false,
                    results: [],
                };
                const response = await this.client.post(`${this.baseUrl}/Search/Drama`, `keyword=${query.replace(/[\W_]+/g, '-')}`, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });
                const $ = (0, cheerio_1.load)(response.data);
                $('div.item-list > div.list').each((i, el) => {
                    var _a;
                    searchResult.results.push({
                        id: (_a = $(el).find('div.info > p > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1),
                        title: $(el).find('div.info > p > a').text().trim(),
                        url: `${this.baseUrl}${$(el).find('div.info > p > a').attr('href')}`,
                        image: `${this.baseUrl}${$(el).find('div.cover > a > img').attr('src')}`,
                    });
                });
                if (searchResult.results.length === 0) {
                    searchResult.results.push({
                        id: response.request.res.responseUrl.replace(/https?:\/\/[^\/]*\/?/i, ''),
                        title: $('div.content').first().find('div.heading > h3').text().trim(),
                        url: response.request.res.responseUrl,
                        image: `${this.baseUrl}${$('div.content').first().find('div.cover > img').attr('src')}`,
                    });
                }
                return searchResult;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchMediaInfo = async (mediaId) => {
            var _a, _b;
            try {
                const realMediaId = mediaId;
                if (!mediaId.startsWith(this.baseUrl))
                    mediaId = `${this.baseUrl}/${mediaId}`;
                const mediaInfo = {
                    id: '',
                    title: '',
                };
                const { data } = await this.client.post(mediaId, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });
                const $ = (0, cheerio_1.load)(data);
                mediaInfo.id = realMediaId;
                mediaInfo.title = $('div.content').first().find('div.heading > h3').text().trim();
                mediaInfo.image = `${this.baseUrl}${$('div.content').first().find('div.cover > img').attr('src')}`;
                mediaInfo.otherNames = $('span:contains(Other name:)')
                    .siblings()
                    .map((i, el) => $(el).text().trim())
                    .get();
                mediaInfo.description = $('div.summary1 > p').text().trim();
                mediaInfo.releaseDate = (_a = $('span:contains(Date aired:)')
                    .parent()
                    .text()
                    .split('Date aired:')
                    .pop()) === null || _a === void 0 ? void 0 : _a.replace(/\t/g, '').replace(/\n/g, '').trim();
                mediaInfo.genre = $('span:contains(Genres:)')
                    .siblings('a')
                    .map((i, el) => $(el).text().trim())
                    .get();
                mediaInfo.country = $('span:contains(Country:)').siblings('a').text().trim();
                switch ((_b = $('span:contains(Status:)').parent().text().split('Status:').pop()) === null || _b === void 0 ? void 0 : _b.trim()) {
                    case 'Ongoing':
                        mediaInfo.status = models_1.MediaStatus.ONGOING;
                        break;
                    case 'Completed':
                        mediaInfo.status = models_1.MediaStatus.COMPLETED;
                        break;
                    case 'Cancelled':
                        mediaInfo.status = models_1.MediaStatus.CANCELLED;
                        break;
                    case 'Unknown':
                        mediaInfo.status = models_1.MediaStatus.UNKNOWN;
                        break;
                    default:
                        mediaInfo.status = models_1.MediaStatus.UNKNOWN;
                        break;
                }
                mediaInfo.episodes = [];
                $('ul.list li.episodeSub').each((i, el) => {
                    var _a, _b, _c, _d;
                    (_a = mediaInfo.episodes) === null || _a === void 0 ? void 0 : _a.push({
                        id: (_b = $(el).find('a').attr('href')) === null || _b === void 0 ? void 0 : _b.slice(1),
                        title: $(el).find('a').text().trim(),
                        episode: (_d = (_c = $(el).find('a').text()) === null || _c === void 0 ? void 0 : _c.split('Episode').pop()) === null || _d === void 0 ? void 0 : _d.trim(),
                        url: `${this.baseUrl}${$(el).find('a').attr('href')}`,
                    });
                });
                mediaInfo.episodes.reverse();
                return mediaInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchEpisodeSources = async (episodeId, server = models_1.StreamingServers.Mp4Upload) => {
            if (episodeId.startsWith('http')) {
                const serverUrl = new URL(episodeId);
                switch (server) {
                    case models_1.StreamingServers.VidMoly:
                        return {
                            sources: await new extractors_1.VidMoly(this.proxyConfig, this.adapter).extract(serverUrl),
                        };
                    case models_1.StreamingServers.StreamWish:
                        return {
                            sources: await new extractors_1.StreamWish(this.proxyConfig, this.adapter).extract(serverUrl),
                        };
                    case models_1.StreamingServers.Mp4Upload:
                        return {
                            sources: await new extractors_1.Mp4Upload(this.proxyConfig, this.adapter).extract(serverUrl),
                        };
                    default:
                        throw new Error('Server not supported');
                }
            }
            try {
                const servers = await this.fetchEpisodeServers(episodeId);
                const i = servers.findIndex(s => s.name.toLowerCase() === server.toLowerCase());
                if (i === -1) {
                    throw new Error(`Server ${server} not found`);
                }
                const serverUrl = new URL(servers.filter(s => s.name.toLowerCase() === server.toLowerCase())[0].url);
                return await this.fetchEpisodeSources(serverUrl.href, server);
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
    async fetchEpisodeServers(episodeId) {
        try {
            const episodeServers = [];
            const { data } = await this.client.post(`${this.baseUrl}/${episodeId}`, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            const $ = (0, cheerio_1.load)(data);
            episodeServers.push({
                name: $('ul.mirrorTab > li > a.actived').text().trim(),
                url: $('iframe#mVideo').attr('src'),
            });
            await Promise.all($('ul.mirrorTab > li > a.ign').map(async (i, ele) => {
                const { data } = await this.client.post(`${this.baseUrl}${$(ele).attr('href')}`, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });
                const $$ = (0, cheerio_1.load)(data);
                if ($$('ul.mirrorTab > li > a.actived').text().trim()) {
                    const url = $$('iframe#mVideo').attr('src');
                    episodeServers.push({
                        name: $$('ul.mirrorTab > li > a.actived').text().trim(),
                        url: url.startsWith('https') ? url : url.replace('//', 'https://'),
                    });
                }
            }));
            episodeServers.map(element => {
                switch (element.name) {
                    case 'VM':
                        element.name = models_1.StreamingServers.VidMoly;
                        break;
                    case 'SW':
                        element.name = models_1.StreamingServers.StreamWish;
                        break;
                    case 'MP':
                        element.name = models_1.StreamingServers.Mp4Upload;
                        break;
                    default:
                        break;
                }
            });
            return episodeServers;
        }
        catch (err) {
            throw new Error(err.message);
        }
    }
}
exports.default = KissAsian;
//# sourceMappingURL=kissasian.js.map