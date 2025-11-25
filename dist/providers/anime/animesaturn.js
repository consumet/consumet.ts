"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
class AnimeSaturn extends models_1.AnimeParser {
    constructor() {
        super(...arguments);
        this.name = 'AnimeSaturn';
        this.baseUrl = 'https://www.animesaturn.cx/';
        this.logo = 'https://www.animesaturn.cx/immagini/favicon-32x32.png';
        this.classPath = 'ANIME.AnimeSaturn';
        /**
         * Search for anime
         * @param query Search query string
         * @returns Promise<ISearch<IAnimeResult>>
         */
        this.search = async (query) => {
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
         * Fetch anime information
         * @param id Anime ID/slug
         * @returns Promise<IAnimeInfo>
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
         * Fetch episode video sources
         * @param episodeId Episode ID
         * @returns Promise<ISource>
         */
        this.fetchEpisodeSources = async (episodeId) => {
            var _a;
            const episodeData = await this.client.get(`${this.baseUrl}ep/${episodeId}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0',
                    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    Referer: this.baseUrl,
                    Connection: 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'same-origin',
                    Priority: 'u=0, i',
                },
            });
            const $episode = await (0, cheerio_1.load)(episodeData.data);
            let watchUrl = $episode("a:contains('Guarda lo streaming')").attr('href');
            if (!watchUrl) {
                watchUrl = $episode("div:contains('Guarda lo streaming')").parent('a').attr('href');
            }
            if (!watchUrl) {
                watchUrl = $episode("a[href*='watch']").attr('href');
            }
            if (!watchUrl) {
                throw new Error('Watch URL not found');
            }
            const watchData = await this.client.get(watchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0',
                    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    Referer: `${this.baseUrl}ep/${episodeId}`,
                    Connection: 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'same-origin',
                    'Sec-Fetch-User': '?1',
                    Priority: 'u=0, i',
                },
            });
            const $watch = await (0, cheerio_1.load)(watchData.data);
            const sources = {
                headers: {
                    Referer: watchUrl,
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0',
                },
                subtitles: [],
                sources: [],
            };
            $watch('video source').each((i, element) => {
                const src = $watch(element).attr('src');
                if (src && (src.includes('.mp4') || src.includes('.m3u8'))) {
                    sources.sources.push({
                        url: src,
                        isM3U8: src.includes('.m3u8'),
                        quality: 'default',
                    });
                }
            });
            const videoSrc = $watch('video#myvideo').attr('src');
            if (videoSrc && (videoSrc.includes('.mp4') || videoSrc.includes('.m3u8'))) {
                if (!sources.sources.some(s => s.url === videoSrc)) {
                    sources.sources.push({
                        url: videoSrc,
                        isM3U8: videoSrc.includes('.m3u8'),
                        quality: 'default',
                    });
                }
            }
            $watch('script').each((i, element) => {
                const scriptText = $watch(element).text();
                if (scriptText.includes('jwplayer') || scriptText.includes('file:')) {
                    const lines = scriptText.split('\n');
                    for (const line of lines) {
                        if (line.includes('file:')) {
                            let url = line.split('file:')[1].trim().replace(/['"]/g, '').replace(/,/g, '').trim();
                            if (url && (url.includes('.mp4') || url.includes('.m3u8'))) {
                                if (!sources.sources.some(s => s.url === url)) {
                                    sources.sources.push({
                                        url: url,
                                        isM3U8: url.includes('.m3u8'),
                                        quality: 'default',
                                    });
                                }
                            }
                        }
                    }
                }
                const mp4Match = scriptText.match(/https?:\/\/[^"'\s]+\.mp4[^"'\s]*/g);
                if (mp4Match) {
                    mp4Match.forEach(url => {
                        if (!sources.sources.some(s => s.url === url)) {
                            sources.sources.push({
                                url: url,
                                isM3U8: false,
                                quality: 'default',
                            });
                        }
                    });
                }
                const m3u8Match = scriptText.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/g);
                if (m3u8Match) {
                    m3u8Match.forEach(url => {
                        if (!sources.sources.some(s => s.url === url)) {
                            sources.sources.push({
                                url: url,
                                isM3U8: true,
                                quality: 'default',
                            });
                        }
                    });
                }
            });
            if (sources.sources.length === 0) {
                throw new Error('No video sources found');
            }
            const m3u8Source = sources.sources.find(s => s.isM3U8);
            if (m3u8Source && m3u8Source.url.includes('playlist.m3u8')) {
                (_a = sources.subtitles) === null || _a === void 0 ? void 0 : _a.push({
                    url: m3u8Source.url.replace('playlist.m3u8', 'subtitles.vtt'),
                    lang: 'Italian',
                });
            }
            return sources;
        };
        /**
         * Fetch available episode servers
         * @param episodeId Episode ID
         * @returns Promise<IEpisodeServer[]>
         */
        this.fetchEpisodeServers = async (episodeId) => {
            const episodeData = await this.client.get(`${this.baseUrl}ep/${episodeId}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0',
                    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    Referer: this.baseUrl,
                    Connection: 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'same-origin',
                    Priority: 'u=0, i',
                },
            });
            const $episode = await (0, cheerio_1.load)(episodeData.data);
            const servers = [];
            const mainWatchUrl = $episode("a:contains('Guarda lo streaming')").attr('href');
            if (mainWatchUrl) {
                servers.push({
                    name: 'Server 1',
                    url: mainWatchUrl,
                });
            }
            if (mainWatchUrl) {
                const watchData = await this.client.get(mainWatchUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0',
                        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                        Referer: `${this.baseUrl}ep/${episodeId}`,
                        Connection: 'keep-alive',
                        'Upgrade-Insecure-Requests': '1',
                        'Sec-Fetch-Dest': 'document',
                        'Sec-Fetch-Mode': 'navigate',
                        'Sec-Fetch-Site': 'same-origin',
                        'Sec-Fetch-User': '?1',
                        Priority: 'u=0, i',
                    },
                });
                const $watch = await (0, cheerio_1.load)(watchData.data);
                $watch('.dropdown-menu .dropdown-item').each((i, element) => {
                    const serverUrl = $watch(element).attr('href');
                    const serverName = $watch(element).text().trim();
                    if (serverUrl && serverName && !servers.some(s => s.url === serverUrl)) {
                        servers.push({
                            name: serverName,
                            url: serverUrl,
                        });
                    }
                });
                const altPlayerUrl = $watch("a:contains('Player alternativo')").attr('href');
                if (altPlayerUrl && !servers.some(s => s.url === altPlayerUrl)) {
                    servers.push({
                        name: 'Player Alternativo',
                        url: altPlayerUrl,
                    });
                }
                $watch('iframe').each((i, element) => {
                    const src = $watch(element).attr('src');
                    if (src && (src.includes('streamtape') || src.includes('mixdrop') || src.includes('doodstream'))) {
                        const serverName = src.includes('streamtape')
                            ? 'StreamTape'
                            : src.includes('mixdrop')
                                ? 'MixDrop'
                                : src.includes('doodstream')
                                    ? 'DoodStream'
                                    : 'External Server';
                        if (!servers.some(s => s.url === src)) {
                            servers.push({
                                name: serverName,
                                url: src,
                            });
                        }
                    }
                });
            }
            return servers;
        };
    }
}
exports.default = AnimeSaturn;
//# sourceMappingURL=animesaturn.js.map