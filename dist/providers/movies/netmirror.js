"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../../models");
var NetMirrorOTT;
(function (NetMirrorOTT) {
    NetMirrorOTT["NETFLIX"] = "nf";
    NetMirrorOTT["PRIME"] = "pv";
    NetMirrorOTT["DISNEY"] = "dp";
    NetMirrorOTT["LIONSGATE"] = "lg";
})(NetMirrorOTT || (NetMirrorOTT = {}));
class NetMirror extends models_1.MovieParser {
    constructor() {
        super(...arguments);
        this.name = 'NetMirror';
        this.baseUrl = 'https://net20.cc';
        this.logo = 'https://net20.cc/img/nf2/icon_x192.png';
        this.classPath = 'MOVIES.NetMirror';
        this.supportedTypes = new Set([models_1.TvType.MOVIE, models_1.TvType.TVSERIES]);
        this.ott = NetMirrorOTT.NETFLIX;
        this.headers = {
            'X-Requested-With': 'XMLHttpRequest',
            Referer: `${this.baseUrl}/home`,
        };
        this.search = async (query, page = 1) => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/search.php?s=${encodeURIComponent(query)}&t=x`, {
                    headers: {
                        ...this.headers,
                        Cookie: this.getCookies(),
                    },
                });
                if (!data.searchResult || !Array.isArray(data.searchResult)) {
                    return { currentPage: page, hasNextPage: false, results: [] };
                }
                const results = data.searchResult.map(item => ({
                    id: item.id,
                    title: item.t,
                    image: `https://imgcdn.kim/poster/342/${item.id}.jpg`,
                    type: models_1.TvType.MOVIE,
                }));
                return {
                    currentPage: page,
                    hasNextPage: false,
                    results,
                };
            }
            catch (err) {
                throw new Error(`NetMirror search failed: ${err.message}`);
            }
        };
        this.fetchQuickInfo = async (id) => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/mini-modal-info.php?id=${id}&t=x`, {
                    headers: {
                        ...this.headers,
                        Cookie: this.getCookies(),
                    },
                });
                return data;
            }
            catch (err) {
                throw new Error(`NetMirror fetchQuickInfo failed: ${err.message}`);
            }
        };
        this.fetchMediaInfo = async (mediaId) => {
            var _a, _b;
            try {
                const quickInfo = await this.fetchQuickInfo(mediaId);
                const isTvShow = (_a = quickInfo.runtime) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('season');
                const movieInfo = {
                    id: mediaId,
                    title: '',
                    type: isTvShow ? models_1.TvType.TVSERIES : models_1.TvType.MOVIE,
                    image: `https://imgcdn.kim/poster/780/${mediaId}.jpg`,
                    cover: `https://imgcdn.kim/poster/1920/${mediaId}.jpg`,
                    genres: ((_b = quickInfo.genre) === null || _b === void 0 ? void 0 : _b.split(', ').map(g => g.trim())) || [],
                    duration: quickInfo.runtime,
                    rating: quickInfo.ua ? undefined : undefined,
                };
                if (isTvShow) {
                    movieInfo.episodes = [
                        {
                            id: mediaId,
                            title: 'Full Content',
                        },
                    ];
                }
                else {
                    movieInfo.episodes = [
                        {
                            id: mediaId,
                            title: 'Full Movie',
                        },
                    ];
                }
                return movieInfo;
            }
            catch (err) {
                throw new Error(`NetMirror fetchMediaInfo failed: ${err.message}`);
            }
        };
        this.fetchEpisodeServers = async (episodeId, mediaId) => {
            return [
                {
                    name: 'NetMirror',
                    url: `${this.baseUrl}/playlist.php?id=${episodeId}`,
                },
            ];
        };
        this.fetchEpisodeSources = async (episodeId, mediaId) => {
            var _a;
            try {
                const { data } = await this.client.get(`${this.baseUrl}/playlist.php?id=${episodeId}&t=Video&tm=${Date.now()}`, {
                    headers: {
                        ...this.headers,
                        Cookie: this.getCookies(),
                    },
                });
                if (!data || !Array.isArray(data) || data.length === 0) {
                    throw new Error('No playlist data received');
                }
                const playlist = data[0];
                if (!playlist.sources || !Array.isArray(playlist.sources)) {
                    throw new Error('No sources in playlist');
                }
                const sources = playlist.sources.map(s => {
                    let quality = '480p';
                    if (s.label === 'Full HD')
                        quality = '1080p';
                    else if (s.label === 'Mid HD')
                        quality = '720p';
                    else if (s.label === 'Low HD')
                        quality = '480p';
                    return {
                        url: `${this.baseUrl}${s.file}`,
                        quality,
                        isM3U8: true,
                    };
                });
                const subtitles = (_a = playlist.tracks) === null || _a === void 0 ? void 0 : _a.filter(t => t.kind === 'captions').map(t => ({
                    url: t.file.startsWith('//') ? `https:${t.file}` : t.file,
                    lang: t.label || t.language || 'Unknown',
                }));
                return {
                    headers: { Referer: `${this.baseUrl}/` },
                    sources,
                    subtitles,
                };
            }
            catch (err) {
                throw new Error(`NetMirror fetchEpisodeSources failed: ${err.message}`);
            }
        };
        this.fetchHlsPlaylist = async (episodeId) => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/hls/${episodeId}.m3u8?in=unknown::ni`, {
                    headers: {
                        ...this.headers,
                        Cookie: this.getCookies(),
                    },
                });
                return data;
            }
            catch (err) {
                throw new Error(`NetMirror fetchHlsPlaylist failed: ${err.message}`);
            }
        };
        this.fetchRecentMovies = async () => {
            try {
                const data = await this.search('new');
                return data.results;
            }
            catch (err) {
                throw new Error(`NetMirror fetchRecentMovies failed: ${err.message}`);
            }
        };
        this.fetchTrendingMovies = async () => {
            try {
                const data = await this.search('trending');
                return data.results;
            }
            catch (err) {
                throw new Error(`NetMirror fetchTrendingMovies failed: ${err.message}`);
            }
        };
    }
    setOTT(provider) {
        this.ott = provider;
    }
    getCookies() {
        return `user_token=consumets; ott=${this.ott}`;
    }
}
exports.default = NetMirror;
//# sourceMappingURL=netmirror.js.map