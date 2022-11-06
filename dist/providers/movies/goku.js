"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../../models");
const utils_1 = require("../../utils");
class Goku extends models_1.MovieParser {
    constructor() {
        super(...arguments);
        this.name = 'Goku';
        this.baseUrl = 'https://goku.to';
        this.logo = 'https://img.goku.to/xxrz/400x400/100/9c/e7/9ce7510639c4204bfe43904fad8f361f/9ce7510639c4204bfe43904fad8f361f.png';
        this.classPath = 'MOVIES.Goku';
        this.supportedTypes = new Set([models_1.TvType.MOVIE, models_1.TvType.TVSERIES]);
        /**
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
                const { data } = await axios_1.default.get(`${this.baseUrl}/search?keyword=${query.replace(/[\W_]+/g, '+')}&page=${page}`);
                const $ = (0, cheerio_1.load)(data);
                const navSelector = 'div.section-pagination:nth-child(1) > nav:nth-child(1) > ul:nth-child(1)';
                searchResult.hasNextPage =
                    $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;
                $('.section-items > div.item').each((i, el) => {
                    var _a;
                    const releaseDate = $(el).find('div.movie-info div.info-split > div:nth-child(1)').text();
                    const rating = $(el).find('div.info-split div.is-rated').text();
                    searchResult.results.push({
                        id: (_a = $(el).find('div.movie-thumbnail > a:nth-child(2)').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1),
                        title: $(el).find('div.movie-info h3.movie-name').text(),
                        url: `${this.baseUrl}${$(el).find('div.movie-thumbnail > a:nth-child(2)').attr('href')}`,
                        image: $(el).find('div.movie-thumbnail img').attr('src'),
                        releaseDate: isNaN(parseInt(releaseDate)) ? undefined : releaseDate,
                        rating: isNaN(parseInt(rating)) ? undefined : rating,
                        type: $(el).find('span.badge-type').text().toLowerCase() === 'tv' ? models_1.TvType.TVSERIES : models_1.TvType.MOVIE,
                    });
                });
                return searchResult;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * @param mediaId media link or id
         */
        this.fetchMediaInfo = async (mediaId) => {
            var _a;
            if (!mediaId.startsWith(this.baseUrl)) {
                mediaId = `${this.baseUrl}/watch-${mediaId}`;
            }
            const movieInfo = {
                id: mediaId.split(this.baseUrl).pop(),
                title: '',
                url: mediaId,
            };
            try {
                const { data } = await axios_1.default.get(mediaId);
                const $ = (0, cheerio_1.load)(data);
                const episodeId = (_a = String($('input#href-movie').val())) === null || _a === void 0 ? void 0 : _a.split('/').pop();
                const uid = String(mediaId.split('-').pop());
                movieInfo.title = $('div.is-name > h3.movie-name').text().trim();
                movieInfo.image = $('div.is-poster img').attr('src');
                movieInfo.description = $('div.is-description > div.dropdown-text > div.dropdown-text')
                    .text()
                    .split('\n')
                    .join('')
                    .replace(/  +/g, '');
                console.log(movieInfo.id.split('watch-')[1]);
                movieInfo.type = movieInfo.id.split('watch-')[1] === 'series' ? models_1.TvType.TVSERIES : models_1.TvType.MOVIE;
                movieInfo.genres = $("div.is-sub div:contains('Genres:')")
                    .find('div.value > a')
                    .map((i, el) => $(el).text())
                    .get();
                movieInfo.cast = $("div.is-sub div:contains('Cast:')")
                    .find('div.value > a')
                    .map((i, el) => $(el).text())
                    .get();
                movieInfo.duration = $("div.is-sub div:contains('Duration:')")
                    .find('div.value')
                    .text()
                    .trim()
                    .split(' ')
                    .shift();
                movieInfo.url = $(`meta[property="og:url"]`).attr('content');
                let ajaxReqUrl = (id, type, isSeasons = false) => {
                    if (isSeasons) {
                        return `${this.baseUrl}/ajax/movie/season/episodes/${id}`;
                    }
                    return `${this.baseUrl}/ajax/movie/episode/servers/${id}`;
                };
                if (movieInfo.type.trim().toLowerCase() !== models_1.TvType.MOVIE.toLowerCase()) {
                    const { data } = await axios_1.default.get(ajaxReqUrl(String(episodeId), 'tv', true));
                    const $$ = (0, cheerio_1.load)(data);
                    const seasonsIds = $$('.dropdown-menu > a')
                        .map((i, el) => $(el).attr('data-id'))
                        .get();
                    movieInfo.episodes = [];
                    let season = 1;
                    for (const id of seasonsIds) {
                        const { data } = await axios_1.default.get(ajaxReqUrl(id, 'season'));
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
                            episodeId,
                            title: `${movieInfo.title} Movie`,
                            url: `${this.baseUrl}/ajax/movie/episode/servers/${episodeId}`,
                        },
                    ];
                }
                return movieInfo;
            }
            catch (err) {
                console.log(err);
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
                            sources: await new utils_1.MixDrop().extract(serverUrl),
                        };
                    case models_1.StreamingServers.VidCloud:
                        return Object.assign({ headers: { Referer: serverUrl.href } }, (await new utils_1.VidCloud().extract(serverUrl, true)));
                    case models_1.StreamingServers.UpCloud:
                        return Object.assign({ headers: { Referer: serverUrl.href } }, (await new utils_1.VidCloud().extract(serverUrl)));
                    default:
                        return {
                            headers: { Referer: serverUrl.href },
                            sources: await new utils_1.MixDrop().extract(serverUrl),
                        };
                }
            }
            try {
                const servers = await this.fetchEpisodeServers(episodeId, mediaId);
                const i = servers.findIndex(s => s.name === server);
                if (i === -1) {
                    throw new Error(`Server ${server} not found`);
                }
                const { data } = await axios_1.default.get(`${this.baseUrl}/ajax/get_link/${servers[i].url.split('.').slice(-1).shift()}`);
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
                const { data } = await axios_1.default.get(episodeId);
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
                const { data } = await axios_1.default.get(`${this.baseUrl}/home`);
                const $ = (0, cheerio_1.load)(data);
                const movies = $('section.block_area:nth-child(5) > div:nth-child(2) > div:nth-child(1) > div.flw-item')
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
                const { data } = await axios_1.default.get(`${this.baseUrl}/home`);
                const $ = (0, cheerio_1.load)(data);
                const tvshows = $('section.block_area:nth-child(6) > div:nth-child(2) > div:nth-child(1) > div.flw-item')
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
    }
}
(async () => {
    var _a;
    const movie = new Goku();
    const movieSearch = await movie.search('stranger');
    const movieInfo = await movie.fetchMediaInfo((_a = movieSearch.results[0]) === null || _a === void 0 ? void 0 : _a.id);
    console.log(movieInfo);
})();
exports.default = Goku;
//# sourceMappingURL=goku.js.map