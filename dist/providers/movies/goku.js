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
         * Search for movies or TV shows
         * @param query search query string
         * @param page page number (default 1)
         */
        this.search = async (query, page = 1) => {
            try {
                const sanitizedQuery = query.replace(/[\W_]+/g, '-');
                const { data } = await this.client.get(`${this.baseUrl}/search?keyword=${sanitizedQuery}&page=${page}`);
                const $ = (0, cheerio_1.load)(data);
                const searchResult = {
                    currentPage: page,
                    hasNextPage: $('.page-link').length > 0 && $('.page-link').last().attr('title') === 'Last',
                    results: [],
                };
                $('div.section-items > div.item').each((_, el) => {
                    var _a;
                    const $el = $(el);
                    const releaseDate = $el.find('div.movie-info div.info-split > div:nth-child(1)').text();
                    const rating = $el.find('div.movie-info div.info-split div.is-rated').text();
                    const href = $el.find('.is-watch > a').attr('href');
                    searchResult.results.push({
                        id: (_a = href === null || href === void 0 ? void 0 : href.replace('/', '')) !== null && _a !== void 0 ? _a : '',
                        title: $el.find('div.movie-info h3.movie-name').text(),
                        url: `${this.baseUrl}${href}`,
                        image: $el.find('div.movie-thumbnail > a > img').attr('src'),
                        releaseDate: isNaN(parseInt(releaseDate)) ? undefined : releaseDate,
                        rating: isNaN(parseFloat(rating)) ? undefined : parseFloat(rating),
                        type: (href === null || href === void 0 ? void 0 : href.includes('watch-series')) ? models_1.TvType.TVSERIES : models_1.TvType.MOVIE,
                    });
                });
                return searchResult;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * Fetch detailed media information
         * @param mediaId media link or id
         */
        this.fetchMediaInfo = async (mediaId) => {
            const cleanId = mediaId.startsWith(this.baseUrl) ? mediaId.replace(this.baseUrl + '/', '') : mediaId;
            try {
                const { data } = await this.client.get(`${this.baseUrl}/${cleanId}`);
                const $ = (0, cheerio_1.load)(data);
                const mediaType = cleanId.includes('watch-series') ? models_1.TvType.TVSERIES : models_1.TvType.MOVIE;
                const movieInfo = {
                    id: cleanId,
                    title: $('div.movie-detail > div.is-name > h3').text(),
                    url: `${this.baseUrl}/${cleanId}`,
                    image: $('.movie-thumbnail > img').attr('src'),
                    description: $('.is-description > .text-cut').text(),
                    type: mediaType,
                    genres: $("div.name:contains('Genres:')")
                        .siblings()
                        .find('a')
                        .map((_, el) => $(el).text())
                        .get(),
                    casts: $("div.name:contains('Cast:')")
                        .siblings()
                        .find('a')
                        .map((_, el) => $(el).text())
                        .get(),
                    production: $("div.name:contains('Production:')")
                        .siblings()
                        .find('a')
                        .map((_, el) => $(el).text())
                        .get()
                        .join(),
                    duration: $("div.name:contains('Duration:')").siblings().text().split('\n').join('').trim(),
                };
                // Fetch episodes
                if (mediaType === models_1.TvType.TVSERIES) {
                    movieInfo.episodes = await this.fetchTvSeriesEpisodes(cleanId);
                }
                else {
                    movieInfo.episodes = [];
                    $('meta').each((_, el) => {
                        var _a, _b, _c;
                        const $el = $(el);
                        if ($el.attr('property') === 'og:url') {
                            (_a = movieInfo.episodes) === null || _a === void 0 ? void 0 : _a.push({
                                id: (_c = (_b = $el.attr('content')) === null || _b === void 0 ? void 0 : _b.split('/').pop()) !== null && _c !== void 0 ? _c : '',
                                title: movieInfo.title.toString(),
                                url: $el.attr('content'),
                            });
                        }
                    });
                }
                return movieInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * Fetch available episode servers
         * @param episodeId episode link or movie id
         * @param mediaId movie link or id
         */
        this.fetchEpisodeServers = async (episodeId, mediaId) => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/ajax/movie/episode/servers/${episodeId}`);
                const $ = (0, cheerio_1.load)(data);
                const servers = $('.dropdown-menu > a')
                    .map((_, el) => {
                    var _a;
                    const $el = $(el);
                    return {
                        name: $el.text(),
                        id: (_a = $el.attr('data-id')) !== null && _a !== void 0 ? _a : '',
                    };
                })
                    .get();
                const episodeServers = [];
                for (const server of servers) {
                    const { data } = await this.client.get(`${this.baseUrl}/ajax/movie/episode/server/sources/${server.id}`);
                    episodeServers.push({
                        name: server.name,
                        url: data.data.link,
                    });
                }
                return episodeServers;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * Fetch episode sources from a specific server
         * @param episodeId episode id or URL
         * @param mediaId media id
         * @param server streaming server type (default UpCloud)
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
                        return {
                            headers: { Referer: serverUrl.href },
                            ...(await new extractors_1.VidCloud(this.proxyConfig, this.adapter).extract(serverUrl)),
                        };
                    case models_1.StreamingServers.UpCloud:
                        return {
                            headers: { Referer: serverUrl.href },
                            ...(await new extractors_1.VidCloud(this.proxyConfig, this.adapter).extract(serverUrl)),
                        };
                    default:
                        return {
                            headers: { Referer: serverUrl.href },
                            sources: await new extractors_1.MixDrop(this.proxyConfig, this.adapter).extract(serverUrl),
                        };
                }
            }
            try {
                const servers = await this.fetchEpisodeServers(episodeId, mediaId);
                const selectedServer = servers.find(s => s.name.toLowerCase() === server.toLowerCase());
                if (!selectedServer) {
                    throw new Error(`Server ${server} not found`);
                }
                return await this.fetchEpisodeSources(selectedServer.url, mediaId, server);
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * Fetch recent movies
         */
        this.fetchRecentMovies = async () => {
            return this.fetchHomeSection('.section-last', true);
        };
        /**
         * Fetch recent TV shows
         */
        this.fetchRecentTvShows = async () => {
            return this.fetchHomeSection('.section-last', false, true);
        };
        /**
         * Fetch trending movies
         */
        this.fetchTrendingMovies = async () => {
            return this.fetchHomeSection('#trending-movies', true);
        };
        /**
         * Fetch trending TV shows
         */
        this.fetchTrendingTvShows = async () => {
            return this.fetchHomeSection('#trending-series', false, true);
        };
        /**
         * Fetch content by country
         * @param country country name
         * @param page page number (default 1)
         */
        this.fetchByCountry = async (country, page = 1) => {
            return this.fetchByFilter('country', country, page);
        };
        /**
         * Fetch content by genre
         * @param genre genre name
         * @param page page number (default 1)
         */
        this.fetchByGenre = async (genre, page = 1) => {
            return this.fetchByFilter('genre', genre, page);
        };
    }
    /**
     * Fetch TV series episodes for all seasons
     * @param mediaId media unique identifier
     */
    async fetchTvSeriesEpisodes(mediaId) {
        const { data } = await this.client.get(`${this.baseUrl}/ajax/movie/seasons/${mediaId.split('-').pop()}`);
        const $ = (0, cheerio_1.load)(data);
        const seasonIds = $('.dropdown-menu > a')
            .map((_, el) => {
            const $el = $(el);
            const seasonText = $el.text().replace('Season', '').trim();
            return {
                id: $el.attr('data-id'),
                season: isNaN(parseInt(seasonText)) ? undefined : parseInt(seasonText),
            };
        })
            .get();
        const episodes = [];
        for (const season of seasonIds) {
            const { data: seasonData } = await this.client.get(`${this.baseUrl}/ajax/movie/season/episodes/${season.id}`);
            const $$ = (0, cheerio_1.load)(seasonData);
            $$('.item').each((_, el) => {
                var _a, _b, _c, _d;
                const $$el = $$(el);
                const episodeText = (_b = (_a = $$el.find('a').text()) === null || _a === void 0 ? void 0 : _a.split(':')[0].trim().substring(3)) !== null && _b !== void 0 ? _b : '';
                episodes.push({
                    id: (_c = $$el.find('a').attr('data-id')) !== null && _c !== void 0 ? _c : '',
                    title: (_d = $$el.find('a').attr('title')) !== null && _d !== void 0 ? _d : '',
                    number: parseInt(episodeText),
                    season: season.season,
                    url: $$el.find('a').attr('href'),
                });
            });
        }
        return episodes;
    }
    /**
     * Fetch content from home page by section
     * @param selector CSS selector for section
     * @param isMovie whether content is movies
     * @param useLast whether to use last() selector
     */
    async fetchHomeSection(selector, isMovie = false, useLast = false) {
        try {
            const { data } = await this.client.get(`${this.baseUrl}/home`);
            const $ = (0, cheerio_1.load)(data);
            let section = $(selector);
            if (useLast) {
                section = section.last();
            }
            else if (selector === '.section-last' && isMovie) {
                section = section.first();
            }
            return section
                .find('.item')
                .map((_, el) => {
                var _a, _b;
                const $el = $(el);
                const href = $el.find('.is-watch > a').attr('href');
                const result = {
                    id: href === null || href === void 0 ? void 0 : href.replace('/', ''),
                    title: $el.find('.movie-name').text(),
                    url: `${this.baseUrl}${href}`,
                    image: $el.find('.movie-thumbnail > a > img').attr('src'),
                    type: (href === null || href === void 0 ? void 0 : href.includes(isMovie ? 'watch-movie' : 'watch-series'))
                        ? isMovie
                            ? models_1.TvType.MOVIE
                            : models_1.TvType.TVSERIES
                        : isMovie
                            ? models_1.TvType.MOVIE
                            : models_1.TvType.TVSERIES,
                };
                if (isMovie) {
                    const releaseDate = $el.find('.info-split').children().first().text();
                    result.releaseDate = isNaN(parseInt(releaseDate)) ? undefined : releaseDate;
                    result.duration = $el.find('.info-split > div:nth-child(3)').text();
                }
                else {
                    const seasonEpisode = $el.find('.info-split > div:nth-child(2)').text();
                    const parts = seasonEpisode.split('/');
                    result.season = (_a = parts[0]) === null || _a === void 0 ? void 0 : _a.trim();
                    result.latestEpisode = (_b = parts[1]) === null || _b === void 0 ? void 0 : _b.trim();
                }
                return result;
            })
                .get();
        }
        catch (err) {
            throw new Error(err.message);
        }
    }
    /**
     * Fetch content by filter (genre or country)
     * @param filterType filter type (genre or country)
     * @param filterValue filter value
     * @param page page number
     */
    async fetchByFilter(filterType, filterValue, page) {
        try {
            const url = filterType === 'country'
                ? `${this.baseUrl}/country/${filterValue}/?page=${page}`
                : `${this.baseUrl}/genre/${filterValue}?page=${page}`;
            const { data } = await this.client.get(url);
            const $ = (0, cheerio_1.load)(data);
            const result = {
                currentPage: page,
                hasNextPage: $('.page-link').length > 0 && $('.page-link').last().attr('title') === 'Last',
                results: [],
            };
            $('div.section-items.section-items-default > div.item').each((_, el) => {
                var _a, _b, _c, _d;
                const $el = $(el);
                const href = $el.find('div.movie-info > a').attr('href');
                const mediaType = (href === null || href === void 0 ? void 0 : href.includes('movie/')) ? models_1.TvType.MOVIE : models_1.TvType.TVSERIES;
                const resultItem = {
                    id: (_b = (_a = $el.find('div.movie-thumbnail > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1)) !== null && _b !== void 0 ? _b : '',
                    title: $el.find('div.movie-info > a > h3.movie-name').text().trim(),
                    url: `${this.baseUrl}${href}`,
                    image: $el.find('div.movie-thumbnail > a > img').attr('src'),
                    type: mediaType,
                };
                if (mediaType === models_1.TvType.TVSERIES) {
                    const seasonEpisode = $el.find('div.movie-info > div.info-split > div:nth-child(2)').text();
                    const parts = seasonEpisode.split('/');
                    resultItem.season = (_c = parts[0]) === null || _c === void 0 ? void 0 : _c.trim();
                    resultItem.latestEpisode = (_d = parts[1]) === null || _d === void 0 ? void 0 : _d.trim();
                }
                else {
                    resultItem.releaseDate = $el.find('div.movie-info > div.info-split > div:nth-child(1)').text();
                    resultItem.duration = $el.find('div.movie-info > div.info-split > div:nth-child(3)').text();
                }
                result.results.push(resultItem);
            });
            return result;
        }
        catch (err) {
            throw new Error(err.message);
        }
    }
}
exports.default = Goku;
//# sourceMappingURL=goku.js.map