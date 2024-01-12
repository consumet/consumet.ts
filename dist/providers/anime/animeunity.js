"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
class AnimeUnity extends models_1.AnimeParser {
    constructor() {
        super(...arguments);
        this.name = 'AnimeUnity';
        this.baseUrl = 'https://www.animeunity.to';
        this.logo = 'https://www.animeunity.to/favicon-32x32.png';
        this.classPath = 'ANIME.AnimeUnity';
        /**
         * @param query Search query
         */
        this.search = async (query) => {
            var _a;
            try {
                const res = await this.client.get(`${this.baseUrl}/archivio?title=${query}`);
                const $ = (0, cheerio_1.load)(res.data);
                if (!$)
                    return { results: [] };
                const items = JSON.parse("" + $('archivio').attr('records') + "");
                const searchResult = {
                    hasNextPage: false,
                    results: [],
                };
                for (const i in items) {
                    searchResult.results.push({
                        id: `${items[i].id}-${items[i].slug}`,
                        title: (_a = items[i].title) !== null && _a !== void 0 ? _a : items[i].title_eng,
                        url: `${this.baseUrl}/anime/${items[i].id}-${items[i].slug}`,
                        image: `${items[i].imageurl}`,
                        cover: `${items[i].imageurl_cover}`,
                        subOrDub: `${items[i].dub
                            ? models_1.SubOrSub.DUB
                            : models_1.SubOrSub.SUB}`
                    });
                }
                return searchResult;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * @param id Anime id
         */
        this.fetchAnimeInfo = async (id) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
            const url = `${this.baseUrl}/anime/${id}`;
            try {
                const res = await this.client.get(url);
                const $ = (0, cheerio_1.load)(res.data);
                const animeInfo = {
                    id: id,
                    title: (_a = $('h1.title')) === null || _a === void 0 ? void 0 : _a.text().trim(),
                    url: url,
                    alID: (_e = (_d = (_c = (_b = $('.banner')) === null || _b === void 0 ? void 0 : _b.attr('style')) === null || _c === void 0 ? void 0 : _c.split('/')) === null || _d === void 0 ? void 0 : _d.pop()) === null || _e === void 0 ? void 0 : _e.split('-')[0],
                    genres: (_g = (_f = $('.info-wrapper.pt-3.pb-3 small')) === null || _f === void 0 ? void 0 : _f.map((i, element) => {
                        return $(element).text().replace(',', '').trim();
                    }).toArray()) !== null && _g !== void 0 ? _g : undefined,
                    totalEpisodes: parseInt((_j = (_h = $('video-player')) === null || _h === void 0 ? void 0 : _h.attr('episodes_count')) !== null && _j !== void 0 ? _j : '0'),
                    image: (_k = $('img.cover')) === null || _k === void 0 ? void 0 : _k.attr('src'),
                    // image: $('meta[property="og:image"]')?.attr('content'),
                    cover: (_m = (_l = $('.banner')) === null || _l === void 0 ? void 0 : _l.attr('src')) !== null && _m !== void 0 ? _m : (_p = (_o = $('.banner')) === null || _o === void 0 ? void 0 : _o.attr('style')) === null || _p === void 0 ? void 0 : _p.replace('background: url(', ''),
                    description: $('.description').text().trim(),
                    episodes: []
                };
                const items = JSON.parse("" + $('video-player').attr('episodes') + "");
                for (const i in items) {
                    (_q = animeInfo.episodes) === null || _q === void 0 ? void 0 : _q.push({
                        id: `${id}/${items[i].id}`,
                        number: parseInt(items[i].number),
                        url: `${url}/${items[i].id}`,
                    });
                }
                return animeInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         *
         * @param episodeId Episode id
         */
        this.fetchEpisodeSources = async (episodeId) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            try {
                const res = await this.client.get(`${this.baseUrl}/anime/${episodeId}`);
                const $ = (0, cheerio_1.load)(res.data);
                const episodeSources = {
                    sources: []
                };
                const streamUrl = $('video-player').attr('embed_url');
                if (streamUrl) {
                    const res = await this.client.get(streamUrl);
                    const $ = (0, cheerio_1.load)(res.data);
                    const domain = (_a = $('script:contains("window.video")').text()) === null || _a === void 0 ? void 0 : _a.match(/url: '(.*)'/)[1];
                    const token = (_b = $('script:contains("window.video")').text()) === null || _b === void 0 ? void 0 : _b.match(/token': '(.*)'/)[1];
                    const token360p = (_c = $('script:contains("window.video")').text()) === null || _c === void 0 ? void 0 : _c.match(/token360p': '(.*)'/)[1];
                    const token480p = (_d = $('script:contains("window.video")').text()) === null || _d === void 0 ? void 0 : _d.match(/token480p': '(.*)'/)[1];
                    const token720p = (_e = $('script:contains("window.video")').text()) === null || _e === void 0 ? void 0 : _e.match(/token720p': '(.*)'/)[1];
                    const token1080p = (_f = $('script:contains("window.video")').text()) === null || _f === void 0 ? void 0 : _f.match(/token1080p': '(.*)'/)[1];
                    const expires = (_g = $('script:contains("window.video")').text()) === null || _g === void 0 ? void 0 : _g.match(/expires': '(.*)'/)[1];
                    episodeSources.sources.push({
                        url: `${domain}?token=${token}&token360p=${token360p}&token480p=${token480p}&token720p=${token720p}&token1080p=${token1080p}&referer=&expires=${expires}`,
                        isM3U8: true
                    });
                    episodeSources.download = (_j = (_h = $('script:contains("window.downloadUrl ")').text()) === null || _h === void 0 ? void 0 : _h.match(/downloadUrl = '(.*)'/)[1]) === null || _j === void 0 ? void 0 : _j.toString();
                }
                return episodeSources;
            }
            catch (err) {
                throw new Error(err.message);
            }
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
exports.default = AnimeUnity;
//# sourceMappingURL=animeunity.js.map