"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../../models");
const utils_1 = require("../../utils");
const flixhq_1 = __importDefault(require("../movies/flixhq"));
class TMDB extends models_1.MovieParser {
    constructor(apiKey = '5201b54eb0968700e693a30576d7d4dc', provider, proxyConfig) {
        super('https://api.themoviedb.org/3', proxyConfig);
        this.apiKey = apiKey;
        this.name = 'TMDB';
        this.baseUrl = 'https://www.themoviedb.org';
        this.apiUrl = 'https://api.themoviedb.org/3';
        this.logo = 'https://pbs.twimg.com/profile_images/1243623122089041920/gVZIvphd_400x400.jpg';
        this.classPath = 'MOVIES.TMDB';
        this.supportedTypes = new Set([models_1.TvType.MOVIE, models_1.TvType.TVSERIES, models_1.TvType.ANIME]);
        /**
         * @param query search query
         * @param page page number
         */
        this.search = async (query, page = 1) => {
            const searchUrl = `/search/multi?api_key=${this.apiKey}&language=en-US&page=${page}&include_adult=false&query=${query}`;
            const search = {
                currentPage: 1,
                results: [],
            };
            try {
                const { data } = await this.client.get(searchUrl);
                if (data.results.length < 1)
                    return search;
                data.results.forEach((result) => {
                    const date = new Date((result === null || result === void 0 ? void 0 : result.release_date) || (result === null || result === void 0 ? void 0 : result.first_air_date));
                    const movie = {
                        id: result.id,
                        title: (result === null || result === void 0 ? void 0 : result.title) || (result === null || result === void 0 ? void 0 : result.name),
                        image: `https://image.tmdb.org/t/p/original${result === null || result === void 0 ? void 0 : result.poster_path}`,
                        type: result.media_type === 'movie' ? models_1.TvType.MOVIE : models_1.TvType.TVSERIES,
                        rating: (result === null || result === void 0 ? void 0 : result.vote_average) || 0,
                        releaseDate: `${date.getFullYear()}` || '0',
                    };
                    return search.results.push(movie);
                });
                return search;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * @param id media id (anime or movie/tv)
         * @param type movie or tv
         */
        this.fetchMediaInfo = async (mediaId, type) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
            type = type.toLowerCase() === 'movie' ? 'movie' : 'tv';
            const infoUrl = `/${type}/${mediaId}?api_key=${this.apiKey}&language=en-US&append_to_response=release_dates,watch/providers,alternative_titles,credits,external_ids,images,keywords,recommendations,reviews,similar,translations,videos&include_image_language=en`;
            const info = {
                id: mediaId,
                title: '',
            };
            try {
                const { data } = await this.client.get(infoUrl);
                //get provider id from title and year (if available) to get the correct provider id for the movie/tv series (e.g. flixhq)
                const providerId = await this.findIdFromTitle((data === null || data === void 0 ? void 0 : data.title) || (data === null || data === void 0 ? void 0 : data.name), {
                    type: type === 'movie' ? models_1.TvType.MOVIE : models_1.TvType.TVSERIES,
                    totalSeasons: data === null || data === void 0 ? void 0 : data.number_of_seasons,
                    totalEpisodes: data === null || data === void 0 ? void 0 : data.number_of_episodes,
                    year: new Date((data === null || data === void 0 ? void 0 : data.release_year) || (data === null || data === void 0 ? void 0 : data.first_air_date)).getFullYear(),
                });
                info.id = providerId || mediaId;
                info.title = (data === null || data === void 0 ? void 0 : data.title) || (data === null || data === void 0 ? void 0 : data.name);
                info.image = `https://image.tmdb.org/t/p/original${data === null || data === void 0 ? void 0 : data.poster_path}`;
                info.cover = `https://image.tmdb.org/t/p/original${data === null || data === void 0 ? void 0 : data.backdrop_path}`;
                info.type = type === 'movie' ? models_1.TvType.MOVIE : models_1.TvType.TVSERIES;
                info.rating = (data === null || data === void 0 ? void 0 : data.vote_average) || 0;
                info.releaseDate = (data === null || data === void 0 ? void 0 : data.release_date) || (data === null || data === void 0 ? void 0 : data.first_air_date);
                info.description = data === null || data === void 0 ? void 0 : data.overview;
                info.genres = data === null || data === void 0 ? void 0 : data.genres.map((genre) => genre.name);
                info.duration = (data === null || data === void 0 ? void 0 : data.runtime) || (data === null || data === void 0 ? void 0 : data.episode_run_time[0]);
                info.totalEpisodes = data === null || data === void 0 ? void 0 : data.number_of_episodes;
                info.totalSeasons = data === null || data === void 0 ? void 0 : data.number_of_seasons;
                info.directors = (_a = data === null || data === void 0 ? void 0 : data.credits) === null || _a === void 0 ? void 0 : _a.crew.filter((crew) => crew.job === 'Director').map((crew) => crew.name);
                info.writers = (_b = data === null || data === void 0 ? void 0 : data.credits) === null || _b === void 0 ? void 0 : _b.crew.filter((crew) => crew.job === 'Screenplay').map((crew) => crew.name);
                info.actors = (_c = data === null || data === void 0 ? void 0 : data.credits) === null || _c === void 0 ? void 0 : _c.cast.map((cast) => cast.name);
                info.trailer = {
                    id: (_e = (_d = data === null || data === void 0 ? void 0 : data.videos) === null || _d === void 0 ? void 0 : _d.results[0]) === null || _e === void 0 ? void 0 : _e.key,
                    site: (_g = (_f = data === null || data === void 0 ? void 0 : data.videos) === null || _f === void 0 ? void 0 : _f.results[0]) === null || _g === void 0 ? void 0 : _g.site,
                    url: `https://www.youtube.com/watch?v=${(_j = (_h = data === null || data === void 0 ? void 0 : data.videos) === null || _h === void 0 ? void 0 : _h.results[0]) === null || _j === void 0 ? void 0 : _j.key}`,
                };
                info.similar =
                    ((_l = (_k = data === null || data === void 0 ? void 0 : data.similar) === null || _k === void 0 ? void 0 : _k.results) === null || _l === void 0 ? void 0 : _l.length) <= 0
                        ? undefined
                        : (_m = data === null || data === void 0 ? void 0 : data.similar) === null || _m === void 0 ? void 0 : _m.results.map((result) => {
                            return {
                                id: result.id,
                                title: result.title || result.name,
                                image: `https://image.tmdb.org/t/p/original${result.poster_path}`,
                                type: type === 'movie' ? models_1.TvType.MOVIE : models_1.TvType.TVSERIES,
                                rating: result.vote_average || 0,
                                releaseDate: result.release_date || result.first_air_date,
                            };
                        });
                info.recommendations =
                    ((_p = (_o = data === null || data === void 0 ? void 0 : data.recommendations) === null || _o === void 0 ? void 0 : _o.results) === null || _p === void 0 ? void 0 : _p.length) <= 0
                        ? undefined
                        : (_q = data === null || data === void 0 ? void 0 : data.recommendations) === null || _q === void 0 ? void 0 : _q.results.map((result) => {
                            return {
                                id: result.id,
                                title: result.title || result.name,
                                image: `https://image.tmdb.org/t/p/original${result.poster_path}`,
                                type: type === 'movie' ? models_1.TvType.MOVIE : models_1.TvType.TVSERIES,
                                rating: result.vote_average || 0,
                                releaseDate: result.release_date || result.first_air_date,
                            };
                        });
                const totalSeasons = (info === null || info === void 0 ? void 0 : info.totalSeasons) || 0;
                if (type === 'tv' && totalSeasons > 0) {
                    const seasonUrl = (season) => `/tv/${mediaId}/season/${season}?api_key=${this.apiKey}`;
                    info.seasons = [];
                    const seasons = info.seasons;
                    const InfoFromProvider = await this.provider.fetchMediaInfo(providerId);
                    const providerEpisodes = InfoFromProvider === null || InfoFromProvider === void 0 ? void 0 : InfoFromProvider.episodes;
                    if ((providerEpisodes === null || providerEpisodes === void 0 ? void 0 : providerEpisodes.length) < 1)
                        return info;
                    for (let i = 1; i <= totalSeasons; i++) {
                        const { data: seasonData } = await this.client.get(seasonUrl(i.toString()));
                        //find season in each episode (providerEpisodes)
                        const seasonEpisodes = providerEpisodes === null || providerEpisodes === void 0 ? void 0 : providerEpisodes.filter(episode => episode.season === i);
                        const episodes = ((_r = seasonData === null || seasonData === void 0 ? void 0 : seasonData.episodes) === null || _r === void 0 ? void 0 : _r.length) <= 0
                            ? undefined
                            : seasonData === null || seasonData === void 0 ? void 0 : seasonData.episodes.map((episode) => {
                                //find episode in each season (seasonEpisodes)
                                const episodeFromProvider = seasonEpisodes === null || seasonEpisodes === void 0 ? void 0 : seasonEpisodes.find(ep => ep.number === episode.episode_number);
                                return {
                                    id: episodeFromProvider === null || episodeFromProvider === void 0 ? void 0 : episodeFromProvider.id,
                                    title: episode.name,
                                    episode: episode.episode_number,
                                    season: episode.season_number,
                                    releaseDate: episode.air_date,
                                    description: episode.overview,
                                    url: (episodeFromProvider === null || episodeFromProvider === void 0 ? void 0 : episodeFromProvider.url) || undefined,
                                    img: !(episode === null || episode === void 0 ? void 0 : episode.still_path)
                                        ? undefined
                                        : `https://image.tmdb.org/t/p/original${episode.still_path}`,
                                };
                            });
                        seasons.push({
                            season: i,
                            image: !(seasonData === null || seasonData === void 0 ? void 0 : seasonData.poster_path)
                                ? undefined
                                : `https://image.tmdb.org/t/p/original${seasonData.poster_path}`,
                            episodes,
                        });
                    }
                }
            }
            catch (err) {
                console.log(err);
                throw new Error(err.message);
            }
            (_s = info.seasons) === null || _s === void 0 ? void 0 : _s.reverse();
            return info;
        };
        /**
         * Find the id of a media from its title. and extra data. (year, totalSeasons, totalEpisodes)
         * @param title
         * @param extraData
         * @returns id of the media
         */
        this.findIdFromTitle = async (title, extraData) => {
            var _a;
            //clean title
            title = title.replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase();
            const findMedia = (await this.provider.search(title));
            if (findMedia.results.length === 0)
                return '';
            // console.log(findMedia.results);
            // console.log(extraData);
            // Sort the retrieved info for more accurate results.
            findMedia.results.sort((a, b) => {
                var _a, _b;
                const targetTitle = title;
                let firstTitle;
                let secondTitle;
                if (typeof a.title == 'string')
                    firstTitle = a === null || a === void 0 ? void 0 : a.title;
                else
                    firstTitle = (_a = a === null || a === void 0 ? void 0 : a.title) !== null && _a !== void 0 ? _a : '';
                if (typeof b.title == 'string')
                    secondTitle = b.title;
                else
                    secondTitle = (_b = b === null || b === void 0 ? void 0 : b.title) !== null && _b !== void 0 ? _b : '';
                const firstRating = (0, utils_1.compareTwoStrings)(targetTitle, firstTitle.toLowerCase());
                const secondRating = (0, utils_1.compareTwoStrings)(targetTitle, secondTitle.toLowerCase());
                // Sort in descending order
                return secondRating - firstRating;
            });
            //remove results that dont match the type
            findMedia.results = findMedia.results.filter(result => {
                if (extraData.type === models_1.TvType.MOVIE)
                    return result.type === models_1.TvType.MOVIE;
                else if (extraData.type === models_1.TvType.TVSERIES)
                    return result.type === models_1.TvType.TVSERIES;
                else
                    return result;
            });
            // if extraData contains a year, filter out the results that don't match the year
            if (extraData && extraData.year && extraData.type === models_1.TvType.MOVIE) {
                findMedia.results = findMedia.results.filter(result => {
                    var _a;
                    return ((_a = result.releaseDate) === null || _a === void 0 ? void 0 : _a.split('-')[0]) === extraData.year;
                });
            }
            // console.log({ test1: findMedia.results });
            // check if the result contains the total number of seasons and compare it to the extraData by 1 up or down and make sure that its a number
            if (extraData && extraData.totalSeasons && extraData.type === models_1.TvType.TVSERIES) {
                findMedia.results = findMedia.results.filter(result => {
                    const totalSeasons = result.seasons || 0;
                    const extraDataSeasons = extraData.totalSeasons || 0;
                    return (totalSeasons === extraDataSeasons ||
                        totalSeasons === extraDataSeasons + 1 ||
                        totalSeasons === extraDataSeasons - 1);
                });
            }
            // console.log(findMedia.results);
            return ((_a = findMedia === null || findMedia === void 0 ? void 0 : findMedia.results[0]) === null || _a === void 0 ? void 0 : _a.id) || undefined;
        };
        /**
         * @param id media id (anime or movie/tv)
         * @param args optional arguments
         */
        this.fetchEpisodeSources = async (id, ...args) => {
            return this.provider.fetchEpisodeSources(id, ...args);
        };
        /**
         * @param episodeId episode id
         * @param args optional arguments
         **/
        this.fetchEpisodeServers = async (episodeId, ...args) => {
            return this.provider.fetchEpisodeServers(episodeId, ...args);
        };
        this.provider = provider || new flixhq_1.default();
    }
}
// (async () => {
//   const tmdb = new TMDB();
//   const search = await tmdb.search('vincenzo');
//   const info = await tmdb.fetchMediaInfo(search.results[0].id, search.results![0].type as string);
//   console.log(info);
//   //const sources = await tmdb.fetchEpisodeSources((info.seasons as any[])![0].episodes![0].id, info.id);
//   // const id = await tmdb.findIdFromTitle('avengers');
//   //console.log(info);
//   // console.log((info?.seasons as any[])![0].episodes);
// })();
exports.default = TMDB;
//# sourceMappingURL=tmdb.js.map