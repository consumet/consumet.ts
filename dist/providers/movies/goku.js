"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const extractors_1 = require("../../extractors");
class Goku extends models_1.MovieParser {
    constructor() {
        super(...arguments);
        this.name = 'Goku';
        this.baseUrl = 'https://goku.sx';
        this.logo = 'https://img.goku.sx/xxrz/400x400/100/9c/e7/9ce7510639c4204bfe43904fad8f361f/9ce7510639c4204bfe43904fad8f361f.png';
        this.classPath = 'MOVIES.Goku';
        this.supportedTypes = new Set([models_1.TvType.MOVIE, models_1.TvType.TVSERIES]);
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
                const { data } = await this.client.get(`${this.baseUrl}/search?keyword=${query.replace(/[\W_]+/g, '-')}&page=${page}`);
                const $ = (0, cheerio_1.load)(data);
                searchResult.hasNextPage =
                    $('.page-link').length > 0 ? $('.page-link').last().attr('title') === 'Last' : false;
                $('div.section-items > div.item').each((i, el) => {
                    var _a, _b, _c, _d;
                    const releaseDate = $(el).find('div.movie-info div.info-split > div:nth-child(1)').text();
                    const rating = $(el).find('div.movie-info div.info-split div.is-rated').text();
                    searchResult.results.push({
                        id: (_b = (_a = $(el).find('.is-watch > a').attr('href')) === null || _a === void 0 ? void 0 : _a.replace('/', '')) !== null && _b !== void 0 ? _b : '',
                        title: $(el).find('div.movie-info h3.movie-name').text(),
                        url: `${this.baseUrl}${$(el).find('.is-watch > a').attr('href')}`,
                        image: $(el).find('div.movie-thumbnail > a > img').attr('src'),
                        releaseDate: isNaN(parseInt(releaseDate)) ? undefined : releaseDate,
                        rating: isNaN(parseInt(rating)) ? undefined : parseFloat(rating),
                        type: ((_d = (_c = $(el).find('.is-watch > a').attr('href')) === null || _c === void 0 ? void 0 : _c.indexOf('watch-series')) !== null && _d !== void 0 ? _d : -1 > -1)
                            ? models_1.TvType.TVSERIES
                            : models_1.TvType.MOVIE,
                    });
                });
                return searchResult;
                // const { data } = await this.client.get(
                //   `${this.baseUrl}/ajax/movie/search?keyword=${query.replace(/[\W_]+/g, '-')}&page=${page}`
                // );
                // const $ = load(data);
                // $('div.item').each((i, ele) => {
                //   const url = $(ele).find('a')?.attr('href');
                //   const releaseDate = $(ele).find('div.info-split > div:first-child').text();
                //   const rating = $(ele).find('.is-rated').text();
                //   searchResult.results.push({
                //     id: url?.replace(this.baseUrl, '') ?? '',
                //     title: $(ele).find('h3.movie-name').text(),
                //     releaseDate: isNaN(parseInt(releaseDate)) ? undefined : releaseDate,
                //     image: $(ele).find('div.movie-thumbnail > a > img').attr('src'),
                //     rating: isNaN(parseInt(rating)) ? undefined : parseFloat(rating),
                //     type: releaseDate.toLocaleLowerCase() !== 'tv' ? TvType.MOVIE : TvType.TVSERIES,
                //   });
                // });
                // return searchResult;
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
            if (mediaId.startsWith(this.baseUrl)) {
                mediaId = mediaId.replace(this.baseUrl + '/', '');
            }
            try {
                const { data } = await this.client.get(`${this.baseUrl}/${mediaId}`);
                const $ = (0, cheerio_1.load)(data);
                const mediaInfo = {
                    id: mediaId,
                    title: '',
                    url: `${this.baseUrl}/${mediaId}`,
                };
                mediaInfo.title = $('div.movie-detail > div.is-name > h3').text();
                mediaInfo.image = $('.movie-thumbnail > img').attr('src');
                mediaInfo.description = $('.is-description > .text-cut').text();
                mediaInfo.type = mediaId.indexOf('watch-series') > -1 ? models_1.TvType.TVSERIES : models_1.TvType.MOVIE;
                mediaInfo.genres = $("div.name:contains('Genres:')")
                    .siblings()
                    .find('a')
                    .map((i, el) => $(el).text())
                    .get();
                mediaInfo.casts = $("div.name:contains('Cast:')")
                    .siblings()
                    .find('a')
                    .map((i, el) => $(el).text())
                    .get();
                mediaInfo.production = $("div.name:contains('Production:')")
                    .siblings()
                    .find('a')
                    .map((i, el) => $(el).text())
                    .get()
                    .join();
                mediaInfo.duration = $("div.name:contains('Duration:')").siblings().text().split('\n').join('').trim();
                if (mediaInfo.type === models_1.TvType.TVSERIES) {
                    const { data } = await this.client.get(`${this.baseUrl}/ajax/movie/seasons/${mediaInfo.id.split('-').pop()}`);
                    const $$ = (0, cheerio_1.load)(data);
                    const seasonsIds = $$('.dropdown-menu > a')
                        .map((i, el) => {
                        const seasonsId = $(el).text().replace('Season', '').trim();
                        return {
                            id: $(el).attr('data-id'),
                            season: isNaN(parseInt(seasonsId)) ? undefined : parseInt(seasonsId),
                        };
                    })
                        .get();
                    mediaInfo.episodes = [];
                    for (const season of seasonsIds) {
                        const { data } = await this.client.get(`${this.baseUrl}/ajax/movie/season/episodes/${season.id}`);
                        const $$$ = (0, cheerio_1.load)(data);
                        $$$('.item')
                            .map((i, el) => {
                            var _a, _b, _c, _d, _e;
                            const episode = {
                                id: (_a = $$$(el).find('a').attr('data-id')) !== null && _a !== void 0 ? _a : '',
                                title: (_b = $$$(el).find('a').attr('title')) !== null && _b !== void 0 ? _b : '',
                                number: parseInt((_d = (_c = $$$(el).find('a').text()) === null || _c === void 0 ? void 0 : _c.split(':')[0].trim().substring(3)) !== null && _d !== void 0 ? _d : ''),
                                season: season.season,
                                url: $$$(el).find('a').attr('href'),
                            };
                            (_e = mediaInfo.episodes) === null || _e === void 0 ? void 0 : _e.push(episode);
                        })
                            .get();
                    }
                }
                else {
                    mediaInfo.episodes = [];
                    $('meta').map((i, ele) => {
                        var _a, _b, _c;
                        if ($(ele).attr('property') === 'og:url') {
                            const episode = {
                                id: (_b = (_a = $(ele).attr('content')) === null || _a === void 0 ? void 0 : _a.split('/').pop()) !== null && _b !== void 0 ? _b : '',
                                title: mediaInfo.title.toString(),
                                url: $(ele).attr('content'),
                            };
                            (_c = mediaInfo.episodes) === null || _c === void 0 ? void 0 : _c.push(episode);
                        }
                    });
                }
                return mediaInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         *
         * @param episodeId episode id
         * @param mediaId media id
         * @param server server type (default `VidCloud`) (optional)
         */
        this.fetchEpisodeSources = async (episodeId, mediaId, server = models_1.StreamingServers.UpCloud) => {
            if (episodeId.startsWith('http')) {
                const serverUrl = new URL(episodeId);
                switch (server) {
                    case models_1.StreamingServers.MixDrop:
                        return {
                            headers: { Referer: serverUrl.href },
                            sources: await new extractors_1.MixDrop(this.proxyConfig, this.adapter).extract(serverUrl),
                        };
                    case models_1.StreamingServers.VidCloud:
                        return Object.assign({ headers: { Referer: serverUrl.href } }, (await new extractors_1.VidCloud(this.proxyConfig, this.adapter).extract(serverUrl, true)));
                    case models_1.StreamingServers.UpCloud:
                        return Object.assign({ headers: { Referer: serverUrl.href } }, (await new extractors_1.VidCloud(this.proxyConfig, this.adapter).extract(serverUrl)));
                    default:
                        return {
                            headers: { Referer: serverUrl.href },
                            sources: await new extractors_1.MixDrop(this.proxyConfig, this.adapter).extract(serverUrl),
                        };
                }
            }
            try {
                const servers = await this.fetchEpisodeServers(episodeId, mediaId);
                const i = servers.findIndex(s => s.name.toLowerCase() === server.toLowerCase());
                if (i === -1) {
                    throw new Error(`Server ${server} not found`);
                }
                const serverUrl = new URL(servers.filter(s => s.name.toLowerCase() === server.toLowerCase())[0].url);
                return await this.fetchEpisodeSources(serverUrl.href, mediaId, server);
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         *
         * @param episodeId takes episode link or movie id
         * @param mediaId takes movie link or id (found on movie info object)
         */
        this.fetchEpisodeServers = async (episodeId, mediaId) => {
            try {
                const epsiodeServers = [];
                const { data } = await this.client.get(`${this.baseUrl}/ajax/movie/episode/servers/${episodeId}`);
                const $ = (0, cheerio_1.load)(data);
                const servers = $('.dropdown-menu > a')
                    .map((i, ele) => {
                    var _a;
                    return ({
                        name: $(ele).text(),
                        id: (_a = $(ele).attr('data-id')) !== null && _a !== void 0 ? _a : '',
                    });
                })
                    .get();
                for (const server of servers) {
                    const { data } = await this.client.get(`${this.baseUrl}/ajax/movie/episode/server/sources/${server.id}`);
                    epsiodeServers.push({
                        name: server.name,
                        url: data.data.link,
                    });
                }
                return epsiodeServers;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchRecentMovies = async () => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/home`);
                const $ = (0, cheerio_1.load)(data);
                const movies = $('.section-last')
                    .first()
                    .find('.item')
                    .map((i, ele) => {
                    var _a, _b, _c;
                    const releaseDate = $(ele).find('.info-split').children().first().text();
                    const movie = {
                        id: (_a = $(ele).find('.is-watch > a').attr('href')) === null || _a === void 0 ? void 0 : _a.replace('/', ''),
                        title: $(ele).find('.movie-name').text(),
                        url: `${this.baseUrl}${$(ele).find('.is-watch > a').attr('href')}`,
                        image: $(ele).find('.movie-thumbnail > a > img').attr('src'),
                        releaseDate: isNaN(parseInt(releaseDate)) ? undefined : releaseDate,
                        duration: $(ele).find('.info-split > div:nth-child(3)').text(),
                        type: ((_c = (_b = $(ele).find('.is-watch > a').attr('href')) === null || _b === void 0 ? void 0 : _b.indexOf('watch-movie')) !== null && _c !== void 0 ? _c : -1 > -1)
                            ? models_1.TvType.MOVIE
                            : models_1.TvType.TVSERIES,
                    };
                    return movie;
                })
                    .get();
                return movies;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchRecentTvShows = async () => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/home`);
                const $ = (0, cheerio_1.load)(data);
                const tvShowes = $('.section-last')
                    .last()
                    .find('.item')
                    .map((i, ele) => {
                    var _a, _b, _c;
                    const tvshow = {
                        id: (_a = $(ele).find('.is-watch > a').attr('href')) === null || _a === void 0 ? void 0 : _a.replace('/', ''),
                        title: $(ele).find('.movie-name').text(),
                        url: `${this.baseUrl}${$(ele).find('.is-watch > a').attr('href')}`,
                        image: $(ele).find('.movie-thumbnail > a > img').attr('src'),
                        season: $(ele)
                            .find('.info-split > div:nth-child(2)')
                            .text()
                            .split('/')[0]
                            .replace('SS ', '')
                            .trim(),
                        latestEpisode: $(ele)
                            .find('.info-split > div:nth-child(2)')
                            .text()
                            .split('/')[1]
                            .replace('EPS ', '')
                            .trim(),
                        type: ((_c = (_b = $(ele).find('.is-watch > a').attr('href')) === null || _b === void 0 ? void 0 : _b.indexOf('watch-series')) !== null && _c !== void 0 ? _c : -1 > -1)
                            ? models_1.TvType.TVSERIES
                            : models_1.TvType.MOVIE,
                    };
                    return tvshow;
                })
                    .get();
                return tvShowes;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchTrendingMovies = async () => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/home`);
                const $ = (0, cheerio_1.load)(data);
                const movies = $('#trending-movies')
                    .find('.item')
                    .map((i, ele) => {
                    var _a, _b, _c;
                    const releaseDate = $(ele).find('.info-split').children().first().text();
                    const movie = {
                        id: (_a = $(ele).find('.is-watch > a').attr('href')) === null || _a === void 0 ? void 0 : _a.replace('/', ''),
                        title: $(ele).find('.movie-name').text(),
                        url: `${this.baseUrl}${$(ele).find('.is-watch > a').attr('href')}`,
                        image: $(ele).find('.movie-thumbnail > a > img').attr('src'),
                        releaseDate: isNaN(parseInt(releaseDate)) ? undefined : releaseDate,
                        duration: $(ele).find('.info-split > div:nth-child(3)').text(),
                        type: ((_c = (_b = $(ele).find('.is-watch > a').attr('href')) === null || _b === void 0 ? void 0 : _b.indexOf('watch-movie')) !== null && _c !== void 0 ? _c : -1 > -1)
                            ? models_1.TvType.MOVIE
                            : models_1.TvType.TVSERIES,
                    };
                    return movie;
                })
                    .get();
                return movies;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchTrendingTvShows = async () => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/home`);
                const $ = (0, cheerio_1.load)(data);
                const tvShowes = $('#trending-series')
                    .find('.item')
                    .map((i, ele) => {
                    var _a, _b, _c;
                    const tvshow = {
                        id: (_a = $(ele).find('.is-watch > a').attr('href')) === null || _a === void 0 ? void 0 : _a.replace('/', ''),
                        title: $(ele).find('.movie-name').text(),
                        url: `${this.baseUrl}${$(ele).find('.is-watch > a').attr('href')}`,
                        image: $(ele).find('.movie-thumbnail > a > img').attr('src'),
                        season: $(ele)
                            .find('.info-split > div:nth-child(2)')
                            .text()
                            .split('/')[0]
                            .replace('SS ', '')
                            .trim(),
                        latestEpisode: $(ele)
                            .find('.info-split > div:nth-child(2)')
                            .text()
                            .split('/')[1]
                            .replace('EPS ', '')
                            .trim(),
                        type: ((_c = (_b = $(ele).find('.is-watch > a').attr('href')) === null || _b === void 0 ? void 0 : _b.indexOf('watch-series')) !== null && _c !== void 0 ? _c : -1 > -1)
                            ? models_1.TvType.TVSERIES
                            : models_1.TvType.MOVIE,
                    };
                    return tvshow;
                })
                    .get();
                return tvShowes;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
}
exports.default = Goku;
//# sourceMappingURL=goku.js.map