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
const form_data_1 = __importDefault(require("form-data"));
const models_1 = require("../../models");
const utils_1 = require("../../utils");
class AniMixPlay extends models_1.AnimeParser {
    constructor() {
        super(...arguments);
        this.name = 'AniMixPlay';
        this.baseUrl = 'https://animixplay.to';
        this.logo = 'https://www.apksforfree.com/wp-content/uploads/2021/10/oie_1413343NvdZCZR5.png';
        this.classPath = 'ANIME.AniMixPlay';
        this.searchUrl = 'https://cachecow.eu/api/search';
        /**
         *
         * @param query search query
         */
        this.search = (query) => __awaiter(this, void 0, void 0, function* () {
            const formData = new form_data_1.default();
            formData.append('qfast', query);
            formData.append('root', 'animixplay.to');
            const { data: { result }, } = yield axios_1.default.post(this.searchUrl, formData);
            const $ = (0, cheerio_1.load)(result);
            const results = [];
            $('a').each((i, el) => {
                const href = `${this.baseUrl}${$(el).attr('href')}`;
                const title = $(el).find('li > div.details > p.name').text();
                results.push({
                    id: href.split(this.baseUrl)[1],
                    title: title,
                    url: href,
                });
            });
            return { results };
        });
        /**
         *
         * @param id anime id
         * @param dub whether to get dub version of the anime
         */
        this.fetchAnimeInfo = (id, dub = false) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!id.startsWith('http'))
                id = `${this.baseUrl}${dub ? `${id}-dub` : id}`;
            const animeInfo = {
                id: id.split(this.baseUrl)[1],
                title: '',
            };
            try {
                const { data } = yield axios_1.default.get(id, {
                    headers: {
                        'User-Agent': utils_1.USER_AGENT,
                    },
                });
                const $ = (0, cheerio_1.load)(data);
                const epObj = JSON.parse($('div#epslistplace').text());
                animeInfo.title = $('#aligncenter > span.animetitle').text();
                animeInfo.genres = $('span#genres > span').text().split(', ');
                animeInfo.status = $('#status').text().split(': ')[1];
                animeInfo.totalEpisodes = parseInt(epObj.eptotal);
                animeInfo.episodes = [];
                if ($('div#epslistplace').text().startsWith('{')) {
                    const episodes = epObj;
                    delete episodes[Object.keys(episodes)[Object.keys(episodes).length - 1]];
                    for (const key in episodes) {
                        animeInfo.episodes.push({
                            id: (_a = episodes[key].toString()) === null || _a === void 0 ? void 0 : _a.match(/(?<=id=).*(?=&title)/g)[0],
                            number: parseInt(key) + 1,
                            url: `https:${episodes[key]}`,
                        });
                    }
                }
                return animeInfo;
            }
            catch (e) {
                throw new Error(e.message);
            }
        });
        /**
         *
         * @param episodeId episode id
         */
        this.fetchEpisodeSources = (episodeId) => __awaiter(this, void 0, void 0, function* () {
            if (!episodeId.startsWith('http'))
                episodeId = `https://goload.io/streaming.php?id=${episodeId}`;
            return {
                sources: yield new utils_1.GogoCDN().extract(new URL(episodeId)),
            };
        });
        /**
         * @deprecated Use fetchEpisodeSources instead
         */
        this.fetchEpisodeServers = (episodeIs) => {
            throw new Error('Method not implemented.');
        };
    }
}
exports.default = AniMixPlay;
//# sourceMappingURL=animxplay.js.map