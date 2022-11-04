"use strict";
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
        this.search = async (query) => {
            const formData = new form_data_1.default();
            formData.append('qfast', query);
            formData.append('root', 'animixplay.to');
            const { data: { result }, } = await axios_1.default.post(this.searchUrl, formData);
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
        };
        /**
         *
         * @param id anime id
         * @param dub whether to get dub version of the anime
         */
        this.fetchAnimeInfo = async (id, dub = false) => {
            var _a;
            if (!id.startsWith('http'))
                id = `${this.baseUrl}${dub ? `${id}-dub` : id}`;
            const animeInfo = {
                id: id.split(this.baseUrl)[1],
                title: '',
            };
            try {
                const { data } = await axios_1.default.get(id, {
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
                            animixplayId: `${animeInfo.id}/ep${parseInt(key) + 1}`,
                            number: parseInt(key) + 1,
                            url: `${this.baseUrl}${animeInfo.id}/ep${parseInt(key) + 1}`,
                            gogoUrl: `https:${episodes[key]}`,
                        });
                    }
                }
                return animeInfo;
            }
            catch (e) {
                throw new Error(e.message);
            }
        };
        /**
         *
         * @param episodeId episode id
         */
        this.fetchEpisodeSources = async (episodeId) => {
            if (!episodeId.startsWith('http'))
                episodeId = 'https://gogohd.net/streaming.php?id=' + episodeId;
            // const { data } = await axios.get(this.baseUrl + episodeId);
            // console.log(data);
            // const iframe = data.match(/(?<=<iframe src=").*(?=")/g)![0];
            // console.log(iframe);
            return {
                sources: await new utils_1.GogoCDN().extract(new URL(episodeId)),
            };
        };
        /**
         * @deprecated Use fetchEpisodeSources instead
         */
        this.fetchEpisodeServers = (episodeIs) => {
            throw new Error('Method not implemented.');
        };
    }
}
// (async () => {
//   const animixplay = new AniMixPlay();
//   const animeInfo = await animixplay.fetchAnimeInfo('/v1/one-piece');
//   const sources = await animixplay.fetchEpisodeSources(animeInfo.episodes![0].id);
//   console.log(sources);
// })();
exports.default = AniMixPlay;
//# sourceMappingURL=animixplay.js.map