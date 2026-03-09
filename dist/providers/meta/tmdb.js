"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../../models");
const utils_1 = require("../../utils");
const himovies_1 = __importDefault(require("../movies/himovies"));
class TMDB extends models_1.MovieParser {
    constructor(apiKey = '5201b54eb0968700e693a30576d7d4dc', provider, proxyConfig, adapter) {
        super(proxyConfig, adapter);
        this.apiKey = apiKey;
        this.name = 'TMDB';
        this.baseUrl = 'https://www.themoviedb.org';
        this.apiUrl = 'https://api.themoviedb.org/3';
        this.logo = 'https://pbs.twimg.com/profile_images/1243623122089041920/gVZIvphd_400x400.jpg';
        this.classPath = 'META.TMDB';
        this.supportedTypes = new Set([models_1.TvType.MOVIE, models_1.TvType.TVSERIES, models_1.TvType.ANIME]);
        /**
         * @param type trending type: tv series, movie, people or all
         * @param timePeriod trending time period day or week
         * @param page page number
         */
        this.fetchTrending = async (type, timePeriod = 'day', page = 1) => {
            const trendingUrl = `${this.apiUrl}/trending/${type.toLowerCase() === models_1.TvType.MOVIE.toLowerCase()
                ? 'movie'
                : type.toLowerCase() === models_1.TvType.TVSERIES.toLowerCase()
                    ? 'tv'
                    : type.toLowerCase() === models_1.TvType.PEOPLE.toLowerCase()
                        ? 'person'
                        : 'all'}/${timePeriod}?page=${page}&api_key=${this.apiKey}&language=en-US`;
            const result = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            try {
                const { data } = await this.client.get(trendingUrl);
                if (data.results.length < 1)
                    return result;
                result.hasNextPage = page + 1 <= data.total_pages;
                result.currentPage = page;
                result.totalResults = data.total_results;
                result.totalPages = data.total_pages;
                result.results = data.results.map((result) => {
                    if (result.media_type !== 'person') {
                        const date = new Date(result?.release_date || result?.first_air_date);
                        const movie = {
                            id: result.id,
                            title: result?.title || result?.name,
                            image: `https://image.tmdb.org/t/p/original${result?.poster_path}`,
                            type: result.media_type === 'movie' ? models_1.TvType.MOVIE : models_1.TvType.TVSERIES,
                            rating: result?.vote_average || 0,
                            releaseDate: `${date.getFullYear()}` || '0',
                        };
                        return movie;
                    }
                    else {
                        const user = {
                            id: result.id,
                            name: result.name,
                            rating: result.popularity,
                            image: `https://image.tmdb.org/t/p/original${result?.profile_path}`,
                            movies: [],
                        };
                        user.movies = result['known_for'].map((movie) => {
                            const date = new Date(movie?.release_date || movie?.first_air_date);
                            const xmovie = {
                                id: movie.id,
                                title: movie?.title || movie?.name,
                                image: `https://image.tmdb.org/t/p/original${movie?.poster_path}`,
                                type: movie.media_type === 'movie' ? models_1.TvType.MOVIE : models_1.TvType.TVSERIES,
                                rating: movie?.vote_average || 0,
                                releaseDate: `${date.getFullYear()}` || '0',
                            };
                            return xmovie;
                        });
                        return user;
                    }
                });
                return result;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * @param query search query
         * @param page page number
         */
        this.search = async (query, page = 1) => {
            const searchUrl = `${this.apiUrl}/search/multi?api_key=${this.apiKey}&language=en-US&page=${page}&include_adult=false&query=${query}`;
            const search = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            try {
                const { data } = await this.client.get(searchUrl);
                if (data.results.length < 1)
                    return search;
                search.hasNextPage = page + 1 <= data.total_pages;
                search.currentPage = page;
                search.totalResults = data.total_results;
                search.totalPages = data.total_pages;
                data.results.forEach((result) => {
                    const date = new Date(result?.release_date || result?.first_air_date);
                    const movie = {
                        id: result.id,
                        title: result?.title || result?.name,
                        image: `https://image.tmdb.org/t/p/original${result?.poster_path}`,
                        type: result.media_type === 'movie' ? models_1.TvType.MOVIE : models_1.TvType.TVSERIES,
                        rating: result?.vote_average || 0,
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
            type = type.toLowerCase() === 'movie' ? 'movie' : 'tv';
            const infoUrl = `${this.apiUrl}/${type}/${mediaId}?api_key=${this.apiKey}&language=en-US&append_to_response=release_dates,watch/providers,alternative_titles,credits,external_ids,images,keywords,recommendations,reviews,similar,translations,videos&include_image_language=en`;
            const info = {
                id: mediaId,
                title: '',
            };
            try {
                //request api to get media info from tmdb
                const { data } = await this.client.get(infoUrl);
                //get provider id from title and year (if available) to get the correct provider id for the movie/tv series (e.g. flixhq)
                const providerId = await this.findIdFromTitle(data?.title || data?.name, {
                    type: type === 'movie' ? models_1.TvType.MOVIE : models_1.TvType.TVSERIES,
                    totalSeasons: data?.number_of_seasons,
                    totalEpisodes: data?.number_of_episodes,
                    year: new Date(data?.release_year || data?.first_air_date).getFullYear(),
                });
                //fetch media info from provider
                const InfoFromProvider = await this.provider.fetchMediaInfo(providerId);
                info.id = providerId;
                //check if the movie so episode id does not show on tv shows
                if (type === 'movie')
                    info.episodeId = InfoFromProvider?.episodes[0]?.id;
                info.title = data?.title || data?.name;
                info.translations = data?.translations?.translations.map((translation) => ({
                    title: translation.data?.title || data?.name || undefined,
                    description: translation.data?.overview || undefined,
                    language: translation?.english_name || undefined,
                }));
                //images
                info.image = `https://image.tmdb.org/t/p/original${data?.poster_path}`;
                info.cover = `https://image.tmdb.org/t/p/original${data?.backdrop_path}`;
                info.logos = data?.images?.logos.map((logo) => ({
                    url: `https://image.tmdb.org/t/p/original${logo.file_path}`,
                    aspectRatio: logo?.aspect_ratio,
                    width: logo?.width,
                }));
                info.type = type === 'movie' ? models_1.TvType.MOVIE : models_1.TvType.TVSERIES;
                info.rating = data?.vote_average || 0;
                info.releaseDate = data?.release_date || data?.first_air_date;
                info.description = data?.overview;
                info.genres = data?.genres.map((genre) => genre.name);
                info.duration = data?.runtime || data?.episode_run_time[0];
                info.totalEpisodes = data?.number_of_episodes;
                info.totalSeasons = data?.number_of_seasons;
                info.directors = data?.credits?.crew
                    .filter((crew) => crew.job === 'Director')
                    .map((crew) => crew.name);
                info.writers = data?.credits?.crew
                    .filter((crew) => crew.job === 'Screenplay')
                    .map((crew) => crew.name);
                info.actors = data?.credits?.cast.map((cast) => cast.name);
                info.characters = data?.credits?.cast.map((cast) => ({
                    id: cast.id,
                    name: cast.name,
                    url: `https://www.themoviedb.org/person/${cast.id}`,
                    character: cast.character,
                    image: `https://image.tmdb.org/t/p/original${cast.profile_path}`,
                }));
                info.trailer = {
                    id: data?.videos?.results[0]?.key,
                    site: data?.videos?.results[0]?.site,
                    url: `https://www.youtube.com/watch?v=${data?.videos?.results[0]?.key}`,
                };
                info.mappings = {
                    imdb: data?.external_ids?.imdb_id || undefined,
                    tmdb: data?.id || undefined,
                };
                info.similar =
                    data?.similar?.results?.length <= 0
                        ? undefined
                        : data?.similar?.results.map((result) => {
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
                    data?.recommendations?.results?.length <= 0
                        ? undefined
                        : data?.recommendations?.results.map((result) => {
                            return {
                                id: result.id,
                                title: result.title || result.name,
                                image: `https://image.tmdb.org/t/p/original${result.poster_path}`,
                                type: type === 'movie' ? models_1.TvType.MOVIE : models_1.TvType.TVSERIES,
                                rating: result.vote_average || 0,
                                releaseDate: result.release_date || result.first_air_date,
                            };
                        });
                const totalSeasons = info?.totalSeasons || 0;
                if (type === 'tv' && totalSeasons > 0) {
                    const seasonUrl = (season) => `${this.apiUrl}/tv/${mediaId}/season/${season}?api_key=${this.apiKey}`;
                    info.seasons = [];
                    const seasons = info.seasons;
                    const providerEpisodes = InfoFromProvider?.episodes;
                    if (providerEpisodes?.length < 1)
                        return info;
                    info.nextAiringEpisode = data?.next_episode_to_air
                        ? {
                            season: data.next_episode_to_air?.season_number || undefined,
                            episode: data.next_episode_to_air?.episode_number || undefined,
                            releaseDate: data.next_episode_to_air?.air_date || undefined,
                            title: data.next_episode_to_air?.name || undefined,
                            description: data.next_episode_to_air?.overview || undefined,
                            runtime: data.next_episode_to_air?.runtime || undefined,
                        }
                        : undefined;
                    for (let i = 1; i <= totalSeasons; i++) {
                        const { data: seasonData } = await this.client.get(seasonUrl(i.toString()));
                        //find season in each episode (providerEpisodes)
                        const seasonEpisodes = providerEpisodes?.filter(episode => episode.season === i);
                        const episodes = seasonData?.episodes?.length <= 0
                            ? undefined
                            : seasonData?.episodes.map((episode) => {
                                //find episode in each season (seasonEpisodes)
                                const episodeFromProvider = seasonEpisodes?.find(ep => ep.number === episode.episode_number);
                                return {
                                    id: episodeFromProvider?.id,
                                    title: episode.name,
                                    episode: episode.episode_number,
                                    season: episode.season_number,
                                    releaseDate: episode.air_date,
                                    description: episode.overview,
                                    url: episodeFromProvider?.url || undefined,
                                    img: !episode?.still_path
                                        ? undefined
                                        : {
                                            mobile: `https://image.tmdb.org/t/p/w300${episode.still_path}`,
                                            hd: `https://image.tmdb.org/t/p/w780${episode.still_path}`,
                                        },
                                };
                            });
                        seasons.push({
                            season: i,
                            image: !seasonData?.poster_path
                                ? undefined
                                : {
                                    mobile: `https://image.tmdb.org/t/p/w300${seasonData.poster_path}`,
                                    hd: `https://image.tmdb.org/t/p/w780${seasonData.poster_path}`,
                                },
                            episodes,
                            isReleased: seasonData?.episodes[0]?.air_date > new Date().toISOString() ? false : true,
                        });
                    }
                }
            }
            catch (err) {
                throw new Error(err.message);
            }
            return info;
        };
        /**
         * Find the id of a media from its title. and extra data. (year, totalSeasons, totalEpisodes)
         * @param title
         * @param extraData
         * @returns id of the media
         */
        this.findIdFromTitle = async (title, extraData) => {
            //clean title
            title = title.replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase();
            const findMedia = (await this.provider.search(title));
            if (findMedia.results.length === 0)
                return '';
            // console.log(findMedia.results);
            // console.log(extraData);
            // Sort the retrieved info for more accurate results.
            findMedia.results.sort((a, b) => {
                const targetTitle = title;
                let firstTitle;
                let secondTitle;
                if (typeof a.title == 'string')
                    firstTitle = a?.title;
                else
                    firstTitle = a?.title ?? '';
                if (typeof b.title == 'string')
                    secondTitle = b.title;
                else
                    secondTitle = b?.title ?? '';
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
                    return String(result.releaseDate).split('-')[0].trim() === String(extraData.year).trim();
                });
            }
            // console.log({ test1: findMedia.results });
            // Check if the result contains the total number of seasons and compare it to the extraData.
            // Allow for a range of ±2 seasons and ensure that the seasons value is a number.
            if (extraData && extraData.totalSeasons && extraData.type === models_1.TvType.TVSERIES) {
                findMedia.results = findMedia.results.filter(result => {
                    const totalSeasons = result.seasons || 0;
                    const extraDataSeasons = extraData.totalSeasons || 0;
                    return totalSeasons >= extraDataSeasons - 2 && totalSeasons <= extraDataSeasons + 2;
                });
            }
            // console.log(findMedia.results);
            return findMedia?.results[0]?.id || undefined;
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
        this.provider = provider || new himovies_1.default();
    }
}
exports.default = TMDB;
//# sourceMappingURL=tmdb.js.map