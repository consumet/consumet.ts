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
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../../models");
const utils_1 = require("../../utils");
const gogoanime_1 = __importDefault(require("../../providers/anime/gogoanime"));
const enime_1 = __importDefault(require("../anime/enime"));
class Anilist extends models_1.AnimeParser {
    /**
     * This class maps anilist to kitsu with any other anime provider.
     * kitsu is used for episode images, titles and description.
     * @param provider anime provider (optional) default: Gogoanime
     */
    constructor(provider) {
        super();
        this.name = 'AnilistWithKitsu';
        this.baseUrl = 'https://anilist.co';
        this.logo = 'https://upload.wikimedia.org/wikipedia/commons/6/61/AniList_logo.svg';
        this.classPath = 'META.Anilist';
        this.anilistGraphqlUrl = 'https://graphql.anilist.co';
        this.kitsuGraphqlUrl = 'https://kitsu.io/api/graphql';
        this.malSyncUrl = 'https://api.malsync.moe';
        this.enimeUrl = 'https://api.enime.moe';
        /**
         * @param query Search query
         * @param page Page number (optional)
         * @param perPage Number of results per page (optional) (default: 15) (max: 50)
         */
        this.search = (query, page = 1, perPage = 15) => __awaiter(this, void 0, void 0, function* () {
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: (0, utils_1.anilistSearchQuery)(query, page, perPage),
            };
            try {
                const { data } = yield axios_1.default.post(this.anilistGraphqlUrl, options);
                const res = {
                    currentPage: data.data.Page.pageInfo.currentPage,
                    hasNextPage: data.data.Page.pageInfo.hasNextPage,
                    results: data.data.Page.media.map((item) => {
                        var _a, _b;
                        return ({
                            id: item.id.toString(),
                            malId: item.idMal,
                            title: {
                                romaji: item.title.romaji,
                                english: item.title.english,
                                native: item.title.native,
                                userPreferred: item.title.userPreferred,
                            } || item.title.romaji,
                            status: item.status == 'RELEASING'
                                ? models_1.MediaStatus.ONGOING
                                : item.status == 'FINISHED'
                                    ? models_1.MediaStatus.COMPLETED
                                    : item.status == 'NOT_YET_RELEASED'
                                        ? models_1.MediaStatus.NOT_YET_AIRED
                                        : item.status == 'CANCELLED'
                                            ? models_1.MediaStatus.CANCELLED
                                            : item.status == 'HIATUS'
                                                ? models_1.MediaStatus.HIATUS
                                                : models_1.MediaStatus.UNKNOWN,
                            image: (_b = (_a = item.coverImage.extraLarge) !== null && _a !== void 0 ? _a : item.coverImage.large) !== null && _b !== void 0 ? _b : item.coverImage.medium,
                            rating: item.averageScore,
                            releaseDate: item.seasonYear,
                        });
                    }),
                };
                return res;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        /**
         *
         * @param query Search query (optional)
         * @param type Media type (optional) (default: `ANIME`) (options: `ANIME`, `MANGA`)
         * @param page Page number (optional)
         * @param perPage Number of results per page (optional) (default: `20`) (max: `50`)
         * @param format Format (optional) (options: `TV`, `TV_SHORT`, `MOVIE`, `SPECIAL`, `OVA`, `ONA`, `MUSIC`)
         * @param sort Sort (optional) (Default: `[POPULARITY_DESC, SCORE_DESC]`) (options: `POPULARITY_DESC`, `POPULARITY`, `TRENDING_DESC`, `TRENDING`, `UPDATED_AT_DESC`, `UPDATED_AT`, `START_DATE_DESC`, `START_DATE`, `END_DATE_DESC`, `END_DATE`, `FAVOURITES_DESC`, `FAVOURITES`, `SCORE_DESC`, `SCORE`, `TITLE_ROMAJI_DESC`, `TITLE_ROMAJI`, `TITLE_ENGLISH_DESC`, `TITLE_ENGLISH`, `TITLE_NATIVE_DESC`, `TITLE_NATIVE`, `EPISODES_DESC`, `EPISODES`, `ID`, `ID_DESC`)
         * @param genres Genres (optional) (options: `Action`, `Adventure`, `Cars`, `Comedy`, `Drama`, `Fantasy`, `Horror`, `Mahou Shoujo`, `Mecha`, `Music`, `Mystery`, `Psychological`, `Romance`, `Sci-Fi`, `Slice of Life`, `Sports`, `Supernatural`, `Thriller`)
         * @param id anilist Id (optional)
         */
        this.advancedSearch = (query, type = 'ANIME', page = 1, perPage = 20, format, sort, genres, id) => __awaiter(this, void 0, void 0, function* () {
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: (0, utils_1.anilistAdvancedQuery)(),
                variables: {
                    search: query,
                    type: type,
                    page: page,
                    size: perPage,
                    format: format,
                    sort: sort,
                    genres: genres,
                    id: id,
                },
            };
            if (genres) {
                genres.forEach(genre => {
                    if (!Object.values(models_1.Genres).includes(genre)) {
                        throw new Error(`genre ${genre} is not valid`);
                    }
                });
            }
            try {
                const { data } = yield axios_1.default.post(this.anilistGraphqlUrl, options);
                const res = {
                    currentPage: data.data.Page.pageInfo.currentPage,
                    hasNextPage: data.data.Page.pageInfo.hasNextPage,
                    totalPages: data.data.Page.pageInfo.lastPage,
                    totalResults: data.data.Page.pageInfo.total,
                    results: data.data.Page.media.map((item) => {
                        var _a, _b;
                        return ({
                            id: item.id.toString(),
                            malId: item.idMal,
                            title: {
                                romaji: item.title.romaji,
                                english: item.title.english,
                                native: item.title.native,
                                userPreferred: item.title.userPreferred,
                            } || item.title.romaji,
                            status: item.status == 'RELEASING'
                                ? models_1.MediaStatus.ONGOING
                                : item.status == 'FINISHED'
                                    ? models_1.MediaStatus.COMPLETED
                                    : item.status == 'NOT_YET_RELEASED'
                                        ? models_1.MediaStatus.NOT_YET_AIRED
                                        : item.status == 'CANCELLED'
                                            ? models_1.MediaStatus.CANCELLED
                                            : item.status == 'HIATUS'
                                                ? models_1.MediaStatus.HIATUS
                                                : models_1.MediaStatus.UNKNOWN,
                            image: (_b = (_a = item.coverImage.extraLarge) !== null && _a !== void 0 ? _a : item.coverImage.large) !== null && _b !== void 0 ? _b : item.coverImage.medium,
                            rating: item.averageScore,
                            releaseDate: item.seasonYear,
                        });
                    }),
                };
                return res;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        /**
         *
         * @param id Anime id
         * @param dub to get dubbed episodes (optional) set to `true` to get dubbed episodes. **ONLY WORKS FOR GOGOANIME**
         */
        this.fetchAnimeInfo = (id, dub = false) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            const animeInfo = {
                id: id,
                title: '',
            };
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: (0, utils_1.anilistMediaDetailQuery)(id),
            };
            try {
                const { data } = yield axios_1.default.post(this.anilistGraphqlUrl, options).catch(() => {
                    throw new Error('Media not found');
                });
                animeInfo.malId = data.data.Media.idMal;
                animeInfo.title = {
                    romaji: data.data.Media.title.romaji,
                    english: data.data.Media.title.english,
                    native: data.data.Media.title.native,
                    userPreferred: data.data.Media.title.userPreferred,
                };
                if ((_a = data.data.Media.trailer) === null || _a === void 0 ? void 0 : _a.id) {
                    animeInfo.trailer = {
                        id: (_b = data.data.Media.trailer) === null || _b === void 0 ? void 0 : _b.id,
                        site: (_c = data.data.Media.trailer) === null || _c === void 0 ? void 0 : _c.site,
                        thumbnail: (_d = data.data.Media.trailer) === null || _d === void 0 ? void 0 : _d.thumbnail,
                    };
                }
                animeInfo.image =
                    (_f = (_e = data.data.Media.coverImage.extraLarge) !== null && _e !== void 0 ? _e : data.data.Media.coverImage.large) !== null && _f !== void 0 ? _f : data.data.Media.coverImage.medium;
                animeInfo.cover = (_g = data.data.Media.bannerImage) !== null && _g !== void 0 ? _g : animeInfo.image;
                animeInfo.description = data.data.Media.description;
                switch (data.data.Media.status) {
                    case 'RELEASING':
                        animeInfo.status = models_1.MediaStatus.ONGOING;
                        break;
                    case 'FINISHED':
                        animeInfo.status = models_1.MediaStatus.COMPLETED;
                        break;
                    case 'NOT_YET_RELEASED':
                        animeInfo.status = models_1.MediaStatus.NOT_YET_AIRED;
                        break;
                    case 'CANCELLED':
                        animeInfo.status = models_1.MediaStatus.CANCELLED;
                        break;
                    case 'HIATUS':
                        animeInfo.status = models_1.MediaStatus.HIATUS;
                    default:
                        animeInfo.status = models_1.MediaStatus.UNKNOWN;
                }
                animeInfo.releaseDate = data.data.Media.startDate.year;
                if ((_h = data.data.Media.nextAiringEpisode) === null || _h === void 0 ? void 0 : _h.airingAt)
                    animeInfo.nextAiringEpisode = {
                        airingTime: (_j = data.data.Media.nextAiringEpisode) === null || _j === void 0 ? void 0 : _j.airingAt,
                        timeUntilAiring: (_k = data.data.Media.nextAiringEpisode) === null || _k === void 0 ? void 0 : _k.timeUntilAiring,
                        episode: (_l = data.data.Media.nextAiringEpisode) === null || _l === void 0 ? void 0 : _l.episode,
                    };
                animeInfo.rating = data.data.Media.averageScore;
                animeInfo.duration = data.data.Media.duration;
                animeInfo.genres = data.data.Media.genres;
                animeInfo.studios = data.data.Media.studios.edges.map((item) => item.node.name);
                animeInfo.subOrDub = dub ? models_1.SubOrSub.DUB : models_1.SubOrSub.SUB;
                animeInfo.recommendations = data.data.Media.recommendations.edges.map((item) => {
                    var _a, _b, _c, _d, _e;
                    return ({
                        id: item.node.mediaRecommendation.id,
                        malId: item.node.mediaRecommendation.idMal,
                        title: {
                            romaji: item.node.mediaRecommendation.title.romaji,
                            english: item.node.mediaRecommendation.title.english,
                            native: item.node.mediaRecommendation.title.native,
                            userPreferred: item.node.mediaRecommendation.title.userPreferred,
                        },
                        status: item.node.mediaRecommendation.status == 'RELEASING'
                            ? models_1.MediaStatus.ONGOING
                            : item.node.mediaRecommendation.status == 'FINISHED'
                                ? models_1.MediaStatus.COMPLETED
                                : item.node.mediaRecommendation.status == 'NOT_YET_RELEASED'
                                    ? models_1.MediaStatus.NOT_YET_AIRED
                                    : item.node.mediaRecommendation.status == 'CANCELLED'
                                        ? models_1.MediaStatus.CANCELLED
                                        : item.node.mediaRecommendation.status == 'HIATUS'
                                            ? models_1.MediaStatus.HIATUS
                                            : models_1.MediaStatus.UNKNOWN,
                        episodes: item.node.mediaRecommendation.episodes,
                        image: (_b = (_a = item.node.mediaRecommendation.coverImage.extraLarge) !== null && _a !== void 0 ? _a : item.node.mediaRecommendation.coverImage.large) !== null && _b !== void 0 ? _b : item.node.mediaRecommendation.coverImage.medium,
                        cover: (_e = (_d = (_c = item.node.mediaRecommendation.bannerImage) !== null && _c !== void 0 ? _c : item.node.mediaRecommendation.coverImage.extraLarge) !== null && _d !== void 0 ? _d : item.node.mediaRecommendation.coverImage.large) !== null && _e !== void 0 ? _e : item.node.mediaRecommendation.coverImage.medium,
                        score: item.node.mediaRecommendation.meanScore,
                    });
                });
                const possibleAnimeEpisodes = yield this.findAnime({ english: (_m = animeInfo.title) === null || _m === void 0 ? void 0 : _m.english, romaji: (_o = animeInfo.title) === null || _o === void 0 ? void 0 : _o.romaji }, data.data.Media.season, data.data.Media.startDate.year, animeInfo.malId, dub, animeInfo.id);
                animeInfo.episodes = possibleAnimeEpisodes === null || possibleAnimeEpisodes === void 0 ? void 0 : possibleAnimeEpisodes.map((episode) => {
                    if (!episode.image) {
                        episode.image = animeInfo.image;
                    }
                    return episode;
                });
                return animeInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        /**
         *
         * @param episodeId Episode id
         */
        this.fetchEpisodeSources = (episodeId) => __awaiter(this, void 0, void 0, function* () {
            if (episodeId.includes('enime'))
                return new enime_1.default().fetchEpisodeSources(episodeId);
            return this.provider.fetchEpisodeSources(episodeId);
        });
        /**
         *
         * @param episodeId Episode id
         */
        this.fetchEpisodeServers = (episodeId) => __awaiter(this, void 0, void 0, function* () {
            return this.provider.fetchEpisodeServers(episodeId);
        });
        this.findAnime = (title, season, startDate, malId, dub, anilistId) => __awaiter(this, void 0, void 0, function* () {
            var _p, _q;
            title.english = (_p = title.english) !== null && _p !== void 0 ? _p : title.romaji;
            title.romaji = (_q = title.romaji) !== null && _q !== void 0 ? _q : title.english;
            title.english = title.english.toLowerCase();
            title.romaji = title.romaji.toLowerCase();
            if (title.english === title.romaji) {
                return yield this.findAnimeSlug(title.english, season, startDate, malId, dub, anilistId);
            }
            const romajiPossibleEpisodes = this.findAnimeSlug(title.romaji, season, startDate, malId, dub, anilistId);
            if (romajiPossibleEpisodes) {
                return romajiPossibleEpisodes;
            }
            const englishPossibleEpisodes = this.findAnimeSlug(title.english, season, startDate, malId, dub, anilistId);
            return englishPossibleEpisodes;
        });
        this.findAnimeSlug = (title, season, startDate, malId, dub, anilistId) => __awaiter(this, void 0, void 0, function* () {
            if (this.provider instanceof enime_1.default)
                return (yield this.provider.fetchAnimeInfoByAnilistId(anilistId)).episodes;
            const slug = title.replace(/[^0-9a-zA-Z]+/g, ' ');
            let possibleAnime;
            if (malId) {
                const malAsyncReq = yield (0, axios_1.default)({
                    method: 'GET',
                    url: `${this.malSyncUrl}/mal/anime/${malId}`,
                    validateStatus: () => true,
                });
                if (malAsyncReq.status === 200) {
                    const sitesT = malAsyncReq.data.Sites;
                    let sites = Object.values(sitesT).map((v, i) => {
                        const obj = [...Object.values(Object.values(sitesT)[i])];
                        const pages = obj.map(v => ({ page: v.page, url: v.url, title: v.title }));
                        return pages;
                    });
                    sites = sites.flat();
                    const possibleSource = sites.find(s => s.page.toLowerCase() === this.provider.name.toLowerCase() &&
                        (dub ? s.title.toLowerCase().includes('dub') : !s.title.toLowerCase().includes('dub')));
                    if (possibleSource)
                        possibleAnime = yield this.provider.fetchAnimeInfo(possibleSource.url.split('/').pop());
                    else
                        possibleAnime = yield this.findAnimeRaw(slug);
                }
                else
                    possibleAnime = yield this.findAnimeRaw(slug);
            }
            else
                possibleAnime = yield this.findAnimeRaw(slug);
            const possibleProviderEpisodes = possibleAnime.episodes;
            const options = {
                headers: { 'Content-Type': 'application/json' },
                query: (0, utils_1.kitsuSearchQuery)(slug),
            };
            const newEpisodeList = yield this.findKitsuAnime(possibleProviderEpisodes, options, season, startDate);
            return newEpisodeList;
        });
        this.findKitsuAnime = (possibleProviderEpisodes, options, season, startDate) => __awaiter(this, void 0, void 0, function* () {
            const kitsuEpisodes = yield axios_1.default.post(this.kitsuGraphqlUrl, options);
            const episodesList = new Map();
            if (kitsuEpisodes === null || kitsuEpisodes === void 0 ? void 0 : kitsuEpisodes.data.data) {
                const { nodes } = kitsuEpisodes.data.data.searchAnimeByTitle;
                if (nodes) {
                    nodes.forEach((node) => {
                        var _a, _b;
                        if (node.season === season && node.startDate.trim().split('-')[0] === (startDate === null || startDate === void 0 ? void 0 : startDate.toString())) {
                            const episodes = node.episodes.nodes;
                            for (const episode of episodes) {
                                const i = episode === null || episode === void 0 ? void 0 : episode.number.toString().replace(/"/g, '');
                                let name = undefined;
                                let description = undefined;
                                let thumbnail = undefined;
                                if ((_a = episode === null || episode === void 0 ? void 0 : episode.description) === null || _a === void 0 ? void 0 : _a.en)
                                    description = episode === null || episode === void 0 ? void 0 : episode.description.en.toString().replace(/"/g, '').replace('\\n', '\n');
                                if (episode === null || episode === void 0 ? void 0 : episode.thumbnail)
                                    thumbnail = episode === null || episode === void 0 ? void 0 : episode.thumbnail.original.url.toString().replace(/"/g, '');
                                if (episode) {
                                    if ((_b = episode.titles) === null || _b === void 0 ? void 0 : _b.canonical)
                                        name = episode.titles.canonical.toString().replace(/"/g, '');
                                    episodesList.set(i, {
                                        episodeNum: episode === null || episode === void 0 ? void 0 : episode.number.toString().replace(/"/g, ''),
                                        title: name,
                                        description,
                                        thumbnail,
                                    });
                                    continue;
                                }
                                episodesList.set(i, {
                                    episodeNum: undefined,
                                    title: undefined,
                                    description: undefined,
                                    thumbnail,
                                });
                            }
                        }
                    });
                }
            }
            const newEpisodeList = [];
            if ((possibleProviderEpisodes === null || possibleProviderEpisodes === void 0 ? void 0 : possibleProviderEpisodes.length) !== 0) {
                possibleProviderEpisodes === null || possibleProviderEpisodes === void 0 ? void 0 : possibleProviderEpisodes.forEach((ep, i) => {
                    var _a, _b, _c, _d, _e, _f, _g;
                    const j = (i + 1).toString();
                    newEpisodeList.push({
                        id: ep.id,
                        title: (_b = (_a = episodesList.get(j)) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : null,
                        image: (_d = (_c = episodesList.get(j)) === null || _c === void 0 ? void 0 : _c.thumbnail) !== null && _d !== void 0 ? _d : null,
                        number: ep.number,
                        description: (_f = (_e = episodesList.get(j)) === null || _e === void 0 ? void 0 : _e.description) !== null && _f !== void 0 ? _f : null,
                        url: (_g = ep.url) !== null && _g !== void 0 ? _g : null,
                    });
                });
            }
            return newEpisodeList;
        });
        /**
         * @param page page number to search for (optional)
         * @param perPage number of results per page (optional)
         */
        this.fetchTrendingAnime = (page = 1, perPage = 10) => __awaiter(this, void 0, void 0, function* () {
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: (0, utils_1.anilistTrendingAnimeQuery)(page, perPage),
            };
            try {
                const { data } = yield axios_1.default.post(this.anilistGraphqlUrl, options);
                const res = {
                    currentPage: data.data.Page.pageInfo.currentPage,
                    hasNextPage: data.data.Page.pageInfo.hasNextPage,
                    results: data.data.Page.media.map((item) => {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                        return ({
                            id: item.id.toString(),
                            malId: item.idMal,
                            title: {
                                romaji: item.title.romaji,
                                english: item.title.english,
                                native: item.title.native,
                                userPreferred: item.title.userPreferred,
                            } || item.title.romaji,
                            image: (_b = (_a = item.coverImage.extraLarge) !== null && _a !== void 0 ? _a : item.coverImage.large) !== null && _b !== void 0 ? _b : item.coverImage.medium,
                            trailer: {
                                id: (_c = item.trailer) === null || _c === void 0 ? void 0 : _c.id,
                                site: (_d = item.trailer) === null || _d === void 0 ? void 0 : _d.site,
                                thumbnail: (_e = item.trailer) === null || _e === void 0 ? void 0 : _e.thumbnail,
                            },
                            description: item.description,
                            status: item.status == 'RELEASING'
                                ? models_1.MediaStatus.ONGOING
                                : item.status == 'FINISHED'
                                    ? models_1.MediaStatus.COMPLETED
                                    : item.status == 'NOT_YET_RELEASED'
                                        ? models_1.MediaStatus.NOT_YET_AIRED
                                        : item.status == 'CANCELLED'
                                            ? models_1.MediaStatus.CANCELLED
                                            : item.status == 'HIATUS'
                                                ? models_1.MediaStatus.HIATUS
                                                : models_1.MediaStatus.UNKNOWN,
                            cover: (_h = (_g = (_f = item.bannerImage) !== null && _f !== void 0 ? _f : item.coverImage.extraLarge) !== null && _g !== void 0 ? _g : item.coverImage.large) !== null && _h !== void 0 ? _h : item.coverImage.medium,
                            rating: item.averageScore,
                            releaseDate: item.seasonYear,
                            genres: item.genres,
                            totalEpisodes: isNaN(item.episodes) ? 0 : (_l = (_j = item.episodes) !== null && _j !== void 0 ? _j : ((_k = item.nextAiringEpisode) === null || _k === void 0 ? void 0 : _k.episode) - 1) !== null && _l !== void 0 ? _l : 0,
                            duration: item.duration,
                            type: item.format,
                        });
                    }),
                };
                return res;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        /**
         *
         * @param page page number to search for (optional)
         * @param perPage number of results per page (optional)
         */
        this.fetchPopularAnime = (page = 1, perPage = 10) => __awaiter(this, void 0, void 0, function* () {
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: (0, utils_1.anilistPopularAnimeQuery)(page, perPage),
            };
            try {
                const { data } = yield axios_1.default.post(this.anilistGraphqlUrl, options);
                const res = {
                    currentPage: data.data.Page.pageInfo.currentPage,
                    hasNextPage: data.data.Page.pageInfo.hasNextPage,
                    results: data.data.Page.media.map((item) => {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                        return ({
                            id: item.id.toString(),
                            malId: item.idMal,
                            title: {
                                romaji: item.title.romaji,
                                english: item.title.english,
                                native: item.title.native,
                                userPreferred: item.title.userPreferred,
                            } || item.title.romaji,
                            image: (_b = (_a = item.coverImage.extraLarge) !== null && _a !== void 0 ? _a : item.coverImage.large) !== null && _b !== void 0 ? _b : item.coverImage.medium,
                            trailer: {
                                id: (_c = item.trailer) === null || _c === void 0 ? void 0 : _c.id,
                                site: (_d = item.trailer) === null || _d === void 0 ? void 0 : _d.site,
                                thumbnail: (_e = item.trailer) === null || _e === void 0 ? void 0 : _e.thumbnail,
                            },
                            description: item.description,
                            status: item.status == 'RELEASING'
                                ? models_1.MediaStatus.ONGOING
                                : item.status == 'FINISHED'
                                    ? models_1.MediaStatus.COMPLETED
                                    : item.status == 'NOT_YET_RELEASED'
                                        ? models_1.MediaStatus.NOT_YET_AIRED
                                        : item.status == 'CANCELLED'
                                            ? models_1.MediaStatus.CANCELLED
                                            : item.status == 'HIATUS'
                                                ? models_1.MediaStatus.HIATUS
                                                : models_1.MediaStatus.UNKNOWN,
                            cover: (_h = (_g = (_f = item.bannerImage) !== null && _f !== void 0 ? _f : item.coverImage.extraLarge) !== null && _g !== void 0 ? _g : item.coverImage.large) !== null && _h !== void 0 ? _h : item.coverImage.medium,
                            rating: item.averageScore,
                            releaseDate: item.seasonYear,
                            genres: item.genres,
                            totalEpisodes: isNaN(item.episodes) ? 0 : (_l = (_j = item.episodes) !== null && _j !== void 0 ? _j : ((_k = item.nextAiringEpisode) === null || _k === void 0 ? void 0 : _k.episode) - 1) !== null && _l !== void 0 ? _l : 0,
                            duration: item.duration,
                            type: item.format,
                        });
                    }),
                };
                return res;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        /**
         *
         * @param page page number (optional)
         * @param perPage number of results per page (optional)
         * @param weekStart Filter by the time in epoch seconds (optional) eg. if you set weekStart to this week's monday, and set weekEnd to next week's sunday, you will get all the airing anime in between these two dates.
         * @param weekEnd Filter by the time in epoch seconds (optional)
         * @param notYetAired if true will return anime that have not yet aired (optional)
         * @returns the next airing episodes
         */
        this.fetchAiringSchedule = (page = 1, perPage = 20, weekStart = Math.floor(new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)).getTime() / 1000), weekEnd = Math.floor((new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)).getTime() + 6.048e8) /
            1000), notYetAired = false) => __awaiter(this, void 0, void 0, function* () {
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: (0, utils_1.anilistAiringScheduleQuery)(page, perPage, weekStart, weekEnd, notYetAired),
            };
            try {
                const { data } = yield axios_1.default.post(this.anilistGraphqlUrl, options);
                const res = {
                    currentPage: data.data.Page.pageInfo.currentPage,
                    hasNextPage: data.data.Page.pageInfo.hasNextPage,
                    results: data.data.Page.airingSchedules.map((item) => {
                        var _a, _b, _c, _d, _e;
                        return ({
                            id: item.media.id.toString(),
                            malId: item.media.idMal,
                            episode: item.episode,
                            airingAt: item.airingAt,
                            title: {
                                romaji: item.media.title.romaji,
                                english: item.media.title.english,
                                native: item.media.title.native,
                                userPreferred: item.media.title.userPreferred,
                            } || item.media.title.romaji,
                            country: item.media.countryOfOrigin,
                            image: (_b = (_a = item.media.coverImage.extraLarge) !== null && _a !== void 0 ? _a : item.media.coverImage.large) !== null && _b !== void 0 ? _b : item.media.coverImage.medium,
                            description: item.media.description,
                            cover: (_e = (_d = (_c = item.media.bannerImage) !== null && _c !== void 0 ? _c : item.media.coverImage.extraLarge) !== null && _d !== void 0 ? _d : item.media.coverImage.large) !== null && _e !== void 0 ? _e : item.media.coverImage.medium,
                            genres: item.genres,
                            rating: item.media.averageScore,
                            releaseDate: item.media.seasonYear,
                            type: item.media.format,
                        });
                    }),
                };
                return res;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        /**
         *
         * @param genres An array of genres to filter by (optional) genres: [`Action`, `Adventure`, `Cars`, `Comedy`, `Drama`, `Fantasy`, `Horror`, `Mahou Shoujo`, `Mecha`, `Music`, `Mystery`, `Psychological`, `Romance`, `Sci-Fi`, `Slice of Life`, `Sports`, `Supernatural`, `Thriller`]
         * @param page page number (optional)
         * @param perPage number of results per page (optional)
         */
        this.fetchAnimeGenres = (genres, page = 1, perPage = 20) => __awaiter(this, void 0, void 0, function* () {
            if (genres.length === 0)
                throw new Error('No genres specified');
            for (const genre of genres)
                if (!Object.values(models_1.Genres).includes(genre))
                    throw new Error('Invalid genre');
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: (0, utils_1.anilistGenresQuery)(genres, page, perPage),
            };
            try {
                const { data } = yield axios_1.default.post(this.anilistGraphqlUrl, options);
                const res = {
                    currentPage: data.data.Page.pageInfo.currentPage,
                    hasNextPage: data.data.Page.pageInfo.hasNextPage,
                    results: data.data.Page.media.map((item) => {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                        return ({
                            id: item.id.toString(),
                            malId: item.idMal,
                            title: {
                                romaji: item.title.romaji,
                                english: item.title.english,
                                native: item.title.native,
                                userPreferred: item.title.userPreferred,
                            } || item.title.romaji,
                            image: (_b = (_a = item.coverImage.extraLarge) !== null && _a !== void 0 ? _a : item.coverImage.large) !== null && _b !== void 0 ? _b : item.coverImage.medium,
                            trailer: {
                                id: (_c = item.trailer) === null || _c === void 0 ? void 0 : _c.id,
                                site: (_d = item.trailer) === null || _d === void 0 ? void 0 : _d.site,
                                thumbnail: (_e = item.trailer) === null || _e === void 0 ? void 0 : _e.thumbnail,
                            },
                            description: item.description,
                            cover: (_h = (_g = (_f = item.bannerImage) !== null && _f !== void 0 ? _f : item.coverImage.extraLarge) !== null && _g !== void 0 ? _g : item.coverImage.large) !== null && _h !== void 0 ? _h : item.coverImage.medium,
                            rating: item.averageScore,
                            releaseDate: item.seasonYear,
                            genres: item.genres,
                            totalEpisodes: isNaN(item.episodes) ? 0 : (_l = (_j = item.episodes) !== null && _j !== void 0 ? _j : ((_k = item.nextAiringEpisode) === null || _k === void 0 ? void 0 : _k.episode) - 1) !== null && _l !== void 0 ? _l : 0,
                            duration: item.duration,
                            type: item.format,
                        });
                    }),
                };
                return res;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        this.findAnimeRaw = (slug) => __awaiter(this, void 0, void 0, function* () {
            const findAnime = (yield this.provider.search(slug));
            if (findAnime.results.length === 0)
                return [];
            return (yield this.provider.fetchAnimeInfo(findAnime.results[0].id));
        });
        /**
         * @returns a random anime
         */
        this.fetchRandomAnime = () => __awaiter(this, void 0, void 0, function* () {
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: (0, utils_1.anilistSiteStatisticsQuery)(),
            };
            try {
                const { data: { data }, } = yield axios_1.default.post(this.anilistGraphqlUrl, options);
                const selectedAnime = Math.floor(Math.random() * data.SiteStatistics.anime.nodes[data.SiteStatistics.anime.nodes.length - 1].count);
                const { results } = yield this.advancedSearch(undefined, 'ANIME', Math.ceil(selectedAnime / 50), 50);
                return yield this.fetchAnimeInfo(results[selectedAnime % 50].id);
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        /**
         * @param provider The provider to get the episode Ids from (optional) default: `gogoanime` (options: `gogoanime`, `zoro`)
         * @param page page number (optional)
         * @param perPage number of results per page (optional)
         */
        this.fetchRecentEpisodes = (provider = 'gogoanime', page = 1, perPage = 15) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { data: { data, meta }, } = yield axios_1.default.get(`${this.enimeUrl}/recent?page=${page}&perPage=${perPage}`);
                let results = data.map((item) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                    return ({
                        id: item.anime.anilistId.toString(),
                        malId: (_a = item.anime.mappings) === null || _a === void 0 ? void 0 : _a.mal,
                        title: {
                            romaji: (_b = item.anime.title) === null || _b === void 0 ? void 0 : _b.romaji,
                            english: (_c = item.anime.title) === null || _c === void 0 ? void 0 : _c.english,
                            native: (_d = item.anime.title) === null || _d === void 0 ? void 0 : _d.native,
                            userPreferred: (_e = item.anime.title) === null || _e === void 0 ? void 0 : _e.userPreferred,
                        },
                        image: (_f = item.anime.coverImage) !== null && _f !== void 0 ? _f : item.anime.bannerImage,
                        rating: item.anime.averageScore,
                        episodeId: `${provider === 'gogoanime'
                            ? (_g = item.sources.find((source) => source.website.toLowerCase() === 'gogoanime')) === null || _g === void 0 ? void 0 : _g.id
                            : (_h = item.sources.find((source) => source.website.toLowerCase() === 'zoro')) === null || _h === void 0 ? void 0 : _h.id}-enime`,
                        episodeTitle: (_j = item.title) !== null && _j !== void 0 ? _j : `Episode ${item.number}`,
                        episodeNumber: item.number,
                        genres: item.anime.genre,
                    });
                });
                results = results.filter((item) => item.episodeNumber !== 0 && item.episodeId.replace('-enime', '').length > 0);
                return {
                    currentPage: page,
                    hasNextPage: meta.lastPage !== page,
                    totalPages: meta.lastPage,
                    totalResults: meta.total,
                    results: results,
                };
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        this.provider = provider || new gogoanime_1.default();
    }
}
exports.default = Anilist;
//# sourceMappingURL=anilist.js.map