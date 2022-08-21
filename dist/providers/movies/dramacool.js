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
const cheerio_1 = require("cheerio");
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../../models");
const utils_1 = require("../../utils");
class Dramacool extends models_1.MovieParser {
    constructor() {
        super(...arguments);
        this.name = 'Dramacool';
        this.baseUrl = 'https://www1.dramacool.ee';
        this.logo = 'https://editorialge.com/media/2021/12/Dramacool.jpg';
        this.classPath = 'MOVIES.Dramacool';
        this.supportedTypes = new Set([models_1.TvType.MOVIE, models_1.TvType.TVSERIES]);
        this.search = (query, page = 1) => __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
        this.fetchMediaInfo = (mediaId) => __awaiter(this, void 0, void 0, function* () {
            if (!mediaId.includes('drama-detail'))
                mediaId = `${this.baseUrl}/drama-detail/${mediaId}`;
            const mediaInfo = {
                id: '',
                title: '',
            };
            try {
                const { data } = yield axios_1.default.get(mediaId);
                const $ = (0, cheerio_1.load)(data);
                mediaInfo.id = mediaId.split('/').pop().split('.')[0];
                mediaInfo.title = $('.info > h1:nth-child(1)').text();
                mediaInfo.otherNames = $('.other_name > a')
                    .map((i, el) => $(el).text().trim())
                    .get();
                mediaInfo.episodes = [];
                $('div.content-left > div.block-tab > div > div > ul > li').each((i, el) => {
                    var _a, _b, _c;
                    (_a = mediaInfo.episodes) === null || _a === void 0 ? void 0 : _a.push({
                        id: (_b = $(el).find('a').attr('href')) === null || _b === void 0 ? void 0 : _b.split('.html')[0].slice(1),
                        title: $(el).find('h3').text().replace(mediaInfo.title.toString(), ''),
                        number: parseFloat((_c = $(el).find('a').attr('href')) === null || _c === void 0 ? void 0 : _c.split('-episode-')[1].split('.html')[0].split('-').join('.')),
                        releaseDate: $(el).find('span.time').text(),
                        url: `${this.baseUrl}${$(el).find('a').attr('href')}`,
                    });
                });
                return mediaInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        this.fetchEpisodeSources = (episodeId, server = models_1.StreamingServers.AsianLoad) => __awaiter(this, void 0, void 0, function* () {
            if (episodeId.startsWith('http')) {
                const serverUrl = new URL(episodeId);
                switch (server) {
                    case models_1.StreamingServers.AsianLoad:
                        return Object.assign({}, (yield new utils_1.AsianLoad().extract(serverUrl)));
                    case models_1.StreamingServers.MixDrop:
                        return {
                            sources: yield new utils_1.MixDrop().extract(serverUrl),
                        };
                    case models_1.StreamingServers.StreamTape:
                        return {
                            sources: yield new utils_1.StreamTape().extract(serverUrl),
                        };
                    case models_1.StreamingServers.StreamSB:
                        return {
                            sources: yield new utils_1.StreamSB().extract(serverUrl),
                        };
                    default:
                        throw new Error('Server not supported');
                }
            }
            if (!episodeId.includes('.html'))
                episodeId = `${this.baseUrl}/${episodeId}.html`;
            try {
                const { data } = yield axios_1.default.get(episodeId);
                const $ = (0, cheerio_1.load)(data);
                let serverUrl = '';
                switch (server) {
                    // asianload is the same as the standard server
                    case models_1.StreamingServers.AsianLoad:
                        serverUrl = `https:${$('.Standard').attr('data-video')}`;
                        if (!serverUrl.includes('dembed2'))
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
                return yield this.fetchEpisodeSources(serverUrl, server);
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        this.fetchEpisodeServers = (mediaLink, ...args) => __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const drama = new Dramacool();
    const mediaInfo = yield drama.fetchMediaInfo('vincenzo');
    console.log(mediaInfo);
    const sources = yield drama.fetchEpisodeSources(mediaInfo.episodes[20].id, models_1.StreamingServers.StreamSB);
    console.log(sources);
}))();
exports.default = Dramacool;
//# sourceMappingURL=dramacool.js.map