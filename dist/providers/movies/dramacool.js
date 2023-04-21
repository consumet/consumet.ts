"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../../models");
const extractors_1 = require("../../extractors");
class DramaCool extends models_1.MovieParser {
    constructor() {
        super(...arguments);
        this.name = 'DramaCool';
        this.baseUrl = 'https://www1.dramacool.cr';
        this.logo = 'https://play-lh.googleusercontent.com/IaCb2JXII0OV611MQ-wSA8v_SAs9XF6E3TMDiuxGGXo4wp9bI60GtDASIqdERSTO5XU';
        this.classPath = 'MOVIES.DramaCool';
        this.supportedTypes = new Set([models_1.TvType.MOVIE, models_1.TvType.TVSERIES]);
        this.search = async (query, page = 1) => {
            const searchResult = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            try {
                const { data } = await axios_1.default.get(`${this.baseUrl}/search?keyword=${query.replace(/[\W_]+/g, '-')}&page=${page}`);
                const $ = (0, cheerio_1.load)(data);
                const navSelector = 'ul.pagination';
                searchResult.hasNextPage =
                    $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('selected') : false;
                $('div.block > div.tab-content > ul.list-episode-item > li').each((i, el) => {
                    var _a;
                    searchResult.results.push({
                        id: (_a = $(el).find('a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1),
                        title: $(el).find('a > h3').text(),
                        url: `${this.baseUrl}${$(el).find('a').attr('href')}`,
                        image: $(el).find('a > img').attr('data-original'),
                    });
                });
                return searchResult;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchMediaInfo = async (mediaId) => {
            const realMediaId = mediaId;
            if (!mediaId.startsWith(this.baseUrl))
                mediaId = `${this.baseUrl}/${mediaId}`;
            const mediaInfo = {
                id: '',
                title: '',
            };
            try {
                const { data } = await axios_1.default.get(mediaId);
                const $ = (0, cheerio_1.load)(data);
                mediaInfo.id = realMediaId;
                mediaInfo.title = $('.info > h1:nth-child(1)').text();
                mediaInfo.otherNames = $('.other_name > a')
                    .map((i, el) => $(el).text().trim())
                    .get();
                mediaInfo.image = $('div.details > div.img > img').attr('src');
                // get the 3rd p tag
                mediaInfo.description = $('div.details div.info p:nth-child(6)').text();
                mediaInfo.releaseDate = this.removeContainsFromString($('div.details div.info p:contains("Released:")').text(), 'Released');
                mediaInfo.episodes = [];
                $('div.content-left > div.block-tab > div > div > ul > li').each((i, el) => {
                    var _a, _b, _c;
                    (_a = mediaInfo.episodes) === null || _a === void 0 ? void 0 : _a.push({
                        id: (_b = $(el).find('a').attr('href')) === null || _b === void 0 ? void 0 : _b.split('.html')[0].slice(1),
                        title: $(el).find('h3').text().replace(mediaInfo.title.toString(), '').trim(),
                        episode: parseFloat((_c = $(el).find('a').attr('href')) === null || _c === void 0 ? void 0 : _c.split('-episode-')[1].split('.html')[0].split('-').join('.')),
                        releaseDate: $(el).find('span.time').text(),
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
        this.fetchEpisodeSources = async (episodeId, server = models_1.StreamingServers.AsianLoad) => {
            if (episodeId.startsWith('http')) {
                const serverUrl = new URL(episodeId);
                switch (server) {
                    case models_1.StreamingServers.AsianLoad:
                        return Object.assign({}, (await new extractors_1.AsianLoad().extract(serverUrl)));
                    case models_1.StreamingServers.MixDrop:
                        return {
                            sources: await new extractors_1.MixDrop().extract(serverUrl),
                        };
                    case models_1.StreamingServers.StreamTape:
                        return {
                            sources: await new extractors_1.StreamTape().extract(serverUrl),
                        };
                    case models_1.StreamingServers.StreamSB:
                        return {
                            sources: await new extractors_1.StreamSB().extract(serverUrl),
                        };
                    default:
                        throw new Error('Server not supported');
                }
            }
            if (!episodeId.includes('.html'))
                episodeId = `${this.baseUrl}/${episodeId}.html`;
            try {
                const { data } = await axios_1.default.get(episodeId);
                const $ = (0, cheerio_1.load)(data);
                let serverUrl = '';
                switch (server) {
                    // asianload is the same as the standard server
                    case models_1.StreamingServers.AsianLoad:
                        serverUrl = `https:${$('.Standard').attr('data-video')}`;
                        if (!serverUrl.includes('asian'))
                            throw new Error('Try another server');
                        break;
                    case models_1.StreamingServers.MixDrop:
                        serverUrl = $('.mixdrop').attr('data-video');
                        if (!serverUrl.includes('mixdrop'))
                            throw new Error('Try another server');
                        break;
                    case models_1.StreamingServers.StreamTape:
                        serverUrl = $('.streamtape').attr('data-video');
                        if (!serverUrl.includes('streamtape'))
                            throw new Error('Try another server');
                        break;
                    case models_1.StreamingServers.StreamSB:
                        serverUrl = $('.streamsb').attr('data-video');
                        if (!serverUrl.includes('stream'))
                            throw new Error('Try another server');
                        break;
                }
                return await this.fetchEpisodeSources(serverUrl, server);
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.removeContainsFromString = (str, contains) => {
            contains = contains.toLowerCase();
            return str.toLowerCase().replace(/\n/g, '').replace(`${contains}:`, '').trim();
        };
    }
    fetchEpisodeServers(episodeId, ...args) {
        throw new Error('Method not implemented.');
    }
}
// (async () => {
//   const drama = new Dramacool();
//   const search = await drama.search('vincenzo');
//   const mediaInfo = await drama.fetchMediaInfo(search.results[0].id);
//   // const sources = await drama.fetchEpisodeSources(mediaInfo.episodes![0].id);
//   console.log(mediaInfo);
// })();
exports.default = DramaCool;
//# sourceMappingURL=dramacool.js.map