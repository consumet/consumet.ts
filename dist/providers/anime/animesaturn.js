"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
class AnimeSaturn extends models_1.AnimeParser {
    constructor() {
        super(...arguments);
        this.name = 'AnimeSaturn';
        this.baseUrl = 'https://www.animesaturn.tv/';
        this.logo = 'https://www.animesaturn.tv/immagini/favicon-32x32.png';
        this.classPath = 'ANIME.AnimeSaturn';
        /**
         * @param query Search query
         */
        this.search = async (query) => {
            // baseUrl/animelist?search={query}
            const data = await axios_1.default.get(`${this.baseUrl}animelist?search=${query}`);
            const $ = await (0, cheerio_1.load)(data.data);
            if (!$)
                return { results: [] };
            const res = {
                hasNextPage: false,
                results: [],
            };
            $('ul.list-group li').each((i, element) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                const item = {
                    id: (_e = (_d = (_c = (_b = (_a = $(element)) === null || _a === void 0 ? void 0 : _a.find('a.thumb')) === null || _b === void 0 ? void 0 : _b.attr('href')) === null || _c === void 0 ? void 0 : _c.split('/')) === null || _d === void 0 ? void 0 : _d.pop()) !== null && _e !== void 0 ? _e : '',
                    title: (_g = (_f = $(element)) === null || _f === void 0 ? void 0 : _f.find('h3 a')) === null || _g === void 0 ? void 0 : _g.text(),
                    image: (_j = (_h = $(element)) === null || _h === void 0 ? void 0 : _h.find('img.copertina-archivio')) === null || _j === void 0 ? void 0 : _j.attr('src'),
                    url: (_l = (_k = $(element)) === null || _k === void 0 ? void 0 : _k.find('h3 a')) === null || _l === void 0 ? void 0 : _l.attr('href'),
                };
                if (!item.id)
                    throw new Error('Invalid id');
                res.results.push(item);
            });
            return res;
        };
        /**
         * @param id Anime id
         */
        this.fetchAnimeInfo = async (id) => {
            var _a, _b, _c, _d, _e, _f;
            const data = await axios_1.default.get(`${this.baseUrl}anime/${id}`);
            const $ = await (0, cheerio_1.load)(data.data);
            const info = {
                id,
                title: $('div.container.anime-title-as> b').text(),
                genres: (_b = (_a = $('div.container a.badge.badge-light')) === null || _a === void 0 ? void 0 : _a.map((i, element) => {
                    return $(element).text();
                }).toArray()) !== null && _b !== void 0 ? _b : undefined,
                image: ((_c = $('img.img-fluid')) === null || _c === void 0 ? void 0 : _c.attr('src')) || undefined,
                cover: ((_f = (_e = (_d = $('div.banner')) === null || _d === void 0 ? void 0 : _d.attr('style')) === null || _e === void 0 ? void 0 : _e.match(/background:\s*url\(['"]?([^'")]+)['"]?\)/i)) === null || _f === void 0 ? void 0 : _f[1]) || undefined,
                description: $('#full-trama').text(),
                episodes: [],
            };
            const episodes = [];
            $('.tab-pane.fade').each((i, element) => {
                $(element).find('.bottone-ep').each((i, element) => {
                    var _a, _b;
                    const link = $(element).attr('href');
                    const episodeNumber = $(element).text().trim().replace('Episodio ', '').trim();
                    episodes.push({
                        number: parseInt(episodeNumber),
                        id: (_b = (_a = link === null || link === void 0 ? void 0 : link.split('/')) === null || _a === void 0 ? void 0 : _a.pop()) !== null && _b !== void 0 ? _b : '',
                    });
                });
            });
            info.episodes = episodes.sort((a, b) => a.number - b.number);
            return info;
        };
        /**
         *
         * @param episodeId Episode id
         */
        this.fetchEpisodeSources = async (episodeId) => {
            var _a;
            const fakeData = await axios_1.default.get(`${this.baseUrl}ep/${episodeId}`);
            const $2 = await (0, cheerio_1.load)(fakeData.data);
            const newUrl = $2("div > a:contains('Streaming')").attr('href');
            if (newUrl == null)
                throw new Error('Invalid url');
            const data = await axios_1.default.get(newUrl);
            const $ = await (0, cheerio_1.load)(data.data);
            const sources = {
                headers: {},
                subtitles: [],
                sources: [],
            };
            const scriptTag = $('script').filter(function () {
                return $(this).text().includes('jwplayer(\'player_hls\')');
            });
            let getOneSource;
            scriptTag.each((i, element) => {
                const scriptText = $(element).text();
                scriptText.split("\n").forEach((line) => {
                    if (line.includes('file:') && !getOneSource) {
                        getOneSource = line.split('file:')[1].trim().replace(/'/g, '').replace(/,/g, '').replace(/"/g, '');
                    }
                });
            });
            if (!getOneSource)
                throw new Error('Invalid source');
            sources.sources.push({
                url: getOneSource,
                isM3U8: getOneSource.includes('.m3u8'),
            });
            (_a = sources.subtitles) === null || _a === void 0 ? void 0 : _a.push({
                url: getOneSource.replace("playlist.m3u8", "subtitles.vtt"),
                lang: 'Spanish'
            });
            return sources;
        };
        /**
         *
         * @param episodeId Episode id
         */
        this.fetchEpisodeServers = (episodeId) => {
            throw new Error('Method not implemented.');
        };
    }
}
exports.default = AnimeSaturn;
// Test this dog code
// const animeSaturn = new AnimeSaturn();
/*animeSaturn.search('naruto').then((res) => {
console.log(res);

  animeSaturn.fetchAnimeInfo(res.results[0].id).then((res) => {
    console.log(res);

    animeSaturn.fetchEpisodeSources(res?.episodes?.at(0)?.id || "0").then((res) => {
      console.log(res);
    })
  });
});*/
//# sourceMappingURL=animesaturn.js.map