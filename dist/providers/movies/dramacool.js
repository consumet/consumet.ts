"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../../models");
class Dramacool extends models_1.MovieParser {
    constructor() {
        super(...arguments);
        this.name = 'Dramacool';
        this.baseUrl = 'https://www1.dramacool.ee';
        this.logo = 'https://editorialge.com/media/2021/12/Dramacool.jpg';
        this.classPath = 'MOVIES.Dramacool';
        this.supportedTypes = new Set([models_1.TvType.MOVIE, models_1.TvType.TVSERIES]);
        this.search = async (query, page = 1) => {
            throw new Error('Method not implemented.');
        };
        this.fetchMediaInfo = async (mediaId) => {
            if (!mediaId.includes('drama-detail'))
                mediaId = `${this.baseUrl}/drama-detail/${mediaId}`;
            const mediaInfo = {
                id: '',
                title: '',
            };
            try {
                const { data } = await axios_1.default.get(mediaId);
                const $ = (0, cheerio_1.load)(data);
                mediaInfo.id = mediaId.split('/').pop().split('.')[0];
                mediaInfo.episodes = [];
                $('div.content-left > div.block-tab > div > div > ul > li').each((i, el) => {
                    var _a, _b, _c;
                    (_a = mediaInfo.episodes) === null || _a === void 0 ? void 0 : _a.push({
                        id: (_b = $(el).find('a').attr('href')) === null || _b === void 0 ? void 0 : _b.split('.html')[0].slice(1),
                        title: $(el).find('h3').text(),
                        number: parseFloat((_c = $(el).find('a').attr('href')) === null || _c === void 0 ? void 0 : _c.split('-episode-')[1].split('.html')[0]),
                        releaseDate: $(el).find('span.time').text(),
                        url: `${this.baseUrl}${$(el).find('a').attr('href')}`,
                    });
                });
                return mediaInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchEpisodeSources = async (episodeId, server = models_1.StreamingServers.GogoCDN) => {
            if (!episodeId.includes('.html'))
                episodeId = `${this.baseUrl}/${episodeId}.html`;
            try {
                const { data } = await axios_1.default.get(episodeId);
                return {
                    sources: [],
                };
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchEpisodeServers = async (mediaLink, ...args) => {
            throw new Error('Method not implemented.');
        };
    }
}
// (async () => {
//   const drama = new Dramacool();
//   const mediaInfo = await drama.fetchMediaInfo('vincenzo');
//   console.log(mediaInfo);
// })();
exports.default = Dramacool;
//# sourceMappingURL=dramacool.js.map