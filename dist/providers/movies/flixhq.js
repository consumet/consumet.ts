"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const extractors_1 = require("../../extractors");
class FlixHQ extends models_1.MovieParser {
    constructor() {
        super(...arguments);
        this.name = 'FlixHQ';
        this.baseUrl = 'https://flixhq.to';
        this.logo = 'https://upload.wikimedia.org/wikipedia/commons/7/7a/MyAnimeList_Logo.png';
        this.classPath = 'MOVIES.FlixHQ';
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
                const { data } = await this.client.get(`${this.baseUrl}/search/${query.replace(/[\W_]+/g, '-')}?page=${page}`);
                const $ = (0, cheerio_1.load)(data);
                const navSelector = 'div.pre-pagination:nth-child(3) > nav:nth-child(1) > ul:nth-child(1)';
                searchResult.hasNextPage =
                    $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;
                $('.film_list-wrap > div.flw-item').each((i, el) => {
                    var _a;
                    const releaseDate = $(el).find('div.film-detail > div.fd-infor > span:nth-child(1)').text();
                    searchResult.results.push({
                        id: (_a = $(el).find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1),
                        title: $(el).find('div.film-detail > h2 > a').attr('title'),
                        url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
                        image: $(el).find('div.film-poster > img').attr('data-src'),
                        releaseDate: isNaN(parseInt(releaseDate)) ? undefined : releaseDate,
                        seasons: releaseDate.includes('SS') ? parseInt(releaseDate.split('SS')[1]) : undefined,
                        type: $(el).find('div.film-detail > div.fd-infor > span.float-right').text() === 'Movie'
                            ? models_1.TvType.MOVIE
                            : models_1.TvType.TVSERIES,
                    });
                });
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
            var _a;
            if (!mediaId.startsWith(this.baseUrl)) {
                mediaId = `${this.baseUrl}/${mediaId}`;
            }
            const movieInfo = {
                id: mediaId.split('to/').pop(),
                title: '',
                url: mediaId,
            };
            try {
                const { data } = await this.client.get(mediaId);
                const $ = (0, cheerio_1.load)(data);
                const recommendationsArray = [];
                $('div.movie_information > div.container > div.m_i-related > div.film-related > section.block_area > div.block_area-content > div.film_list-wrap > div.flw-item').each((i, el) => {
                    var _a, _b, _c;
                    recommendationsArray.push({
                        id: (_a = $(el).find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1),
                        title: $(el).find('div.film-detail > h3.film-name > a').text(),
                        image: $(el).find('div.film-poster > img').attr('data-src'),
                        duration: (_b = $(el).find('div.film-detail > div.fd-infor > span.fdi-duration').text().replace('m', '')) !== null && _b !== void 0 ? _b : null,
                        type: $(el).find('div.film-detail > div.fd-infor > span.fdi-type').text().toLowerCase() === 'tv'
                            ? models_1.TvType.TVSERIES
                            : (_c = models_1.TvType.MOVIE) !== null && _c !== void 0 ? _c : null,
                    });
                });
                const uid = $('.watch_block').attr('data-id');
                movieInfo.cover = (_a = $('div.w_b-cover').attr('style')) === null || _a === void 0 ? void 0 : _a.slice(22).replace(')', '').replace(';', '');
                movieInfo.title = $('.heading-name > a:nth-child(1)').text();
                movieInfo.image = $('.m_i-d-poster > div:nth-child(1) > img:nth-child(1)').attr('src');
                movieInfo.description = $('.description').text();
                movieInfo.type = movieInfo.id.split('/')[0] === 'tv' ? models_1.TvType.TVSERIES : models_1.TvType.MOVIE;
                movieInfo.releaseDate = $('div.row-line:nth-child(3)').text().replace('Released: ', '').trim();
                movieInfo.genres = $('div.row-line:nth-child(2) > a')
                    .map((i, el) => $(el).text().split('&'))
                    .get()
                    .map(v => v.trim());
                movieInfo.casts = $('div.row-line:nth-child(5) > a')
                    .map((i, el) => $(el).text())
                    .get();
                movieInfo.tags = $('div.row-line:nth-child(6) > h2')
                    .map((i, el) => $(el).text())
                    .get();
                movieInfo.production = $('div.row-line:nth-child(4) > a:nth-child(2)').text();
                movieInfo.country = $('div.row-line:nth-child(1) > a:nth-child(2)').text();
                movieInfo.duration = $('span.item:nth-child(3)').text();
                movieInfo.rating = parseFloat($('span.item:nth-child(2)').text());
                movieInfo.recommendations = recommendationsArray;
                const ajaxReqUrl = (id, type, isSeasons = false) => `${this.baseUrl}/ajax/${type === 'movie' ? type : `v2/${type}`}/${isSeasons ? 'seasons' : 'episodes'}/${id}`;
                if (movieInfo.type === models_1.TvType.TVSERIES) {
                    const { data } = await this.client.get(ajaxReqUrl(uid, 'tv', true));
                    const $$ = (0, cheerio_1.load)(data);
                    const seasonsIds = $$('.dropdown-menu > a')
                        .map((i, el) => $(el).attr('data-id'))
                        .get();
                    movieInfo.episodes = [];
                    let season = 1;
                    for (const id of seasonsIds) {
                        const { data } = await this.client.get(ajaxReqUrl(id, 'season'));
                        const $$$ = (0, cheerio_1.load)(data);
                        $$$('.nav > li')
                            .map((i, el) => {
                            var _a;
                            const episode = {
                                id: $$$(el).find('a').attr('id').split('-')[1],
                                title: $$$(el).find('a').attr('title'),
                                number: parseInt($$$(el).find('a').attr('title').split(':')[0].slice(3).trim()),
                                season: season,
                                url: `${this.baseUrl}/ajax/v2/episode/servers/${$$$(el).find('a').attr('id').split('-')[1]}`,
                            };
                            (_a = movieInfo.episodes) === null || _a === void 0 ? void 0 : _a.push(episode);
                        })
                            .get();
                        season++;
                    }
                }
                else {
                    movieInfo.episodes = [
                        {
                            id: uid,
                            title: movieInfo.title + ' Movie',
                            url: `${this.baseUrl}/ajax/movie/episodes/${uid}`,
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
                const i = servers.findIndex(s => s.name === server);
                if (i === -1) {
                    throw new Error(`Server ${server} not found`);
                }
                const { data } = await this.client.get(`${this.baseUrl}/ajax/get_link/${servers[i].url.split('.').slice(-1).shift()}`);
                const serverUrl = new URL(data.link);
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
            if (!episodeId.startsWith(this.baseUrl + '/ajax') && !mediaId.includes('movie'))
                episodeId = `${this.baseUrl}/ajax/v2/episode/servers/${episodeId}`;
            else
                episodeId = `${this.baseUrl}/ajax/movie/episodes/${episodeId}`;
            try {
                const { data } = await this.client.get(episodeId);
                const $ = (0, cheerio_1.load)(data);
                const servers = $('.nav > li')
                    .map((i, el) => {
                    const server = {
                        name: mediaId.includes('movie')
                            ? $(el).find('a').attr('title').toLowerCase()
                            : $(el).find('a').attr('title').slice(6).trim().toLowerCase(),
                        url: `${this.baseUrl}/${mediaId}.${!mediaId.includes('movie')
                            ? $(el).find('a').attr('data-id')
                            : $(el).find('a').attr('data-linkid')}`.replace(!mediaId.includes('movie') ? /\/tv\// : /\/movie\//, !mediaId.includes('movie') ? '/watch-tv/' : '/watch-movie/'),
                    };
                    return server;
                })
                    .get();
                return servers;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchRecentMovies = async () => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/home`);
                const $ = (0, cheerio_1.load)(data);
                const movies = $('section.block_area:contains("Latest Movies") > div:nth-child(2) > div:nth-child(1) > div.flw-item')
                    .map((i, el) => {
                    var _a;
                    const releaseDate = $(el).find('div.film-detail > div.fd-infor > span:nth-child(1)').text();
                    const movie = {
                        id: (_a = $(el).find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1),
                        title: $(el).find('div.film-detail > h3.film-name > a').attr('title'),
                        url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
                        image: $(el).find('div.film-poster > img').attr('data-src'),
                        releaseDate: isNaN(parseInt(releaseDate)) ? undefined : releaseDate,
                        duration: $(el).find('div.film-detail > div.fd-infor > span.fdi-duration').text() || null,
                        type: $(el).find('div.film-detail > div.fd-infor > span.float-right').text() === 'Movie'
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
                const tvshows = $('section.block_area:contains("Latest TV Shows") > div:nth-child(2) > div:nth-child(1) > div.flw-item')
                    .map((i, el) => {
                    var _a;
                    const tvshow = {
                        id: (_a = $(el).find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1),
                        title: $(el).find('div.film-detail > h3.film-name > a').attr('title'),
                        url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
                        image: $(el).find('div.film-poster > img').attr('data-src'),
                        season: $(el).find('div.film-detail > div.fd-infor > span:nth-child(1)').text(),
                        latestEpisode: $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text() || null,
                        type: $(el).find('div.film-detail > div.fd-infor > span.float-right').text() === 'Movie'
                            ? models_1.TvType.MOVIE
                            : models_1.TvType.TVSERIES,
                    };
                    return tvshow;
                })
                    .get();
                return tvshows;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchTrendingMovies = async () => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/home`);
                const $ = (0, cheerio_1.load)(data);
                const movies = $('div#trending-movies div.film_list-wrap div.flw-item')
                    .map((i, el) => {
                    var _a;
                    const releaseDate = $(el).find('div.film-detail > div.fd-infor > span:nth-child(1)').text();
                    const movie = {
                        id: (_a = $(el).find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1),
                        title: $(el).find('div.film-detail > h3.film-name > a').attr('title'),
                        url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
                        image: $(el).find('div.film-poster > img').attr('data-src'),
                        releaseDate: isNaN(parseInt(releaseDate)) ? undefined : releaseDate,
                        duration: $(el).find('div.film-detail > div.fd-infor > span.fdi-duration').text() || null,
                        type: $(el).find('div.film-detail > div.fd-infor > span.float-right').text() === 'Movie'
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
                const tvshows = $('div#trending-tv div.film_list-wrap div.flw-item')
                    .map((i, el) => {
                    var _a;
                    const tvshow = {
                        id: (_a = $(el).find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1),
                        title: $(el).find('div.film-detail > h3.film-name > a').attr('title'),
                        url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
                        image: $(el).find('div.film-poster > img').attr('data-src'),
                        season: $(el).find('div.film-detail > div.fd-infor > span:nth-child(1)').text(),
                        latestEpisode: $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text() || null,
                        type: $(el).find('div.film-detail > div.fd-infor > span.float-right').text() === 'Movie'
                            ? models_1.TvType.MOVIE
                            : models_1.TvType.TVSERIES,
                    };
                    return tvshow;
                })
                    .get();
                return tvshows;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchByCountry = async (country, page = 1) => {
            const result = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            const navSelector = 'div.pre-pagination:nth-child(3) > nav:nth-child(1) > ul:nth-child(1)';
            try {
                const { data } = await this.client.get(`${this.baseUrl}/country/${country}/?page=${page}`);
                const $ = (0, cheerio_1.load)(data);
                result.hasNextPage =
                    $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;
                $('div.container > section.block_area > div.block_area-content > div.film_list-wrap > div.flw-item')
                    .each((i, el) => {
                    var _a, _b, _c, _d;
                    result.results.push({
                        id: (_b = (_a = $(el).find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1)) !== null && _b !== void 0 ? _b : '',
                        title: (_c = $(el).find('div.film-detail > h2.film-name > a').attr('title')) !== null && _c !== void 0 ? _c : '',
                        url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
                        image: $(el).find('div.film-poster > img').attr('data-src'),
                        season: $(el).find('div.film-detail > div.fd-infor > span:nth-child(1)').text(),
                        latestEpisode: (_d = $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text()) !== null && _d !== void 0 ? _d : null,
                        type: $(el).find('div.film-detail > div.fd-infor > span.float-right').text() === 'Movie'
                            ? models_1.TvType.MOVIE
                            : models_1.TvType.TVSERIES,
                    });
                })
                    .get();
                return result;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchByGenre = async (genre, page = 1) => {
            const result = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            try {
                const { data } = await this.client.get(`${this.baseUrl}/genre/${genre}?page=${page}`);
                const $ = (0, cheerio_1.load)(data);
                const navSelector = 'div.pre-pagination:nth-child(3) > nav:nth-child(1) > ul:nth-child(1)';
                result.hasNextPage =
                    $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;
                $('.film_list-wrap > div.flw-item').each((i, el) => {
                    var _a, _b, _c;
                    const releaseDate = $(el).find('div.film-detail > div.fd-infor > span:nth-child(1)').text();
                    result.results.push({
                        id: (_b = (_a = $(el).find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1)) !== null && _b !== void 0 ? _b : '',
                        title: (_c = $(el).find('div.film-detail > h2 > a').attr('title')) !== null && _c !== void 0 ? _c : '',
                        url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
                        image: $(el).find('div.film-poster > img').attr('data-src'),
                        releaseDate: isNaN(parseInt(releaseDate)) ? undefined : releaseDate,
                        seasons: releaseDate.includes('SS') ? parseInt(releaseDate.split('SS')[1]) : undefined,
                        type: $(el).find('div.film-detail > div.fd-infor > span.float-right').text() === 'Movie'
                            ? models_1.TvType.MOVIE
                            : models_1.TvType.TVSERIES,
                    });
                });
                return result;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
}
// (async () => {
//    const movie = new FlixHQ();
//   const search = await movie.search('the flash');
//   // const movieInfo = await movie.fetchEpisodeSources('1168337', 'tv/watch-vincenzo-67955');
//   // const recentTv = await movie.fetchTrendingTvShows();
//   //  const genre = await movie.fetchByCountry('KR')
//   //  console.log(genre)
// })();
exports.default = FlixHQ;
//# sourceMappingURL=flixhq.js.map