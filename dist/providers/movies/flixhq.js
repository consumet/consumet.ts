"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../../models");
const utils_1 = require("../../utils");
class FlixHQ extends models_1.MovieParser {
    constructor() {
        super(...arguments);
        this.name = 'FlixHQ';
        this.baseUrl = 'https://flixhq.to';
        this.logo = 'https://img.flixhq.to/xxrz/400x400/100/ab/5f/ab5f0e1996cc5b71919e10e910ad593e/ab5f0e1996cc5b71919e10e910ad593e.png';
        this.classPath = 'MOVIES.FlixHQ';
        this.supportedTypes = new Set([models_1.TvType.MOVIE, models_1.TvType.TVSERIES]);
        /**
         *
         * @param query search query string
         * @param page page number (default 1) (optional)
         */
        this.search = (query, page = 1) => __awaiter(this, void 0, void 0, function* () {
            const searchResult = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            try {
                const { data } = yield axios_1.default.get(`${this.baseUrl}/search/${query.replace(/[\W_]+/g, '-')}?page=${page}`);
                const $ = (0, cheerio_1.load)(data);
                const navSelector = 'div.pre-pagination:nth-child(3) > nav:nth-child(1) > ul:nth-child(1)';
                searchResult.hasNextPage =
                    $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;
                $('.film_list-wrap > div.flw-item').each((i, el) => {
                    var _a;
                    searchResult.results.push({
                        id: (_a = $(el).find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1),
                        title: $(el).find('div.film-detail > h2 > a').attr('title'),
                        url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
                        image: $(el).find('div.film-poster > img').attr('data-src'),
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
        });
        /**
         *
         * @param mediaId media link or id
         */
        this.fetchMediaInfo = (mediaId) => __awaiter(this, void 0, void 0, function* () {
            if (!mediaId.startsWith(this.baseUrl)) {
                mediaId = `${this.baseUrl}/${mediaId}`;
            }
            const movieInfo = {
                id: mediaId.split('to/').pop(),
                title: '',
                url: mediaId,
            };
            try {
                const { data } = yield axios_1.default.get(mediaId);
                const $ = (0, cheerio_1.load)(data);
                const uid = $('.watch_block').attr('data-id');
                movieInfo.title = $('.heading-name > a:nth-child(1)').text();
                movieInfo.image = $('.m_i-d-poster > div:nth-child(1) > img:nth-child(1)').attr('src');
                movieInfo.description = $('.description').text();
                movieInfo.type = movieInfo.id.split('/')[0] === 'tv' ? models_1.TvType.TVSERIES : models_1.TvType.MOVIE;
                movieInfo.releaseDate = $('div.row-line:nth-child(3)').text().replace('Released: ', '').trim();
                movieInfo.genres = $('div.row-line:nth-child(2) > a')
                    .map((i, el) => $(el).text().split('&'))
                    .get()
                    .map((v) => v.trim());
                movieInfo.casts = $('div.row-line:nth-child(5) > a')
                    .map((i, el) => $(el).text())
                    .get();
                movieInfo.tags = $('div.row-line:nth-child(6) > h2')
                    .map((i, el) => $(el).text())
                    .get();
                movieInfo.production = $('div.row-line:nth-child(4) > a:nth-child(2)').text();
                movieInfo.duration = $('span.item:nth-child(3)').text();
                movieInfo.rating = parseFloat($('span.item:nth-child(2)').text());
                let ajaxReqUrl = (id, type, isSeasons = false) => `${this.baseUrl}/ajax/${type === 'movie' ? type : `v2/${type}`}/${isSeasons ? 'seasons' : 'episodes'}/${id}`;
                if (movieInfo.type === models_1.TvType.TVSERIES) {
                    const { data } = yield axios_1.default.get(ajaxReqUrl(uid, 'tv', true));
                    const $$ = (0, cheerio_1.load)(data);
                    const seasonsIds = $$('.dropdown-menu > a')
                        .map((i, el) => $(el).attr('data-id'))
                        .get();
                    movieInfo.episodes = [];
                    let season = 1;
                    for (const id of seasonsIds) {
                        const { data } = yield axios_1.default.get(ajaxReqUrl(id, 'season'));
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
                    const { data } = yield axios_1.default.get(ajaxReqUrl(uid, 'movie'));
                    const $$$ = (0, cheerio_1.load)(data);
                    movieInfo.episodes = $$$('.nav > li')
                        .map((i, el) => {
                        const episode = {
                            id: uid,
                            title: movieInfo.title + ' Movie',
                            url: `${this.baseUrl}/ajax/movie/episodes/${uid}`,
                        };
                        return episode;
                    })
                        .get();
                }
                return movieInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        /**
         *
         * @param episodeId episode id
         * @param mediaId media id
         * @param server server type (default `VidCloud`) (optional)
         */
        this.fetchEpisodeSources = (episodeId, mediaId, server = models_1.StreamingServers.VidCloud) => __awaiter(this, void 0, void 0, function* () {
            if (episodeId.startsWith('http')) {
                const serverUrl = new URL(episodeId);
                switch (server) {
                    case models_1.StreamingServers.MixDrop:
                        return {
                            headers: { Referer: serverUrl.href },
                            sources: yield new utils_1.MixDrop().extract(serverUrl),
                        };
                    case models_1.StreamingServers.VidCloud:
                        return Object.assign({ headers: { Referer: serverUrl.href } }, (yield new utils_1.VidCloud().extract(serverUrl, true)));
                    case models_1.StreamingServers.UpCloud:
                        return Object.assign({ headers: { Referer: serverUrl.href } }, (yield new utils_1.VidCloud().extract(serverUrl)));
                    default:
                        return {
                            headers: { Referer: serverUrl.href },
                            sources: yield new utils_1.MixDrop().extract(serverUrl),
                        };
                }
            }
            try {
                const servers = yield this.fetchEpisodeServers(episodeId, mediaId);
                const i = servers.findIndex((s) => s.name === server);
                if (i === -1) {
                    throw new Error(`Server ${server} not found`);
                }
                const { data } = yield axios_1.default.get(`${this.baseUrl}/ajax/get_link/${servers[i].url.split('.').slice(-1).shift()}`);
                const serverUrl = new URL(data.link);
                return yield this.fetchEpisodeSources(serverUrl.href, mediaId, server);
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        /**
         *
         * @param episodeId takes episode link or movie id
         * @param mediaId takes movie link or id (found on movie info object)
         */
        this.fetchEpisodeServers = (episodeId, mediaId) => __awaiter(this, void 0, void 0, function* () {
            if (!episodeId.startsWith(this.baseUrl + '/ajax') && !mediaId.includes('movie')) {
                episodeId = `${this.baseUrl}/ajax/v2/episode/servers/${episodeId}`;
            }
            else {
                episodeId = `${this.baseUrl}/ajax/movie/episodes/${episodeId}`;
            }
            try {
                const { data } = yield axios_1.default.get(episodeId);
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
        });
    }
}
exports.default = FlixHQ;
//# sourceMappingURL=flixhq.js.map