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
const models_1 = require("../../models");
const utils_1 = require("../../utils");
class Bilibili extends models_1.AnimeParser {
    constructor(cookie, locale) {
        super();
        this.name = 'Bilibili';
        this.baseUrl = 'https://bilibili.tv';
        this.logo = 'https://www.apksforfree.com/wp-content/uploads/2021/10/oie_1413343NvdZCZR5.png';
        this.classPath = 'ANIME.Bilibili';
        this.apiUrl = 'https://api.bilibili.tv/intl/gateway/web';
        this.cookie = '';
        this.locale = 'en_US';
        this.sgProxy = 'https://cors.proxy.consumet.org';
        this.locale = locale !== null && locale !== void 0 ? locale : this.locale;
        if (!cookie)
            return;
        this.cookie = cookie;
    }
    search(query) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios_1.default.get(`${this.sgProxy}/${this.apiUrl}/v2/search?keyword=${query}&platform=web&pn=1&ps=20&qid=&s_locale=${this.locale}`, { headers: { cookie: this.cookie } });
            if (!data.data.filter((item) => item.module.includes('ogv')).length)
                return { results: [], totalResults: 0 };
            const results = data.data.find((item) => item.module.includes('ogv'));
            return {
                totalResults: (_a = results.items.length) !== null && _a !== void 0 ? _a : 0,
                results: results.items.map((item) => ({
                    id: item.season_id,
                    title: item.title,
                    image: item.cover,
                    genres: item.styles.split(' / '),
                    rating: item.score,
                    view: item.view,
                })),
            };
        });
    }
    fetchAnimeInfo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = yield axios_1.default.get(`${this.sgProxy}/https://app.biliintl.com/intl/gateway/v2/ogv/view/app/season2?locale=${this.locale}&platform=android&season_id=${id}`, { headers: { cookie: this.cookie } });
                const episodes = data.data.sections.section.flatMap((section) => section.ep_details.map((ep, i) => ({
                    id: ep.episode_id.toString(),
                    number: i + 1,
                    title: ep.long_title || ep.title,
                    image: ep.horizontal_cover,
                })));
                return {
                    id,
                    title: data.data.title,
                    description: data.data.details.desc.value,
                    seasons: data.data.season_series.map((season) => ({
                        id: season.season_id,
                        title: season.title,
                    })),
                    recommendations: data.data.for_you.item_details.map((section) => ({
                        id: section.season_id,
                        title: section.title,
                        image: section.horizontal_cover,
                        genres: section.styles.split(' / '),
                        views: section.view,
                    })),
                    episodes: episodes,
                    totalEpisodes: episodes.length,
                };
            }
            catch (err) {
                throw err;
            }
        });
    }
    fetchEpisodeSources(episodeId, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = yield axios_1.default.get(`${this.sgProxy}/${this.apiUrl}/v2/subtitle?s_locale=${this.locale}&platform=web&episode_id=${episodeId}`, { headers: { cookie: this.cookie } });
                // const ss = await axios.get(
                //   `${this.sgProxy}/${this.apiUrl}/playurl?s_locale=${this.locale}&platform=web&ep_id=${episodeId}`,
                //   { headers: { cookie: this.cookie } }
                // );
                const sources = yield new utils_1.BilibiliExtractor().extract(episodeId);
                return {
                    sources: sources.sources,
                    subtitles: data.data.subtitles.map((sub) => ({
                        id: sub.subtitle_id,
                        lang: sub.lang,
                        url: `https://api.consumet.org/utils/bilibili/subtitle?url=${sub.url}`,
                    })),
                };
            }
            catch (err) {
                throw err;
            }
        });
    }
    fetchEpisodeServers(episodeId) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
}
// (async () => {
//   const source = new Bilibili();
//   const result = await source.search('classroom of the elite');
//   const info = await source.fetchAnimeInfo(result.results[0].id);
//   const episode = await source.fetchEpisodeSources(info.episodes![0].id);
//   console.log(episode);
// })();
exports.default = Bilibili;
//# sourceMappingURL=bilibili.js.map