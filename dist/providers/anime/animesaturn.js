"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const utils_1 = require("../../utils");
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
            const data = await this.client.get(`${this.baseUrl}animelist?search=${query}`);
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
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const data = await this.client.get(`${this.baseUrl}anime/${id}`);
            const $ = await (0, cheerio_1.load)(data.data);
            const info = {
                id,
                title: $('div.container.anime-title-as> b').text(),
                malID: (_a = $('a[href^="https://myanimelist.net/anime/"]').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(30, -1),
                alID: (_b = $('a[href^="https://anilist.co/anime/"]').attr('href')) === null || _b === void 0 ? void 0 : _b.slice(25, -1),
                genres: (_d = (_c = $('div.container a.badge.badge-light')) === null || _c === void 0 ? void 0 : _c.map((i, element) => {
                    return $(element).text();
                }).toArray()) !== null && _d !== void 0 ? _d : undefined,
                image: ((_e = $('img.img-fluid')) === null || _e === void 0 ? void 0 : _e.attr('src')) || undefined,
                cover: ((_h = (_g = (_f = $('div.banner')) === null || _f === void 0 ? void 0 : _f.attr('style')) === null || _g === void 0 ? void 0 : _g.match(/background:\s*url\(['"]?([^'")]+)['"]?\)/i)) === null || _h === void 0 ? void 0 : _h[1]) || undefined,
                description: $('#full-trama').text(),
                episodes: [],
            };
            const episodes = [];
            $('.tab-pane.fade').each((i, element) => {
                $(element)
                    .find('.bottone-ep')
                    .each((i, element) => {
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
            const fakeData = await this.client.get(`${this.baseUrl}ep/${episodeId}`);
            const $2 = await (0, cheerio_1.load)(fakeData.data);
            const serverOneUrl = $2("div > a:contains('Streaming')").attr('href'); // scrape from server 1 (m3u8 and mp4 urls)
            if (serverOneUrl == null)
                throw new Error('Invalid url');
            let data = await this.client.get(serverOneUrl);
            let $ = await (0, cheerio_1.load)(data.data);
            const sources = {
                headers: {},
                subtitles: [],
                sources: [],
            };
            // M3U8 and MP4
            const scriptTag = $('script').filter(function () {
                return $(this).text().includes("jwplayer('player_hls')");
            });
            let serverOneSource;
            // m3u8
            scriptTag.each((i, element) => {
                const scriptText = $(element).text();
                scriptText.split('\n').forEach(line => {
                    if (line.includes('file:') && !serverOneSource) {
                        serverOneSource = line
                            .split('file:')[1]
                            .trim()
                            .replace(/'/g, '')
                            .replace(/,/g, '')
                            .replace(/"/g, '');
                    }
                });
            });
            // mp4
            if (!serverOneSource) {
                serverOneSource = $('#myvideo > source').attr('src');
            }
            if (!serverOneSource)
                throw new Error('Invalid source');
            sources.sources.push({
                url: serverOneSource,
                isM3U8: serverOneSource.includes('.m3u8'),
            });
            if (serverOneSource.includes('.m3u8')) {
                (_a = sources.subtitles) === null || _a === void 0 ? void 0 : _a.push({
                    url: serverOneSource.replace('playlist.m3u8', 'subtitles.vtt'),
                    lang: 'Spanish',
                });
            }
            // STREAMTAPE
            const serverTwoUrl = serverOneUrl + '&server=1'; // scrape from server 2 (streamtape)
            data = await this.client.get(serverTwoUrl);
            $ = await (0, cheerio_1.load)(data.data);
            const videoUrl = $('.embed-container > iframe').attr('src');
            const serverTwoSource = await new utils_1.StreamTape(this.proxyConfig, this.adapter).extract(new URL(videoUrl));
            if (!serverTwoSource)
                throw new Error('Invalid source');
            sources.sources.push({
                url: serverTwoSource[0].url,
                isM3U8: serverTwoSource[0].isM3U8,
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