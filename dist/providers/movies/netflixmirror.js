"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../../models");
class NetflixMirror extends models_1.MovieParser {
    constructor(customBaseURL) {
        super(...arguments);
        this.name = 'NetflixMirror';
        this.baseUrl = 'https://netfree2.cc';
        this.logo = 'https://netfree2.cc//mobile/img/nf2/icon_x192.png';
        this.classPath = 'MOVIES.NetflixMirror';
        this.supportedTypes = new Set([models_1.TvType.MOVIE, models_1.TvType.TVSERIES]);
        this.nfCookie = 'hd=on;';
        /**
         *
         * @param query search query string
         * @param page page number (default 1) (optional)
         */
        this.search = async (query, page = 1) => {
            const searchResult = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            try {
                const { data } = await this.client.get(`https://netmirror.8man.me/api/net-proxy?isPrime=false&url=${this.baseUrl}/mobile/search.php?s=${encodeURI(query)}`, {
                    headers: this.Headers(),
                });
                const basicResults = data.searchResult || [];
                if (basicResults.length === 0) {
                    return searchResult;
                }
                const detailedResults = await Promise.all(basicResults.map(async (item) => {
                    var _a, _b;
                    try {
                        // Fetch additional details for each item
                        const detailResponse = await this.client.get(`https://netmirror.8man.me/api/net-proxy?isPrime=false&url=${this.baseUrl}/mobile/post.php?id=${item.id}`, {
                            headers: this.Headers(),
                        });
                        return {
                            id: item.id,
                            title: item.t,
                            image: `https://imgcdn.media/poster/v/${item.id}.jpg`,
                            type: detailResponse.data.type === 't' ? models_1.TvType.TVSERIES : models_1.TvType.MOVIE,
                            releaseDate: detailResponse.data.year,
                            seasons: (_b = (_a = detailResponse.data.season) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : undefined,
                        };
                    }
                    catch (error) {
                        // If we can't fetch details, just return the basic info
                        console.error(`Error fetching details for ${item.id}:`, error);
                        return {
                            id: item.id,
                            title: item.t,
                            image: `https://imgcdn.media/poster/v/${item.id}.jpg`,
                        };
                    }
                }));
                searchResult.results = detailedResults;
                return searchResult;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         *
         * @param mediaId media link or id
         */
        this.fetchMediaInfo = async (mediaId) => {
            var _a, _b, _c, _d;
            const movieInfo = {
                id: mediaId,
                title: '',
            };
            try {
                const { data } = await this.client.get(`https://netmirror.8man.me/api/net-proxy?isPrime=false&url=${this.baseUrl}/mobile/post.php?id=${mediaId}`, {
                    headers: this.Headers(),
                });
                movieInfo.cover = `https://imgcdn.media/poster/h/${mediaId}.jpg`;
                movieInfo.title = data.title;
                movieInfo.image = `https://imgcdn.media/poster/v/${mediaId}.jpg`;
                movieInfo.description = (_b = (_a = data.desc) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : '';
                movieInfo.type = data.type === 't' ? models_1.TvType.TVSERIES : models_1.TvType.MOVIE;
                movieInfo.releaseDate = data.year;
                movieInfo.genres = (_d = (_c = data.genre) === null || _c === void 0 ? void 0 : _c.split(',').map((genre) => genre === null || genre === void 0 ? void 0 : genre.trim())) !== null && _d !== void 0 ? _d : [];
                movieInfo.duration = data.runtime;
                if (movieInfo.type === models_1.TvType.TVSERIES) {
                    movieInfo.episodes = await this.fetchAllEpisodesOrdered(data.season, mediaId);
                }
                else {
                    movieInfo.episodes = [
                        {
                            id: mediaId,
                            title: data.title,
                            image: movieInfo.cover || movieInfo.image,
                        },
                    ];
                }
                return movieInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         *
         * @param episodeId episode id
         * @param media media id
         */
        this.fetchEpisodeSources = async (episodeId, mediaId //just placeholder for compatibility with tmdb
        ) => {
            var _a, _b;
            try {
                if (!this.nfCookie) {
                    await this.initCookie();
                }
                const { data } = await this.client.get(`https://netmirror.8man.me/api/net-proxy?isPrime=false&url=${this.baseUrl}/mobile/playlist.php?id=${episodeId}`, {
                    headers: this.Headers(),
                });
                const sources = {
                    sources: [],
                    subtitles: [],
                };
                (_a = data[0].sources) === null || _a === void 0 ? void 0 : _a.map((source) => {
                    var _a;
                    sources.sources.push({
                        url: `${this.baseUrl}${source.file.replace(/%3A%3Asu/g, '%3A%3Ani').replace(/::su/g, '::ni')}`,
                        quality: source.label === 'Auto' ? source.label.toLowerCase() : (_a = source.file.match(/[?&]q=([^&]+)/)) === null || _a === void 0 ? void 0 : _a[1],
                        isM3U8: source.file.includes('.m3u8'),
                    });
                });
                (_b = data[0].tracks) === null || _b === void 0 ? void 0 : _b.map((subtitle) => {
                    sources.subtitles = sources.subtitles || [];
                    sources.subtitles.push({
                        url: `https:${subtitle.file}`,
                        lang: subtitle.label,
                    });
                });
                return sources;
            }
            catch (error) {
                throw new Error(error.message);
            }
        };
        /**
         * @deprecated method not implemented
         * @param episodeId takes episode link or movie id
         */
        this.fetchEpisodeServers = async (episodeId) => {
            throw new Error('Method not implemented.');
        };
        if (customBaseURL) {
            if (customBaseURL.startsWith('http://') || customBaseURL.startsWith('https://')) {
                this.baseUrl = customBaseURL;
            }
            else {
                this.baseUrl = `http://${customBaseURL}`;
            }
        }
        else {
            this.baseUrl = this.baseUrl;
        }
        this.initCookie();
    }
    async initCookie() {
        try {
            const { data } = await this.client.get('https://raw.githubusercontent.com/2004durgesh/nfmirror-cookies/refs/heads/main/captured-cookies.json');
            for (const cookie of data.cookiesByDomain['.netfree2.cc']) {
                this.nfCookie += `${cookie.name}=${cookie.value.replace('%3A%3Asu', '%3A%3Ani')};`;
            }
        }
        catch (err) {
            console.error('Failed to get cookie:', err);
        }
    }
    Headers() {
        const headers = {
            authority: 'netfree2.cc',
            accept: 'application/json, text/javascript, */*; q=0.01',
            'sec-ch-ua': '"Not A(Brand";v="99", "Microsoft Edge";v="121", "Chromium";v="121"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'x-requested-with': 'XMLHttpRequest',
            Referer: `${this.baseUrl}/mobile/home`,
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        };
        if (this.nfCookie) {
            headers.Cookie = this.nfCookie || '';
        }
        return headers;
    }
    async fetchAllEpisodesForSeason(seasonId, seriesId) {
        var _a;
        let page = 1;
        let episodes = [];
        while (true) {
            const url = `https://netfree2.cc/mobile/episodes.php?s=${seasonId}&series=${seriesId}&page=${page}`;
            const { data } = await this.client.get(url);
            if ((_a = data.episodes) === null || _a === void 0 ? void 0 : _a.length) {
                episodes.push(...data.episodes.map((episode) => ({
                    id: episode.id,
                    title: episode.t,
                    season: parseInt(String(episode.s).replace('S', '')),
                    number: parseInt(String(episode.ep).replace('E', '')),
                    image: `https://imgcdn.media/epimg/150/${episode.id}.jpg`,
                })));
            }
            if (data.nextPageShow !== 1)
                break; // no more pages
            page++;
        }
        return episodes;
    }
    async fetchAllEpisodesOrdered(seasons, seriesId) {
        const allEpisodes = [];
        for (const season of seasons.sort((a, b) => Number(a.s) - Number(b.s))) {
            const seasonEpisodes = await this.fetchAllEpisodesForSeason(season.id, seriesId);
            allEpisodes.push(...seasonEpisodes);
        }
        return allEpisodes;
    }
}
// (async () => {
//   const movie = new NetflixMirror();
//   const search = await movie.search('one');
//   // const movieInfo = await movie.fetchMediaInfo(search.results[0]?.id);
//   // const sources = await movie.fetchEpisodeSources(movieInfo.episodes![0]?.id);
//   //   const server = await movie.fetchEpisodeServers(search.results[0]?.id);
//   // const recentTv = await movie.fetchPopular();
//   // const genre = await movie.fetchByGenre('action');
//   console.log(search);
// })();
exports.default = NetflixMirror;
//# sourceMappingURL=netflixmirror.js.map