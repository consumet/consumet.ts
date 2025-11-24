"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const extractors_1 = require("../../extractors");
class SFlix extends models_1.MovieParser {
    constructor() {
        super(...arguments);
        this.name = 'SFlix';
        this.baseUrl = 'https://sflix.ps';
        this.logo = 'https://img.sflix.to/xxrz/100x100/100/a2/33/a233d4c4a1426ca77ec1d34deec62f71/a233d4c4a1426ca77ec1d34deec62f71.png';
        this.classPath = 'MOVIES.SFlix';
        this.supportedTypes = new Set([models_1.TvType.MOVIE, models_1.TvType.TVSERIES]);
        /**
         * Search for movies or TV shows
         * @param query search query string
         * @param page page number (default: 1)
         */
        this.search = async (query, page = 1) => {
            try {
                const sanitizedQuery = query.replace(/[\W_]+/g, '-');
                const { data } = await this.client.get(`${this.baseUrl}/search/${sanitizedQuery}?page=${page}`);
                const $ = (0, cheerio_1.load)(data);
                const searchResult = {
                    currentPage: page,
                    hasNextPage: false,
                    results: [],
                };
                searchResult.hasNextPage =
                    $(SFlix.NAV_SELECTOR).length > 0 && !$(SFlix.NAV_SELECTOR).children().last().hasClass('active');
                $('.film_list-wrap > div.flw-item').each((_, el) => {
                    var _a;
                    const $el = $(el);
                    const releaseDate = $el.find('div.film-detail > div.fd-infor > span:nth-child(1)').text();
                    searchResult.results.push({
                        id: (_a = $el.find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1),
                        title: $el.find('div.film-detail > h2 > a').attr('title'),
                        url: `${this.baseUrl}${$el.find('div.film-poster > a').attr('href')}`,
                        image: $el.find('div.film-poster > img').attr('data-src'),
                        releaseDate: isNaN(parseInt(releaseDate)) ? undefined : releaseDate,
                        seasons: releaseDate.includes('SS') ? parseInt(releaseDate.split('SS')[1]) : undefined,
                        type: this.parseMediaType($el.find('div.film-detail > div.fd-infor > span:nth-child(2)').text()),
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
            var _a;
            const url = mediaId.startsWith(this.baseUrl) ? mediaId : `${this.baseUrl}/${mediaId}`;
            try {
                const { data } = await this.client.get(url);
                const $ = (0, cheerio_1.load)(data);
                const uid = $('.detail_page-watch').attr('data-id');
                const extractedId = mediaId.split('to/').pop();
                const title = $('.heading-name > a:nth-child(1)').text();
                const movieInfo = {
                    id: extractedId,
                    title,
                    url,
                    cover: (_a = $('.cover_follow').attr('style')) === null || _a === void 0 ? void 0 : _a.slice(22).replace(')', '').replace(';', ''),
                    image: $('.dp-i-c-poster > div:nth-child(1) > img:nth-child(1)').attr('src'),
                    description: $('.description')
                        .text()
                        .replace(/^Overview:\s*/i, '')
                        .replace(/\s+/g, ' ')
                        .trim(),
                    type: extractedId.split('/')[0] === 'tv' ? models_1.TvType.TVSERIES : models_1.TvType.MOVIE,
                    releaseDate: $('div.row > div.col-xl-5 .row-line').eq(0).text().replace('Released: ', '').trim(),
                    genres: $('div.row >div.col-xl-5 .row-line')
                        .eq(1)
                        .find('a')
                        .map((_, el) => $(el).text().split('&'))
                        .get()
                        .map(v => v.trim()),
                    casts: $('div.row > div.col-xl-5 .row-line')
                        .eq(2)
                        .find('a')
                        .map((_, el) => $(el).text())
                        .get(),
                    tags: $('div.row-tags > h2')
                        .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim())
                        .get(),
                    production: $('div.row > div.col-xl-6 .row-line')
                        .eq(2)
                        .find('a')
                        .map((_, el) => $(el).text().trim())
                        .get()
                        .join(', '),
                    country: $('div.row > div.col-xl-6 .row-line').eq(1).find('a').text().trim(),
                    duration: $('div.row > div.col-xl-6 .row-line')
                        .eq(0)
                        .text()
                        .replace('Duration: ', '')
                        .replace(/\s+/g, ' ')
                        .trim(),
                    rating: parseFloat($('div.film-stats > div.fs-item > span.imdb').text().replace('IMDB: ', '')),
                    recommendations: this.parseRecommendations($),
                };
                // Fetch episodes
                if (movieInfo.type === models_1.TvType.TVSERIES) {
                    movieInfo.episodes = await this.fetchTvSeriesEpisodes(uid);
                }
                else {
                    movieInfo.episodes = [
                        {
                            id: uid,
                            title,
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
         * Fetch available episode servers
         * @param episodeId episode link or movie id
         * @param mediaId movie link or id
         */
        this.fetchEpisodeServers = async (episodeId, mediaId) => {
            const isMovie = mediaId.includes('movie');
            const endpoint = !episodeId.startsWith(this.baseUrl + '/ajax') && !isMovie
                ? `${this.baseUrl}/ajax/episode/servers/${episodeId}`
                : `${this.baseUrl}/ajax/episode/list/${episodeId}`;
            try {
                const { data } = await this.client.get(endpoint);
                const $ = (0, cheerio_1.load)(data);
                const servers = $('.ulclear > li')
                    .map((_, el) => {
                    const $el = $(el);
                    const urlPattern = isMovie ? /\/movie\// : /\/tv\//;
                    const replacement = isMovie ? '/watch-movie/' : '/watch-tv/';
                    const dataId = $el.find('a').attr('data-id');
                    return {
                        name: $el.find('a').find('span').text().trim().toLowerCase(),
                        url: `${this.baseUrl}/${mediaId}.${dataId}`.replace(urlPattern, replacement),
                        id: dataId,
                    };
                })
                    .get();
                return servers;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * Fetch episode sources from a specific server
         * @param episodeId episode id or URL
         * @param mediaId media id
         * @param server streaming server type (default: UpCloud)
         */
        this.fetchEpisodeSources = async (episodeId, mediaId, server = models_1.StreamingServers.UpCloud) => {
            if (episodeId.startsWith('http')) {
                return this.extractFromServer(episodeId, server);
            }
            try {
                const servers = await this.fetchEpisodeServers(episodeId, mediaId);
                const selectedServer = servers.find(s => s.name.toLowerCase() === server.toLowerCase());
                if (!selectedServer) {
                    throw new Error(`Server ${server} not found`);
                }
                const { data } = await this.client.get(`${this.baseUrl}/ajax/episode/sources/${selectedServer.id}`);
                if (!(data === null || data === void 0 ? void 0 : data.link)) {
                    throw new Error('No link returned from episode source');
                }
                const parsedUrl = new URL(data.link);
                if (parsedUrl.host === 'videostr.net' || parsedUrl.host === 'www.videostr.net') {
                    server = models_1.StreamingServers.VideoStr;
                }
                return await this.fetchEpisodeSources(data.link, mediaId, server);
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * Fetch recent movies
         */
        this.fetchRecentMovies = async () => {
            return this.fetchHomeSection('Latest Movies', false);
        };
        /**
         * Fetch recent TV shows
         */
        this.fetchRecentTvShows = async () => {
            return this.fetchHomeSection('Latest TV Shows', true);
        };
        /**
         * Fetch trending movies
         */
        this.fetchTrendingMovies = async () => {
            return this.fetchHomeSectionById('trending-movies', false);
        };
        /**
         * Fetch trending TV shows
         */
        this.fetchTrendingTvShows = async () => {
            return this.fetchHomeSectionById('trending-tv', true);
        };
        /**
         * Fetch content by country
         * @param country country name
         * @param page page number (default: 1)
         */
        this.fetchByCountry = async (country, page = 1) => {
            return this.fetchByFilter('country', country, page);
        };
        /**
         * Fetch content by genre
         * @param genre genre name
         * @param page page number (default: 1)
         */
        this.fetchByGenre = async (genre, page = 1) => {
            return this.fetchByFilter('genre', genre, page);
        };
        /**
         * Fetch spotlight/featured content
         */
        this.fetchSpotlight = async () => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/home`);
                const $ = (0, cheerio_1.load)(data);
                const results = { results: [] };
                $('div.swiper-slide').each((_, el) => {
                    const $el = $(el);
                    const href = $el.find('a').attr('href');
                    results.results.push({
                        id: href === null || href === void 0 ? void 0 : href.slice(1),
                        title: $el.find('a').attr('title'),
                        url: `${this.baseUrl}${href}`,
                        cover: $el.find('div.slide-photo > a > img').attr('src'),
                        rating: $el.find('.scd-item:nth-child(1)').text().trim(),
                        description: $el.find('.sc-desc').text().trim(),
                        type: (href === null || href === void 0 ? void 0 : href.split('/')[1]) === 'movie' ? models_1.TvType.MOVIE : models_1.TvType.TVSERIES,
                    });
                });
                return results;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
    /**
     * Fetch TV series episodes for all seasons
     * @param uid unique identifier
     */
    async fetchTvSeriesEpisodes(id) {
        const { data } = await this.client.get(`${this.baseUrl}/ajax/season/list/${id}`);
        const $ = (0, cheerio_1.load)(data);
        const seasonIds = $('.dropdown-menu > a')
            .map((_, el) => $(el).attr('data-id'))
            .get();
        const episodes = [];
        let seasonNumber = 1;
        for (const seasonId of seasonIds) {
            const { data: seasonData } = await this.client.get(`${this.baseUrl}/ajax/season/episodes/${seasonId}`);
            const $$ = (0, cheerio_1.load)(seasonData);
            $$('.swiper-container > .swiper-wrapper > .swiper-slide').each((_, el) => {
                const $el = $$(el);
                const episodeId = $el.find('div.flw-item').attr('id').split('-')[1];
                const titleAttr = $el.find('div.flw-item > a > img').attr('title');
                episodes.push({
                    id: episodeId,
                    image: $el.find('div.flw-item > a > img').attr('src'),
                    title: titleAttr,
                    number: parseInt(titleAttr.split(':')[0].slice(8).trim()),
                    season: seasonNumber,
                    url: `${this.baseUrl}/ajax/episode/servers/${episodeId}`,
                });
            });
            seasonNumber++;
        }
        return episodes;
    }
    /**
     * Parse recommendations from media info page
     * @param $ cheerio instance
     */
    parseRecommendations($) {
        const recommendations = [];
        $('div.container > section.block_area > div.block_area-content > div.film_list-wrap > div.flw-item').each((_, el) => {
            var _a;
            const $el = $(el);
            const typeText = $el
                .find('div.film-detail > div.fd-infor > span.fdi-item')
                .eq(1)
                .text()
                .trim()
                .toLowerCase();
            recommendations.push({
                id: (_a = $el.find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1),
                title: $el.find('div.film-detail > h3.film-name > a').text(),
                image: $el.find('div.film-poster > img').attr('data-src'),
                duration: $el.find('div.film-detail > div.fd-infor > span.fdi-duration').text().replace('m', '') || null,
                type: typeText === 'tv' ? models_1.TvType.TVSERIES : models_1.TvType.MOVIE,
            });
        });
        return recommendations;
    }
    /**
     * Fetch content from home page by section title
     * @param sectionTitle section title to search for
     * @param isTvShow whether content is TV shows
     */
    async fetchHomeSection(sectionTitle, isTvShow) {
        try {
            const { data } = await this.client.get(`${this.baseUrl}/home`);
            const $ = (0, cheerio_1.load)(data);
            const results = $(`section.block_area:contains("${sectionTitle}") > div:nth-child(2) > div:nth-child(1) > div.flw-item`)
                .map((_, el) => {
                var _a;
                const $el = $(el);
                const result = {
                    id: (_a = $el.find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1),
                    title: $el.find('div.film-detail > h3.film-name > a').attr('title'),
                    url: `${this.baseUrl}${$el.find('div.film-poster > a').attr('href')}`,
                    image: $el.find('div.film-poster > img').attr('data-src'),
                    type: isTvShow ? models_1.TvType.TVSERIES : models_1.TvType.MOVIE,
                };
                if (isTvShow) {
                    const episodeInfo = $el.find('div.film-detail > div.fd-infor > span:nth-child(3)').text();
                    result.season = episodeInfo.split(':')[0] || null;
                    result.latestEpisode = episodeInfo.split(':')[1] || null;
                }
                else {
                    const releaseDate = $el.find('div.film-detail > div.fd-infor > span:nth-child(3)').text();
                    result.releaseDate = isNaN(parseInt(releaseDate)) ? undefined : releaseDate;
                    result.rating = $el.find('div.film-detail > div.fd-infor > span:nth-child(1)').text() || null;
                }
                return result;
            })
                .get();
            return results;
        }
        catch (err) {
            throw new Error(err.message);
        }
    }
    /**
     * Fetch content from home page by div ID
     * @param divId div ID to search for
     * @param isTvShow whether content is TV shows
     */
    async fetchHomeSectionById(divId, isTvShow) {
        try {
            const { data } = await this.client.get(`${this.baseUrl}/home`);
            const $ = (0, cheerio_1.load)(data);
            const results = $(`div#${divId} div.film_list-wrap div.flw-item`)
                .map((_, el) => {
                var _a;
                const $el = $(el);
                const result = {
                    id: (_a = $el.find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1),
                    title: $el.find('div.film-detail > h3.film-name > a').attr('title'),
                    url: `${this.baseUrl}${$el.find('div.film-poster > a').attr('href')}`,
                    image: $el.find('div.film-poster > img').attr('data-src'),
                    type: isTvShow ? models_1.TvType.TVSERIES : models_1.TvType.MOVIE,
                };
                if (isTvShow) {
                    const episodeInfo = $el.find('div.film-detail > div.fd-infor > span:nth-child(3)').text();
                    result.season = episodeInfo.split(':')[0] || null;
                    result.latestEpisode = episodeInfo.split(':')[1] || null;
                }
                else {
                    const releaseDate = $el.find('div.film-detail > div.fd-infor > span:nth-child(3)').text();
                    result.releaseDate = isNaN(parseInt(releaseDate)) ? undefined : releaseDate;
                    result.rating = $el.find('div.film-detail > div.fd-infor > span:nth-child(1)').text() || null;
                }
                return result;
            })
                .get();
            return results;
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
            const { data } = await this.client.get(`${this.baseUrl}/${filterType}/${filterValue}?page=${page}`);
            const $ = (0, cheerio_1.load)(data);
            const result = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            result.hasNextPage =
                $(SFlix.NAV_SELECTOR).length > 0 && !$(SFlix.NAV_SELECTOR).children().last().hasClass('active');
            const selector = filterType === 'country'
                ? 'div.container > section.block_area > div.block_area-content > div.film_list-wrap > div.flw-item'
                : '.film_list-wrap > div.flw-item';
            $(selector).each((_, el) => {
                var _a, _b, _c;
                const $el = $(el);
                const href = (_b = (_a = $el.find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1)) !== null && _b !== void 0 ? _b : '';
                const type = href.split('/')[0].toLowerCase() === 'movie' ? models_1.TvType.MOVIE : models_1.TvType.TVSERIES;
                const episodeInfo = $el.find('div.film-detail > div.fd-infor > span:nth-child(3)').text();
                const resultItem = {
                    id: href,
                    title: (_c = $el.find('div.film-detail > h2.film-name > a').attr('title')) !== null && _c !== void 0 ? _c : '',
                    url: `${this.baseUrl}${$el.find('div.film-poster > a').attr('href')}`,
                    image: $el.find('div.film-poster > img').attr('data-src'),
                    type,
                };
                if (type === models_1.TvType.TVSERIES) {
                    resultItem.season = episodeInfo.split(':')[0] || null;
                    resultItem.latestEpisode = episodeInfo.split(':')[1] || null;
                }
                else {
                    resultItem.rating = $el.find('div.film-detail > div.fd-infor > span:nth-child(1)').text();
                    resultItem.releaseDate = episodeInfo;
                }
                result.results.push(resultItem);
            });
            return result;
        }
        catch (err) {
            throw new Error(err.message);
        }
    }
    /**
     * Extract sources from streaming server
     * @param episodeUrl episode URL
     * @param server streaming server type
     */
    async extractFromServer(episodeUrl, server) {
        const serverUrl = new URL(episodeUrl);
        switch (server) {
            case models_1.StreamingServers.Voe:
                return {
                    headers: { Referer: serverUrl.href },
                    ...(await new extractors_1.Voe(this.proxyConfig, this.adapter).extract(serverUrl)),
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
            case models_1.StreamingServers.VideoStr:
                return {
                    headers: { Referer: serverUrl.href },
                    ...(await new extractors_1.VideoStr(this.proxyConfig, this.adapter).extract(serverUrl)),
                };
            case models_1.StreamingServers.MegaCloud:
                return {
                    headers: { Referer: serverUrl.href },
                    ...(await new extractors_1.MegaCloud(this.proxyConfig, this.adapter).extract(serverUrl)),
                };
            default:
                return {
                    headers: { Referer: serverUrl.href },
                    sources: await new extractors_1.MixDrop(this.proxyConfig, this.adapter).extract(serverUrl),
                };
        }
    }
    /**
     * Parse media type from text
     * @param typeText type text to parse
     */
    parseMediaType(typeText) {
        return typeText === 'Movie' ? models_1.TvType.MOVIE : models_1.TvType.TVSERIES;
    }
}
SFlix.NAV_SELECTOR = 'div.pre-pagination:nth-child(3) > nav:nth-child(1) > ul:nth-child(1)';
exports.default = SFlix;
//# sourceMappingURL=sflix.js.map