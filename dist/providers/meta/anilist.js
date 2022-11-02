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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../../models");
const utils_1 = require("../../utils");
const gogoanime_1 = __importDefault(require("../../providers/anime/gogoanime"));
const enime_1 = __importDefault(require("../anime/enime"));
const zoro_1 = __importDefault(require("../anime/zoro"));
const mangasee123_1 = __importDefault(require("../manga/mangasee123"));
const crunchyroll_1 = __importDefault(require("../anime/crunchyroll"));
const bilibili_1 = __importDefault(require("../anime/bilibili"));
class Anilist extends models_1.AnimeParser {
    /**
     * This class maps anilist to kitsu with any other anime provider.
     * kitsu is used for episode images, titles and description.
     * @param provider anime provider (optional) default: Gogoanime
     */
    constructor(provider, proxyConfig) {
        super();
        this.proxyConfig = proxyConfig;
        this.name = 'Anilist';
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
            var _b, _c;
            const options = Object.assign({ headers: Object.assign({ 'Content-Type': 'application/json', Accept: 'application/json' }, Object.values([
                    typeof ((_b = this.proxyConfig) === null || _b === void 0 ? void 0 : _b.key) != 'undefined' ? { 'x-api-key': (_c = this.proxyConfig) === null || _c === void 0 ? void 0 : _c.key } : undefined,
                ])[0]) }, Object.values([
                typeof this.proxyConfig == 'undefined'
                    ? { query: (0, utils_1.anilistSearchQuery)(query, page, perPage) }
                    : {
                        body: JSON.stringify({
                            query: (0, utils_1.anilistSearchQuery)(query, page, perPage),
                        }),
                    },
            ])[0]);
            try {
                const { data, status } = yield axios_1.default.post(typeof this.proxyConfig != 'undefined'
                    ? `${this.proxyConfig.url}/?url=${this.anilistGraphqlUrl}`
                    : this.anilistGraphqlUrl, typeof this.proxyConfig == 'undefined' ? options : options.body, typeof this.proxyConfig == 'undefined' ? undefined : { headers: options.headers });
                const res = {
                    currentPage: data.data.Page.pageInfo.currentPage,
                    hasNextPage: data.data.Page.pageInfo.hasNextPage,
                    results: data.data.Page.media.map((item) => {
                        var _b, _c, _d, _e, _f, _g, _h, _j;
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
                            image: (_e = (_c = (_b = item.coverImage) === null || _b === void 0 ? void 0 : _b.extraLarge) !== null && _c !== void 0 ? _c : (_d = item.coverImage) === null || _d === void 0 ? void 0 : _d.large) !== null && _e !== void 0 ? _e : (_f = item.coverImage) === null || _f === void 0 ? void 0 : _f.medium,
                            cover: item.bannerImage,
                            popularity: item.popularity,
                            description: item.description,
                            rating: item.averageScore,
                            genres: item.genres,
                            color: (_g = item.coverImage) === null || _g === void 0 ? void 0 : _g.color,
                            totalEpisodes: (_h = item.episodes) !== null && _h !== void 0 ? _h : ((_j = item.nextAiringEpisode) === null || _j === void 0 ? void 0 : _j.episode) - 1,
                            type: item.format,
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
         * @param year Year (optional) e.g. `2022`
         * @param status Status (optional) (options: `RELEASING`, `FINISHED`, `NOT_YET_RELEASED`, `CANCELLED`, `HIATUS`)
         * @param season Season (optional) (options: `WINTER`, `SPRING`, `SUMMER`, `FALL`)
         */
        this.advancedSearch = (query, type = 'ANIME', page = 1, perPage = 20, format, sort, genres, id, year, status, season) => __awaiter(this, void 0, void 0, function* () {
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
                    year: year ? `${year}%` : undefined,
                    status: status,
                    season: season,
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
                        var _b, _c, _d, _e, _f;
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
                            image: (_c = (_b = item.coverImage.extraLarge) !== null && _b !== void 0 ? _b : item.coverImage.large) !== null && _c !== void 0 ? _c : item.coverImage.medium,
                            cover: item.bannerImage,
                            popularity: item.popularity,
                            totalEpisodes: (_d = item.episodes) !== null && _d !== void 0 ? _d : ((_e = item.nextAiringEpisode) === null || _e === void 0 ? void 0 : _e.episode) - 1,
                            description: item.description,
                            genres: item.genres,
                            rating: item.averageScore,
                            color: (_f = item.coverImage) === null || _f === void 0 ? void 0 : _f.color,
                            type: item.format,
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
         * @param fetchFiller to get filler boolean on the episode object (optional) set to `true` to get filler boolean on the episode object.
         */
        this.fetchAnimeInfo = (id, dub = false, fetchFiller = false) => __awaiter(this, void 0, void 0, function* () {
            var _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
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
            let fillerEpisodes;
            try {
                const { data } = yield axios_1.default.post(this.anilistGraphqlUrl, options).catch(err => {
                    throw new Error('Media not found');
                });
                animeInfo.malId = data.data.Media.idMal;
                animeInfo.title = {
                    romaji: data.data.Media.title.romaji,
                    english: data.data.Media.title.english,
                    native: data.data.Media.title.native,
                    userPreferred: data.data.Media.title.userPreferred,
                };
                animeInfo.synonyms = data.data.Media.synonyms;
                animeInfo.isLicensed = data.data.Media.isLicensed;
                animeInfo.isAdult = data.data.Media.isAdult;
                animeInfo.countryOfOrigin = data.data.Media.countryOfOrigin;
                if ((_d = data.data.Media.trailer) === null || _d === void 0 ? void 0 : _d.id) {
                    animeInfo.trailer = {
                        id: data.data.Media.trailer.id,
                        site: (_e = data.data.Media.trailer) === null || _e === void 0 ? void 0 : _e.site,
                        thumbnail: (_f = data.data.Media.trailer) === null || _f === void 0 ? void 0 : _f.thumbnail,
                    };
                }
                animeInfo.image =
                    (_h = (_g = data.data.Media.coverImage.extraLarge) !== null && _g !== void 0 ? _g : data.data.Media.coverImage.large) !== null && _h !== void 0 ? _h : data.data.Media.coverImage.medium;
                animeInfo.popularity = data.data.Media.popularity;
                animeInfo.color = (_j = data.data.Media.coverImage) === null || _j === void 0 ? void 0 : _j.color;
                animeInfo.cover = (_k = data.data.Media.bannerImage) !== null && _k !== void 0 ? _k : animeInfo.image;
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
                animeInfo.startDate = {
                    year: data.data.Media.startDate.year,
                    month: data.data.Media.startDate.month,
                    day: data.data.Media.startDate.day,
                };
                animeInfo.endDate = {
                    year: data.data.Media.endDate.year,
                    month: data.data.Media.endDate.month,
                    day: data.data.Media.endDate.day,
                };
                if ((_l = data.data.Media.nextAiringEpisode) === null || _l === void 0 ? void 0 : _l.airingAt)
                    animeInfo.nextAiringEpisode = {
                        airingTime: (_m = data.data.Media.nextAiringEpisode) === null || _m === void 0 ? void 0 : _m.airingAt,
                        timeUntilAiring: (_o = data.data.Media.nextAiringEpisode) === null || _o === void 0 ? void 0 : _o.timeUntilAiring,
                        episode: (_p = data.data.Media.nextAiringEpisode) === null || _p === void 0 ? void 0 : _p.episode,
                    };
                animeInfo.totalEpisodes = (_r = (_q = data.data.Media) === null || _q === void 0 ? void 0 : _q.episodes) !== null && _r !== void 0 ? _r : ((_s = data.data.Media.nextAiringEpisode) === null || _s === void 0 ? void 0 : _s.episode) - 1;
                animeInfo.rating = data.data.Media.averageScore;
                animeInfo.duration = data.data.Media.duration;
                animeInfo.genres = data.data.Media.genres;
                animeInfo.season = data.data.Media.season;
                animeInfo.studios = data.data.Media.studios.edges.map((item) => item.node.name);
                animeInfo.subOrDub = dub ? models_1.SubOrSub.DUB : models_1.SubOrSub.SUB;
                animeInfo.type = data.data.Media.format;
                animeInfo.recommendations = data.data.Media.recommendations.edges.map((item) => {
                    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12;
                    return ({
                        id: (_b = item.node.mediaRecommendation) === null || _b === void 0 ? void 0 : _b.id,
                        malId: (_c = item.node.mediaRecommendation) === null || _c === void 0 ? void 0 : _c.idMal,
                        title: {
                            romaji: (_e = (_d = item.node.mediaRecommendation) === null || _d === void 0 ? void 0 : _d.title) === null || _e === void 0 ? void 0 : _e.romaji,
                            english: (_g = (_f = item.node.mediaRecommendation) === null || _f === void 0 ? void 0 : _f.title) === null || _g === void 0 ? void 0 : _g.english,
                            native: (_j = (_h = item.node.mediaRecommendation) === null || _h === void 0 ? void 0 : _h.title) === null || _j === void 0 ? void 0 : _j.native,
                            userPreferred: (_l = (_k = item.node.mediaRecommendation) === null || _k === void 0 ? void 0 : _k.title) === null || _l === void 0 ? void 0 : _l.userPreferred,
                        },
                        status: ((_m = item.node.mediaRecommendation) === null || _m === void 0 ? void 0 : _m.status) == 'RELEASING'
                            ? models_1.MediaStatus.ONGOING
                            : ((_o = item.node.mediaRecommendation) === null || _o === void 0 ? void 0 : _o.status) == 'FINISHED'
                                ? models_1.MediaStatus.COMPLETED
                                : ((_p = item.node.mediaRecommendation) === null || _p === void 0 ? void 0 : _p.status) == 'NOT_YET_RELEASED'
                                    ? models_1.MediaStatus.NOT_YET_AIRED
                                    : ((_q = item.node.mediaRecommendation) === null || _q === void 0 ? void 0 : _q.status) == 'CANCELLED'
                                        ? models_1.MediaStatus.CANCELLED
                                        : ((_r = item.node.mediaRecommendation) === null || _r === void 0 ? void 0 : _r.status) == 'HIATUS'
                                            ? models_1.MediaStatus.HIATUS
                                            : models_1.MediaStatus.UNKNOWN,
                        episodes: (_s = item.node.mediaRecommendation) === null || _s === void 0 ? void 0 : _s.episodes,
                        image: (_y = (_v = (_u = (_t = item.node.mediaRecommendation) === null || _t === void 0 ? void 0 : _t.coverImage) === null || _u === void 0 ? void 0 : _u.extraLarge) !== null && _v !== void 0 ? _v : (_x = (_w = item.node.mediaRecommendation) === null || _w === void 0 ? void 0 : _w.coverImage) === null || _x === void 0 ? void 0 : _x.large) !== null && _y !== void 0 ? _y : (_0 = (_z = item.node.mediaRecommendation) === null || _z === void 0 ? void 0 : _z.coverImage) === null || _0 === void 0 ? void 0 : _0.medium,
                        cover: (_8 = (_5 = (_2 = (_1 = item.node.mediaRecommendation) === null || _1 === void 0 ? void 0 : _1.bannerImage) !== null && _2 !== void 0 ? _2 : (_4 = (_3 = item.node.mediaRecommendation) === null || _3 === void 0 ? void 0 : _3.coverImage) === null || _4 === void 0 ? void 0 : _4.extraLarge) !== null && _5 !== void 0 ? _5 : (_7 = (_6 = item.node.mediaRecommendation) === null || _6 === void 0 ? void 0 : _6.coverImage) === null || _7 === void 0 ? void 0 : _7.large) !== null && _8 !== void 0 ? _8 : (_10 = (_9 = item.node.mediaRecommendation) === null || _9 === void 0 ? void 0 : _9.coverImage) === null || _10 === void 0 ? void 0 : _10.medium,
                        rating: (_11 = item.node.mediaRecommendation) === null || _11 === void 0 ? void 0 : _11.meanScore,
                        type: (_12 = item.node.mediaRecommendation) === null || _12 === void 0 ? void 0 : _12.format,
                    });
                });
                animeInfo.characters = data.data.Media.characters.edges.map((item) => {
                    var _b, _c;
                    return ({
                        id: (_b = item.node) === null || _b === void 0 ? void 0 : _b.id,
                        role: item.role,
                        name: {
                            first: item.node.name.first,
                            last: item.node.name.last,
                            full: item.node.name.full,
                            native: item.node.name.native,
                            userPreferred: item.node.name.userPreferred,
                        },
                        image: (_c = item.node.image.large) !== null && _c !== void 0 ? _c : item.node.image.medium,
                        voiceActors: item.voiceActors.map((voiceActor) => {
                            var _b;
                            return ({
                                id: voiceActor.id,
                                name: {
                                    first: voiceActor.name.first,
                                    last: voiceActor.name.last,
                                    full: voiceActor.name.full,
                                    native: voiceActor.name.native,
                                    userPreferred: voiceActor.name.userPreferred,
                                },
                                image: (_b = voiceActor.image.large) !== null && _b !== void 0 ? _b : voiceActor.image.medium,
                            });
                        }),
                    });
                });
                animeInfo.relations = data.data.Media.relations.edges.map((item) => {
                    var _b, _c, _d, _e, _f, _g;
                    return ({
                        id: item.node.id,
                        relationType: item.relationType,
                        malId: item.node.idMal,
                        title: {
                            romaji: item.node.title.romaji,
                            english: item.node.title.english,
                            native: item.node.title.native,
                            userPreferred: item.node.title.userPreferred,
                        },
                        status: item.node.status == 'RELEASING'
                            ? models_1.MediaStatus.ONGOING
                            : item.node.status == 'FINISHED'
                                ? models_1.MediaStatus.COMPLETED
                                : item.node.status == 'NOT_YET_RELEASED'
                                    ? models_1.MediaStatus.NOT_YET_AIRED
                                    : item.node.status == 'CANCELLED'
                                        ? models_1.MediaStatus.CANCELLED
                                        : item.node.status == 'HIATUS'
                                            ? models_1.MediaStatus.HIATUS
                                            : models_1.MediaStatus.UNKNOWN,
                        episodes: item.node.episodes,
                        image: (_c = (_b = item.node.coverImage.extraLarge) !== null && _b !== void 0 ? _b : item.node.coverImage.large) !== null && _c !== void 0 ? _c : item.node.coverImage.medium,
                        color: (_d = item.node.coverImage) === null || _d === void 0 ? void 0 : _d.color,
                        type: item.node.format,
                        cover: (_g = (_f = (_e = item.node.bannerImage) !== null && _e !== void 0 ? _e : item.node.coverImage.extraLarge) !== null && _f !== void 0 ? _f : item.node.coverImage.large) !== null && _g !== void 0 ? _g : item.node.coverImage.medium,
                        rating: item.node.meanScore,
                    });
                });
                if ((this.provider instanceof zoro_1.default || this.provider instanceof gogoanime_1.default) &&
                    !dub &&
                    (animeInfo.status === models_1.MediaStatus.ONGOING ||
                        (0, utils_1.range)({ from: 2000, to: new Date().getFullYear() + 1 }).includes(parseInt(animeInfo.releaseDate)))) {
                    try {
                        animeInfo.episodes = (_t = (yield new enime_1.default().fetchAnimeInfoByAnilistId(id, this.provider.name.toLowerCase())).episodes) === null || _t === void 0 ? void 0 : _t.map((item) => ({
                            id: item.slug,
                            title: item.title,
                            description: item.description,
                            number: item.number,
                            image: item.image,
                        }));
                        (_u = animeInfo.episodes) === null || _u === void 0 ? void 0 : _u.reverse();
                    }
                    catch (err) {
                        animeInfo.episodes = yield this.fetchDefaultEpisodeList({
                            idMal: animeInfo.malId,
                            season: data.data.Media.season,
                            startDate: { year: parseInt(animeInfo.releaseDate) },
                            title: { english: (_v = animeInfo.title) === null || _v === void 0 ? void 0 : _v.english, romaji: (_w = animeInfo.title) === null || _w === void 0 ? void 0 : _w.romaji },
                        }, dub, id);
                        animeInfo.episodes = (_x = animeInfo.episodes) === null || _x === void 0 ? void 0 : _x.map((episode) => {
                            if (!episode.image)
                                episode.image = animeInfo.image;
                            return episode;
                        });
                        return animeInfo;
                    }
                }
                else
                    animeInfo.episodes = yield this.fetchDefaultEpisodeList({
                        idMal: animeInfo.malId,
                        season: data.data.Media.season,
                        startDate: { year: parseInt(animeInfo.releaseDate) },
                        title: { english: (_y = animeInfo.title) === null || _y === void 0 ? void 0 : _y.english, romaji: (_z = animeInfo.title) === null || _z === void 0 ? void 0 : _z.romaji },
                    }, dub, id);
                if (fetchFiller) {
                    let { data: fillerData } = yield (0, axios_1.default)({
                        baseURL: `https://raw.githubusercontent.com/saikou-app/mal-id-filler-list/main/fillers/${animeInfo.malId}.json`,
                        method: 'GET',
                        validateStatus: () => true,
                    });
                    if (!fillerData.toString().startsWith('404')) {
                        fillerEpisodes = [];
                        fillerEpisodes === null || fillerEpisodes === void 0 ? void 0 : fillerEpisodes.push(...fillerData.episodes);
                    }
                }
                animeInfo.episodes = (_0 = animeInfo.episodes) === null || _0 === void 0 ? void 0 : _0.map((episode) => {
                    if (!episode.image)
                        episode.image = animeInfo.image;
                    if (fetchFiller &&
                        (fillerEpisodes === null || fillerEpisodes === void 0 ? void 0 : fillerEpisodes.length) > 0 &&
                        (fillerEpisodes === null || fillerEpisodes === void 0 ? void 0 : fillerEpisodes.length) >= animeInfo.episodes.length) {
                        if (fillerEpisodes[episode.number - 1])
                            episode.isFiller = new Boolean(fillerEpisodes[episode.number - 1]['filler-bool']).valueOf();
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
            var _1, _2;
            title.english = (_1 = title.english) !== null && _1 !== void 0 ? _1 : title.romaji;
            title.romaji = (_2 = title.romaji) !== null && _2 !== void 0 ? _2 : title.english;
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
            if (malId && !(this.provider instanceof crunchyroll_1.default || this.provider instanceof bilibili_1.default)) {
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
                    if (possibleSource) {
                        try {
                            possibleAnime = yield this.provider.fetchAnimeInfo(possibleSource.url.split('/').pop());
                        }
                        catch (err) {
                            console.error(err);
                            possibleAnime = yield this.findAnimeRaw(slug);
                        }
                    }
                    else
                        possibleAnime = yield this.findAnimeRaw(slug);
                }
                else
                    possibleAnime = yield this.findAnimeRaw(slug);
            }
            else
                possibleAnime = yield this.findAnimeRaw(slug);
            // To avoid a new request, lets match and see if the anime show found is in sub/dub
            let expectedType = dub ? models_1.SubOrSub.DUB : models_1.SubOrSub.SUB;
            if (possibleAnime.subOrDub != models_1.SubOrSub.BOTH && possibleAnime.subOrDub != expectedType) {
                return [];
            }
            if (this.provider instanceof zoro_1.default) {
                // Set the correct episode sub/dub request type
                possibleAnime.episodes.forEach((_, index) => {
                    if (possibleAnime.subOrDub === models_1.SubOrSub.BOTH) {
                        possibleAnime.episodes[index].id = possibleAnime.episodes[index].id.replace(`$both`, dub ? '$dub' : '$sub');
                    }
                });
            }
            if (this.provider instanceof crunchyroll_1.default) {
                return dub
                    ? possibleAnime.episodes.filter((ep) => ep.isDubbed)
                    : possibleAnime.episodes.filter((ep) => ep.type == 'Subbed');
            }
            const possibleProviderEpisodes = possibleAnime.episodes;
            if (typeof possibleProviderEpisodes[0].image !== 'undefined' &&
                typeof possibleProviderEpisodes[0].title !== 'undefined' &&
                typeof possibleProviderEpisodes[0].description !== 'undefined')
                return possibleProviderEpisodes;
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
                        var _b, _c;
                        if (node.season === season && node.startDate.trim().split('-')[0] === (startDate === null || startDate === void 0 ? void 0 : startDate.toString())) {
                            const episodes = node.episodes.nodes;
                            for (const episode of episodes) {
                                const i = episode === null || episode === void 0 ? void 0 : episode.number.toString().replace(/"/g, '');
                                let name = undefined;
                                let description = undefined;
                                let thumbnail = undefined;
                                if ((_b = episode === null || episode === void 0 ? void 0 : episode.description) === null || _b === void 0 ? void 0 : _b.en)
                                    description = episode === null || episode === void 0 ? void 0 : episode.description.en.toString().replace(/"/g, '').replace('\\n', '\n');
                                if (episode === null || episode === void 0 ? void 0 : episode.thumbnail)
                                    thumbnail = episode === null || episode === void 0 ? void 0 : episode.thumbnail.original.url.toString().replace(/"/g, '');
                                if (episode) {
                                    if ((_c = episode.titles) === null || _c === void 0 ? void 0 : _c.canonical)
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
                    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                    const j = (i + 1).toString();
                    newEpisodeList.push({
                        id: ep.id,
                        title: (_d = (_b = ep.title) !== null && _b !== void 0 ? _b : (_c = episodesList.get(j)) === null || _c === void 0 ? void 0 : _c.title) !== null && _d !== void 0 ? _d : null,
                        image: (_g = (_e = ep.image) !== null && _e !== void 0 ? _e : (_f = episodesList.get(j)) === null || _f === void 0 ? void 0 : _f.thumbnail) !== null && _g !== void 0 ? _g : null,
                        number: ep.number,
                        description: (_k = (_h = ep.description) !== null && _h !== void 0 ? _h : (_j = episodesList.get(j)) === null || _j === void 0 ? void 0 : _j.description) !== null && _k !== void 0 ? _k : null,
                        url: (_l = ep.url) !== null && _l !== void 0 ? _l : null,
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
                query: (0, utils_1.anilistTrendingQuery)(page, perPage),
            };
            try {
                const { data } = yield axios_1.default.post(this.anilistGraphqlUrl, options);
                const res = {
                    currentPage: data.data.Page.pageInfo.currentPage,
                    hasNextPage: data.data.Page.pageInfo.hasNextPage,
                    results: data.data.Page.media.map((item) => {
                        var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                        return ({
                            id: item.id.toString(),
                            malId: item.idMal,
                            title: {
                                romaji: item.title.romaji,
                                english: item.title.english,
                                native: item.title.native,
                                userPreferred: item.title.userPreferred,
                            } || item.title.romaji,
                            image: (_c = (_b = item.coverImage.extraLarge) !== null && _b !== void 0 ? _b : item.coverImage.large) !== null && _c !== void 0 ? _c : item.coverImage.medium,
                            trailer: {
                                id: (_d = item.trailer) === null || _d === void 0 ? void 0 : _d.id,
                                site: (_e = item.trailer) === null || _e === void 0 ? void 0 : _e.site,
                                thumbnail: (_f = item.trailer) === null || _f === void 0 ? void 0 : _f.thumbnail,
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
                            cover: (_j = (_h = (_g = item.bannerImage) !== null && _g !== void 0 ? _g : item.coverImage.extraLarge) !== null && _h !== void 0 ? _h : item.coverImage.large) !== null && _j !== void 0 ? _j : item.coverImage.medium,
                            rating: item.averageScore,
                            releaseDate: item.seasonYear,
                            color: item.color,
                            genres: item.genres,
                            totalEpisodes: isNaN(item.episodes) ? 0 : (_m = (_k = item.episodes) !== null && _k !== void 0 ? _k : ((_l = item.nextAiringEpisode) === null || _l === void 0 ? void 0 : _l.episode) - 1) !== null && _m !== void 0 ? _m : 0,
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
                query: (0, utils_1.anilistPopularQuery)(page, perPage),
            };
            try {
                const { data } = yield axios_1.default.post(this.anilistGraphqlUrl, options);
                const res = {
                    currentPage: data.data.Page.pageInfo.currentPage,
                    hasNextPage: data.data.Page.pageInfo.hasNextPage,
                    results: data.data.Page.media.map((item) => {
                        var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                        return ({
                            id: item.id.toString(),
                            malId: item.idMal,
                            title: {
                                romaji: item.title.romaji,
                                english: item.title.english,
                                native: item.title.native,
                                userPreferred: item.title.userPreferred,
                            } || item.title.romaji,
                            image: (_c = (_b = item.coverImage.extraLarge) !== null && _b !== void 0 ? _b : item.coverImage.large) !== null && _c !== void 0 ? _c : item.coverImage.medium,
                            trailer: {
                                id: (_d = item.trailer) === null || _d === void 0 ? void 0 : _d.id,
                                site: (_e = item.trailer) === null || _e === void 0 ? void 0 : _e.site,
                                thumbnail: (_f = item.trailer) === null || _f === void 0 ? void 0 : _f.thumbnail,
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
                            cover: (_j = (_h = (_g = item.bannerImage) !== null && _g !== void 0 ? _g : item.coverImage.extraLarge) !== null && _h !== void 0 ? _h : item.coverImage.large) !== null && _j !== void 0 ? _j : item.coverImage.medium,
                            rating: item.averageScore,
                            releaseDate: item.seasonYear,
                            color: item.color,
                            genres: item.genres,
                            totalEpisodes: isNaN(item.episodes) ? 0 : (_m = (_k = item.episodes) !== null && _k !== void 0 ? _k : ((_l = item.nextAiringEpisode) === null || _l === void 0 ? void 0 : _l.episode) - 1) !== null && _m !== void 0 ? _m : 0,
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
         * @param weekStart Filter by the start of the week (optional) (default: todays date) (options: 2 = Monday, 3 = Tuesday, 4 = Wednesday, 5 = Thursday, 6 = Friday, 0 = Saturday, 1 = Sunday) you can use either the number or the string
         * @param weekEnd Filter by the end of the week (optional) similar to weekStart
         * @param notYetAired if true will return anime that have not yet aired (optional)
         * @returns the next airing episodes
         */
        this.fetchAiringSchedule = (page = 1, perPage = 20, weekStart = (new Date().getDay() + 1) % 7, weekEnd = (new Date().getDay() + 7) % 7, notYetAired = false) => __awaiter(this, void 0, void 0, function* () {
            let day1, day2 = undefined;
            if (typeof weekStart === 'string' && typeof weekEnd === 'string')
                [day1, day2] = (0, utils_1.getDays)((0, utils_1.capitalizeFirstLetter)(weekStart.toLowerCase()), (0, utils_1.capitalizeFirstLetter)(weekEnd.toLowerCase()));
            else if (typeof weekStart === 'number' && typeof weekEnd === 'number')
                [day1, day2] = (0, utils_1.getDays)(utils_1.days[weekStart], utils_1.days[weekEnd]);
            else
                throw new Error('Invalid weekStart or weekEnd');
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: (0, utils_1.anilistAiringScheduleQuery)(page, perPage, day1, day2, notYetAired),
            };
            try {
                const { data } = yield axios_1.default.post(this.anilistGraphqlUrl, options);
                const res = {
                    currentPage: data.data.Page.pageInfo.currentPage,
                    hasNextPage: data.data.Page.pageInfo.hasNextPage,
                    results: data.data.Page.airingSchedules.map((item) => {
                        var _b, _c, _d, _e, _f, _g;
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
                            image: (_c = (_b = item.media.coverImage.extraLarge) !== null && _b !== void 0 ? _b : item.media.coverImage.large) !== null && _c !== void 0 ? _c : item.media.coverImage.medium,
                            description: item.media.description,
                            cover: (_f = (_e = (_d = item.media.bannerImage) !== null && _d !== void 0 ? _d : item.media.coverImage.extraLarge) !== null && _e !== void 0 ? _e : item.media.coverImage.large) !== null && _f !== void 0 ? _f : item.media.coverImage.medium,
                            genres: item.media.genres,
                            color: (_g = item.media.coverImage) === null || _g === void 0 ? void 0 : _g.color,
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
                        var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
                        return ({
                            id: item.id.toString(),
                            malId: item.idMal,
                            title: {
                                romaji: item.title.romaji,
                                english: item.title.english,
                                native: item.title.native,
                                userPreferred: item.title.userPreferred,
                            } || item.title.romaji,
                            image: (_c = (_b = item.coverImage.extraLarge) !== null && _b !== void 0 ? _b : item.coverImage.large) !== null && _c !== void 0 ? _c : item.coverImage.medium,
                            trailer: {
                                id: (_d = item.trailer) === null || _d === void 0 ? void 0 : _d.id,
                                site: (_e = item.trailer) === null || _e === void 0 ? void 0 : _e.site,
                                thumbnail: (_f = item.trailer) === null || _f === void 0 ? void 0 : _f.thumbnail,
                            },
                            description: item.description,
                            cover: (_j = (_h = (_g = item.bannerImage) !== null && _g !== void 0 ? _g : item.coverImage.extraLarge) !== null && _h !== void 0 ? _h : item.coverImage.large) !== null && _j !== void 0 ? _j : item.coverImage.medium,
                            rating: item.averageScore,
                            releaseDate: item.seasonYear,
                            color: (_k = item.coverImage) === null || _k === void 0 ? void 0 : _k.color,
                            genres: item.genres,
                            totalEpisodes: isNaN(item.episodes) ? 0 : (_o = (_l = item.episodes) !== null && _l !== void 0 ? _l : ((_m = item.nextAiringEpisode) === null || _m === void 0 ? void 0 : _m.episode) - 1) !== null && _o !== void 0 ? _o : 0,
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
            if (this.provider instanceof crunchyroll_1.default)
                return yield this.provider.fetchAnimeInfo(findAnime.results[0].id, findAnime.results[0].type);
            // TODO: use much better way than this
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
                // const {
                //   data: { data },
                // } = await axios.post(this.anilistGraphqlUrl, options);
                // const selectedAnime = Math.floor(
                //   Math.random() * data.SiteStatistics.anime.nodes[data.SiteStatistics.anime.nodes.length - 1].count
                // );
                // const { results } = await this.advancedSearch(undefined, 'ANIME', Math.ceil(selectedAnime / 50), 50);
                const { data: data } = yield axios_1.default.get('https://raw.githubusercontent.com/5H4D0WILA/IDFetch/main/ids.txt');
                const ids = data === null || data === void 0 ? void 0 : data.trim().split('\n');
                const selectedAnime = Math.floor(Math.random() * ids.length);
                return yield this.fetchAnimeInfo(ids[selectedAnime]);
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
                    var _b, _c, _d, _e, _f, _g, _h, _j, _k;
                    return ({
                        id: item.anime.anilistId.toString(),
                        malId: (_b = item.anime.mappings) === null || _b === void 0 ? void 0 : _b.mal,
                        title: {
                            romaji: (_c = item.anime.title) === null || _c === void 0 ? void 0 : _c.romaji,
                            english: (_d = item.anime.title) === null || _d === void 0 ? void 0 : _d.english,
                            native: (_e = item.anime.title) === null || _e === void 0 ? void 0 : _e.native,
                            userPreferred: (_f = item.anime.title) === null || _f === void 0 ? void 0 : _f.userPreferred,
                        },
                        image: (_g = item.anime.coverImage) !== null && _g !== void 0 ? _g : item.anime.bannerImage,
                        rating: item.anime.averageScore,
                        color: item.anime.color,
                        episodeId: `${provider === 'gogoanime'
                            ? (_h = item.sources.find((source) => source.website.toLowerCase() === 'gogoanime')) === null || _h === void 0 ? void 0 : _h.id
                            : (_j = item.sources.find((source) => source.website.toLowerCase() === 'zoro')) === null || _j === void 0 ? void 0 : _j.id}-enime`,
                        episodeTitle: (_k = item.title) !== null && _k !== void 0 ? _k : `Episode ${item.number}`,
                        episodeNumber: item.number,
                        genres: item.anime.genre,
                        type: item.anime.format,
                    });
                });
                results = results.filter((item) => item.episodeNumber !== 0 &&
                    item.episodeId.replace('-enime', '').length > 0 &&
                    item.episodeId.replace('-enime', '') !== 'undefined');
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
        this.fetchDefaultEpisodeList = (Media, dub, id) => __awaiter(this, void 0, void 0, function* () {
            var _3, _4;
            let episodes = [];
            episodes = yield this.findAnime({ english: (_3 = Media.title) === null || _3 === void 0 ? void 0 : _3.english, romaji: (_4 = Media.title) === null || _4 === void 0 ? void 0 : _4.romaji }, Media.season, Media.startDate.year, Media.idMal, dub, id);
            return episodes;
        });
        /**
         * @param id anilist id
         * @param dub language of the dubbed version (optional) currently only works for gogoanime
         * @param fetchFiller to get filler boolean on the episode object (optional) set to `true` to get filler boolean on the episode object.
         * @returns episode list **(without anime info)**
         */
        this.fetchEpisodesListById = (id, dub = false, fetchFiller = false) => __awaiter(this, void 0, void 0, function* () {
            var _5, _6;
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: `query($id: Int = ${id}){ Media(id: $id){ idMal title {romaji english} status season episodes startDate {year} coverImage {extraLarge large medium} } }`,
            };
            const { data: { data: { Media }, }, } = yield axios_1.default.post(this.anilistGraphqlUrl, options);
            let possibleAnimeEpisodes = [];
            let fillerEpisodes = [];
            if ((this.provider instanceof zoro_1.default || this.provider instanceof gogoanime_1.default) &&
                !dub &&
                (Media.status === 'RELEASING' ||
                    (0, utils_1.range)({ from: 2000, to: new Date().getFullYear() + 1 }).includes(parseInt((_5 = Media.startDate) === null || _5 === void 0 ? void 0 : _5.year)))) {
                try {
                    possibleAnimeEpisodes = (_6 = (yield new enime_1.default().fetchAnimeInfoByAnilistId(id, this.provider.name.toLowerCase())).episodes) === null || _6 === void 0 ? void 0 : _6.map((item) => ({
                        id: item.slug,
                        title: item.title,
                        description: item.description,
                        number: item.number,
                        image: item.image,
                    }));
                    possibleAnimeEpisodes.reverse();
                }
                catch (err) {
                    possibleAnimeEpisodes = yield this.fetchDefaultEpisodeList(Media, dub, id);
                    possibleAnimeEpisodes = possibleAnimeEpisodes === null || possibleAnimeEpisodes === void 0 ? void 0 : possibleAnimeEpisodes.map((episode) => {
                        var _b, _c;
                        if (!episode.image)
                            episode.image = (_c = (_b = Media.coverImage.extraLarge) !== null && _b !== void 0 ? _b : Media.coverImage.large) !== null && _c !== void 0 ? _c : Media.coverImage.medium;
                        return episode;
                    });
                    return possibleAnimeEpisodes;
                }
            }
            else
                possibleAnimeEpisodes = yield this.fetchDefaultEpisodeList(Media, dub, id);
            if (fetchFiller) {
                let { data: fillerData } = yield (0, axios_1.default)({
                    baseURL: `https://raw.githubusercontent.com/saikou-app/mal-id-filler-list/main/fillers/${Media.idMal}.json`,
                    method: 'GET',
                    validateStatus: () => true,
                });
                if (!fillerData.toString().startsWith('404')) {
                    fillerEpisodes = [];
                    fillerEpisodes === null || fillerEpisodes === void 0 ? void 0 : fillerEpisodes.push(...fillerData.episodes);
                }
            }
            possibleAnimeEpisodes = possibleAnimeEpisodes === null || possibleAnimeEpisodes === void 0 ? void 0 : possibleAnimeEpisodes.map((episode) => {
                var _b, _c;
                if (!episode.image)
                    episode.image = (_c = (_b = Media.coverImage.extraLarge) !== null && _b !== void 0 ? _b : Media.coverImage.large) !== null && _c !== void 0 ? _c : Media.coverImage.medium;
                if (fetchFiller && (fillerEpisodes === null || fillerEpisodes === void 0 ? void 0 : fillerEpisodes.length) > 0 && (fillerEpisodes === null || fillerEpisodes === void 0 ? void 0 : fillerEpisodes.length) >= Media.episodes) {
                    if (fillerEpisodes[episode.number - 1])
                        episode.isFiller = new Boolean(fillerEpisodes[episode.number - 1]['filler-bool']).valueOf();
                }
                return episode;
            });
            return possibleAnimeEpisodes;
        });
        /**
         * @param id anilist id
         * @returns anilist data for the anime **(without episodes)** (use `fetchEpisodesListById` to get the episodes) (use `fetchAnimeInfo` to get both)
         */
        this.fetchAnilistInfoById = (id) => __awaiter(this, void 0, void 0, function* () {
            var _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27;
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
                if ((_7 = data.data.Media.trailer) === null || _7 === void 0 ? void 0 : _7.id) {
                    animeInfo.trailer = {
                        id: (_8 = data.data.Media.trailer) === null || _8 === void 0 ? void 0 : _8.id,
                        site: (_9 = data.data.Media.trailer) === null || _9 === void 0 ? void 0 : _9.site,
                        thumbnail: (_10 = data.data.Media.trailer) === null || _10 === void 0 ? void 0 : _10.thumbnail,
                    };
                }
                animeInfo.synonyms = data.data.Media.synonyms;
                animeInfo.isLicensed = data.data.Media.isLicensed;
                animeInfo.isAdult = data.data.Media.isAdult;
                animeInfo.countryOfOrigin = data.data.Media.countryOfOrigin;
                animeInfo.image =
                    (_12 = (_11 = data.data.Media.coverImage.extraLarge) !== null && _11 !== void 0 ? _11 : data.data.Media.coverImage.large) !== null && _12 !== void 0 ? _12 : data.data.Media.coverImage.medium;
                animeInfo.cover = (_13 = data.data.Media.bannerImage) !== null && _13 !== void 0 ? _13 : animeInfo.image;
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
                if ((_14 = data.data.Media.nextAiringEpisode) === null || _14 === void 0 ? void 0 : _14.airingAt)
                    animeInfo.nextAiringEpisode = {
                        airingTime: (_15 = data.data.Media.nextAiringEpisode) === null || _15 === void 0 ? void 0 : _15.airingAt,
                        timeUntilAiring: (_16 = data.data.Media.nextAiringEpisode) === null || _16 === void 0 ? void 0 : _16.timeUntilAiring,
                        episode: (_17 = data.data.Media.nextAiringEpisode) === null || _17 === void 0 ? void 0 : _17.episode,
                    };
                animeInfo.totalEpisodes = (_19 = (_18 = data.data.Media) === null || _18 === void 0 ? void 0 : _18.episodes) !== null && _19 !== void 0 ? _19 : ((_20 = data.data.Media.nextAiringEpisode) === null || _20 === void 0 ? void 0 : _20.episode) - 1;
                animeInfo.rating = data.data.Media.averageScore;
                animeInfo.duration = data.data.Media.duration;
                animeInfo.genres = data.data.Media.genres;
                animeInfo.studios = data.data.Media.studios.edges.map((item) => item.node.name);
                animeInfo.season = data.data.Media.season;
                animeInfo.popularity = data.data.Media.popularity;
                animeInfo.type = data.data.Media.format;
                animeInfo.startDate = {
                    year: (_21 = data.data.Media.startDate) === null || _21 === void 0 ? void 0 : _21.year,
                    month: (_22 = data.data.Media.startDate) === null || _22 === void 0 ? void 0 : _22.month,
                    day: (_23 = data.data.Media.startDate) === null || _23 === void 0 ? void 0 : _23.day,
                };
                animeInfo.endDate = {
                    year: (_24 = data.data.Media.endDate) === null || _24 === void 0 ? void 0 : _24.year,
                    month: (_25 = data.data.Media.endDate) === null || _25 === void 0 ? void 0 : _25.month,
                    day: (_26 = data.data.Media.endDate) === null || _26 === void 0 ? void 0 : _26.day,
                };
                animeInfo.recommendations = data.data.Media.recommendations.edges.map((item) => {
                    var _b, _c, _d, _e, _f;
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
                        image: (_c = (_b = item.node.mediaRecommendation.coverImage.extraLarge) !== null && _b !== void 0 ? _b : item.node.mediaRecommendation.coverImage.large) !== null && _c !== void 0 ? _c : item.node.mediaRecommendation.coverImage.medium,
                        cover: (_f = (_e = (_d = item.node.mediaRecommendation.bannerImage) !== null && _d !== void 0 ? _d : item.node.mediaRecommendation.coverImage.extraLarge) !== null && _e !== void 0 ? _e : item.node.mediaRecommendation.coverImage.large) !== null && _f !== void 0 ? _f : item.node.mediaRecommendation.coverImage.medium,
                        rating: item.node.mediaRecommendation.meanScore,
                        type: item.node.mediaRecommendation.format,
                    });
                });
                animeInfo.characters = data.data.Media.characters.edges.map((item) => {
                    var _b;
                    return ({
                        id: item.node.id,
                        role: item.role,
                        name: {
                            first: item.node.name.first,
                            last: item.node.name.last,
                            full: item.node.name.full,
                            native: item.node.name.native,
                            userPreferred: item.node.name.userPreferred,
                        },
                        image: (_b = item.node.image.large) !== null && _b !== void 0 ? _b : item.node.image.medium,
                        voiceActors: item.voiceActors.map((voiceActor) => {
                            var _b;
                            return ({
                                id: voiceActor.id,
                                name: {
                                    first: voiceActor.name.first,
                                    last: voiceActor.name.last,
                                    full: voiceActor.name.full,
                                    native: voiceActor.name.native,
                                    userPreferred: voiceActor.name.userPreferred,
                                },
                                image: (_b = voiceActor.image.large) !== null && _b !== void 0 ? _b : voiceActor.image.medium,
                            });
                        }),
                    });
                });
                animeInfo.color = (_27 = data.data.Media.coverImage) === null || _27 === void 0 ? void 0 : _27.color;
                animeInfo.relations = data.data.Media.relations.edges.map((item) => {
                    var _b, _c, _d, _e, _f;
                    return ({
                        id: item.node.id,
                        malId: item.node.idMal,
                        relationType: item.relationType,
                        title: {
                            romaji: item.node.title.romaji,
                            english: item.node.title.english,
                            native: item.node.title.native,
                            userPreferred: item.node.title.userPreferred,
                        },
                        status: item.node.status == 'RELEASING'
                            ? models_1.MediaStatus.ONGOING
                            : item.node.status == 'FINISHED'
                                ? models_1.MediaStatus.COMPLETED
                                : item.node.status == 'NOT_YET_RELEASED'
                                    ? models_1.MediaStatus.NOT_YET_AIRED
                                    : item.node.status == 'CANCELLED'
                                        ? models_1.MediaStatus.CANCELLED
                                        : item.node.status == 'HIATUS'
                                            ? models_1.MediaStatus.HIATUS
                                            : models_1.MediaStatus.UNKNOWN,
                        episodes: item.node.episodes,
                        image: (_c = (_b = item.node.coverImage.extraLarge) !== null && _b !== void 0 ? _b : item.node.coverImage.large) !== null && _c !== void 0 ? _c : item.node.coverImage.medium,
                        cover: (_f = (_e = (_d = item.node.bannerImage) !== null && _d !== void 0 ? _d : item.node.coverImage.extraLarge) !== null && _e !== void 0 ? _e : item.node.coverImage.large) !== null && _f !== void 0 ? _f : item.node.coverImage.medium,
                        rating: item.node.meanScore,
                        type: item.node.format,
                    });
                });
                return animeInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        /**
         * TODO: finish this (got lazy)
         * @param id staff id from anilist
         *
         */
        this.fetchStaffById = (id) => __awaiter(this, void 0, void 0, function* () {
            throw new Error('Not implemented yet');
        });
        /**
         *
         * @param id character id from anilist
         */
        this.fetchCharacterInfoById = (id) => __awaiter(this, void 0, void 0, function* () {
            var _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55, _56, _57, _58, _59, _60;
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: (0, utils_1.anilistCharacterQuery)(),
                variables: {
                    id: id,
                },
            };
            try {
                const { data: { data: { Character }, }, } = yield axios_1.default.post(this.anilistGraphqlUrl, options);
                const height = (_28 = Character.description.match(/__Height:__(.*)/)) === null || _28 === void 0 ? void 0 : _28[1].trim();
                const weight = (_29 = Character.description.match(/__Weight:__(.*)/)) === null || _29 === void 0 ? void 0 : _29[1].trim();
                const hairColor = (_30 = Character.description.match(/__Hair Color:__(.*)/)) === null || _30 === void 0 ? void 0 : _30[1].trim();
                const eyeColor = (_31 = Character.description.match(/__Eye Color:__(.*)/)) === null || _31 === void 0 ? void 0 : _31[1].trim();
                const relatives = (_32 = Character.description
                    .match(/__Relatives:__(.*)/)) === null || _32 === void 0 ? void 0 : _32[1].trim().split(/(, \[)/g).filter((g) => !g.includes(', [')).map((r) => {
                    var _b, _c, _d;
                    return ({
                        id: (_b = r.match(/\/(\d+)/)) === null || _b === void 0 ? void 0 : _b[1],
                        name: (_c = r.match(/([^)]+)\]/)) === null || _c === void 0 ? void 0 : _c[1].replace(/\[/g, ''),
                        relationship: (_d = r.match(/\(([^)]+)\).*?(\(([^)]+)\))/)) === null || _d === void 0 ? void 0 : _d[3],
                    });
                });
                const race = (_33 = Character.description
                    .match(/__Race:__(.*)/)) === null || _33 === void 0 ? void 0 : _33[1].split(', ').map((r) => r.trim());
                const rank = (_34 = Character.description.match(/__Rank:__(.*)/)) === null || _34 === void 0 ? void 0 : _34[1];
                const occupation = (_35 = Character.description.match(/__Occupation:__(.*)/)) === null || _35 === void 0 ? void 0 : _35[1];
                const previousPosition = (_37 = (_36 = Character.description.match(/__Previous Position:__(.*)/)) === null || _36 === void 0 ? void 0 : _36[1]) === null || _37 === void 0 ? void 0 : _37.trim();
                const partner = (_38 = Character.description
                    .match(/__Partner:__(.*)/)) === null || _38 === void 0 ? void 0 : _38[1].split(/(, \[)/g).filter((g) => !g.includes(', [')).map((r) => {
                    var _b, _c;
                    return ({
                        id: (_b = r.match(/\/(\d+)/)) === null || _b === void 0 ? void 0 : _b[1],
                        name: (_c = r.match(/([^)]+)\]/)) === null || _c === void 0 ? void 0 : _c[1].replace(/\[/g, ''),
                    });
                });
                const dislikes = (_39 = Character.description.match(/__Dislikes:__(.*)/)) === null || _39 === void 0 ? void 0 : _39[1];
                const sign = (_40 = Character.description.match(/__Sign:__(.*)/)) === null || _40 === void 0 ? void 0 : _40[1];
                const zodicSign = (_42 = (_41 = Character.description.match(/__Zodiac sign:__(.*)/)) === null || _41 === void 0 ? void 0 : _41[1]) === null || _42 === void 0 ? void 0 : _42.trim();
                const zodicAnimal = (_44 = (_43 = Character.description.match(/__Zodiac Animal:__(.*)/)) === null || _43 === void 0 ? void 0 : _43[1]) === null || _44 === void 0 ? void 0 : _44.trim();
                const themeSong = (_46 = (_45 = Character.description.match(/__Theme Song:__(.*)/)) === null || _45 === void 0 ? void 0 : _45[1]) === null || _46 === void 0 ? void 0 : _46.trim();
                Character.description = Character.description.replace(/__Theme Song:__(.*)\n|__Race:__(.*)\n|__Height:__(.*)\n|__Relatives:__(.*)\n|__Rank:__(.*)\n|__Zodiac sign:__(.*)\n|__Zodiac Animal:__(.*)\n|__Weight:__(.*)\n|__Eye Color:__(.*)\n|__Hair Color:__(.*)\n|__Dislikes:__(.*)\n|__Sign:__(.*)\n|__Partner:__(.*)\n|__Previous Position:__(.*)\n|__Occupation:__(.*)\n/gm, '');
                const characterInfo = {
                    id: Character.id,
                    name: {
                        first: (_47 = Character.name) === null || _47 === void 0 ? void 0 : _47.first,
                        last: (_48 = Character.name) === null || _48 === void 0 ? void 0 : _48.last,
                        full: (_49 = Character.name) === null || _49 === void 0 ? void 0 : _49.full,
                        native: (_50 = Character.name) === null || _50 === void 0 ? void 0 : _50.native,
                        userPreferred: (_51 = Character.name) === null || _51 === void 0 ? void 0 : _51.userPreferred,
                        alternative: (_52 = Character.name) === null || _52 === void 0 ? void 0 : _52.alternative,
                        alternativeSpoiler: (_53 = Character.name) === null || _53 === void 0 ? void 0 : _53.alternativeSpoiler,
                    },
                    image: (_55 = (_54 = Character.image) === null || _54 === void 0 ? void 0 : _54.large) !== null && _55 !== void 0 ? _55 : (_56 = Character.image) === null || _56 === void 0 ? void 0 : _56.medium,
                    description: Character.description,
                    gender: Character.gender,
                    dateOfBirth: {
                        year: (_57 = Character.dateOfBirth) === null || _57 === void 0 ? void 0 : _57.year,
                        month: (_58 = Character.dateOfBirth) === null || _58 === void 0 ? void 0 : _58.month,
                        day: (_59 = Character.dateOfBirth) === null || _59 === void 0 ? void 0 : _59.day,
                    },
                    bloodType: Character.bloodType,
                    age: Character.age,
                    hairColor: hairColor,
                    eyeColor: eyeColor,
                    height: height,
                    weight: weight,
                    occupation: occupation,
                    partner: partner,
                    relatives: relatives,
                    race: race,
                    rank: rank,
                    previousPosition: previousPosition,
                    dislikes: dislikes,
                    sign: sign,
                    zodicSign: zodicSign,
                    zodicAnimal: zodicAnimal,
                    themeSong: themeSong,
                    relations: (_60 = Character.media.edges) === null || _60 === void 0 ? void 0 : _60.map((v) => {
                        var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                        return ({
                            id: v.node.id,
                            malId: v.node.idMal,
                            role: v.characterRole,
                            title: {
                                romaji: (_b = v.node.title) === null || _b === void 0 ? void 0 : _b.romaji,
                                english: (_c = v.node.title) === null || _c === void 0 ? void 0 : _c.english,
                                native: (_d = v.node.title) === null || _d === void 0 ? void 0 : _d.native,
                                userPreferred: (_e = v.node.title) === null || _e === void 0 ? void 0 : _e.userPreferred,
                            },
                            status: v.node.status == 'RELEASING'
                                ? models_1.MediaStatus.ONGOING
                                : v.node.status == 'FINISHED'
                                    ? models_1.MediaStatus.COMPLETED
                                    : v.node.status == 'NOT_YET_RELEASED'
                                        ? models_1.MediaStatus.NOT_YET_AIRED
                                        : v.node.status == 'CANCELLED'
                                            ? models_1.MediaStatus.CANCELLED
                                            : v.node.status == 'HIATUS'
                                                ? models_1.MediaStatus.HIATUS
                                                : models_1.MediaStatus.UNKNOWN,
                            episodes: v.node.episodes,
                            image: (_j = (_g = (_f = v.node.coverImage) === null || _f === void 0 ? void 0 : _f.extraLarge) !== null && _g !== void 0 ? _g : (_h = v.node.coverImage) === null || _h === void 0 ? void 0 : _h.large) !== null && _j !== void 0 ? _j : (_k = v.node.coverImage) === null || _k === void 0 ? void 0 : _k.medium,
                            rating: v.node.averageScore,
                            releaseDate: (_l = v.node.startDate) === null || _l === void 0 ? void 0 : _l.year,
                            type: v.node.format,
                            color: (_m = v.node.coverImage) === null || _m === void 0 ? void 0 : _m.color,
                        });
                    }),
                };
                return characterInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        this.findMangaSlug = (provider, title, malId) => __awaiter(this, void 0, void 0, function* () {
            const slug = title.replace(/[^0-9a-zA-Z]+/g, ' ');
            let possibleManga;
            if (malId) {
                const malAsyncReq = yield (0, axios_1.default)({
                    method: 'GET',
                    url: `${this.malSyncUrl}/mal/manga/${malId}`,
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
                    const possibleSource = sites.find(s => s.page.toLowerCase() === provider.name.toLowerCase());
                    if (possibleSource)
                        possibleManga = yield provider.fetchMangaInfo(possibleSource.url.split('/').pop());
                    else
                        possibleManga = yield this.findMangaRaw(provider, slug, title);
                }
                else
                    possibleManga = yield this.findMangaRaw(provider, slug, title);
            }
            else
                possibleManga = yield this.findMangaRaw(provider, slug, title);
            const possibleProviderChapters = possibleManga.chapters;
            return possibleProviderChapters;
        });
        this.findMangaRaw = (provider, slug, title) => __awaiter(this, void 0, void 0, function* () {
            const findAnime = (yield provider.search(slug));
            if (findAnime.results.length === 0)
                return [];
            // TODO: use much better way than this
            const possibleManga = findAnime.results.find((manga) => title.toLowerCase() == (typeof manga.title === 'string' ? manga.title.toLowerCase() : ''));
            if (!possibleManga)
                return (yield provider.fetchMangaInfo(findAnime.results[0].id));
            return (yield provider.fetchMangaInfo(possibleManga.id));
        });
        this.findManga = (provider, title, malId) => __awaiter(this, void 0, void 0, function* () {
            var _61, _62;
            title.english = (_61 = title.english) !== null && _61 !== void 0 ? _61 : title.romaji;
            title.romaji = (_62 = title.romaji) !== null && _62 !== void 0 ? _62 : title.english;
            title.english = title.english.toLowerCase();
            title.romaji = title.romaji.toLowerCase();
            if (title.english === title.romaji) {
                return yield this.findMangaSlug(provider, title.english, malId);
            }
            const romajiPossibleEpisodes = this.findMangaSlug(provider, title.romaji, malId);
            if (romajiPossibleEpisodes) {
                return romajiPossibleEpisodes;
            }
            const englishPossibleEpisodes = this.findMangaSlug(provider, title.english, malId);
            return englishPossibleEpisodes;
        });
        this.provider = provider || new gogoanime_1.default();
    }
}
_a = Anilist;
/**
 * Anilist Anime class
 */
Anilist.Anime = _a;
/**
 * Anilist Manga Class
 */
Anilist.Manga = class Manga {
    /**
     * Maps anilist manga to any manga provider (mangadex, mangasee, etc)
     * @param provider MangaParser
     */
    constructor(provider) {
        /**
         *
         * @param query query to search for
         * @param page (optional) page number (default: `1`)
         * @param perPage (optional) number of results per page (default: `20`)
         */
        this.search = (query, page = 1, perPage = 20) => __awaiter(this, void 0, void 0, function* () {
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: (0, utils_1.anilistSearchQuery)(query, page, perPage, 'MANGA'),
            };
            try {
                const { data } = yield axios_1.default.post(new Anilist().anilistGraphqlUrl, options);
                const res = {
                    currentPage: data.data.Page.pageInfo.currentPage,
                    hasNextPage: data.data.Page.pageInfo.hasNextPage,
                    results: data.data.Page.media.map((item) => {
                        var _b, _c, _d, _e, _f, _g;
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
                            image: (_e = (_c = (_b = item.coverImage) === null || _b === void 0 ? void 0 : _b.extraLarge) !== null && _c !== void 0 ? _c : (_d = item.coverImage) === null || _d === void 0 ? void 0 : _d.large) !== null && _e !== void 0 ? _e : (_f = item.coverImage) === null || _f === void 0 ? void 0 : _f.medium,
                            cover: item.bannerImage,
                            popularity: item.popularity,
                            description: item.description,
                            rating: item.averageScore,
                            genres: item.genres,
                            color: (_g = item.coverImage) === null || _g === void 0 ? void 0 : _g.color,
                            totalChapters: item.chapters,
                            volumes: item.volumes,
                            type: item.format,
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
         * @param chapterId chapter id
         * @param args args to pass to the provider (if any)
         * @returns
         */
        this.fetchChapterPages = (chapterId, ...args) => {
            return this.provider.fetchChapterPages(chapterId, ...args);
        };
        this.fetchMangaInfo = (id, ...args) => __awaiter(this, void 0, void 0, function* () {
            var _b, _c, _d, _e, _f, _g, _h;
            const mangaInfo = {
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
                const { data } = yield axios_1.default.post(new Anilist().anilistGraphqlUrl, options).catch(err => {
                    throw new Error('Media not found');
                });
                mangaInfo.malId = data.data.Media.idMal;
                mangaInfo.title = {
                    romaji: data.data.Media.title.romaji,
                    english: data.data.Media.title.english,
                    native: data.data.Media.title.native,
                    userPreferred: data.data.Media.title.userPreferred,
                };
                if ((_b = data.data.Media.trailer) === null || _b === void 0 ? void 0 : _b.id) {
                    mangaInfo.trailer = {
                        id: data.data.Media.trailer.id,
                        site: (_c = data.data.Media.trailer) === null || _c === void 0 ? void 0 : _c.site,
                        thumbnail: (_d = data.data.Media.trailer) === null || _d === void 0 ? void 0 : _d.thumbnail,
                    };
                }
                mangaInfo.image =
                    (_f = (_e = data.data.Media.coverImage.extraLarge) !== null && _e !== void 0 ? _e : data.data.Media.coverImage.large) !== null && _f !== void 0 ? _f : data.data.Media.coverImage.medium;
                mangaInfo.popularity = data.data.Media.popularity;
                mangaInfo.color = (_g = data.data.Media.coverImage) === null || _g === void 0 ? void 0 : _g.color;
                mangaInfo.cover = (_h = data.data.Media.bannerImage) !== null && _h !== void 0 ? _h : mangaInfo.image;
                mangaInfo.description = data.data.Media.description;
                switch (data.data.Media.status) {
                    case 'RELEASING':
                        mangaInfo.status = models_1.MediaStatus.ONGOING;
                        break;
                    case 'FINISHED':
                        mangaInfo.status = models_1.MediaStatus.COMPLETED;
                        break;
                    case 'NOT_YET_RELEASED':
                        mangaInfo.status = models_1.MediaStatus.NOT_YET_AIRED;
                        break;
                    case 'CANCELLED':
                        mangaInfo.status = models_1.MediaStatus.CANCELLED;
                        break;
                    case 'HIATUS':
                        mangaInfo.status = models_1.MediaStatus.HIATUS;
                    default:
                        mangaInfo.status = models_1.MediaStatus.UNKNOWN;
                }
                mangaInfo.releaseDate = data.data.Media.startDate.year;
                mangaInfo.startDate = {
                    year: data.data.Media.startDate.year,
                    month: data.data.Media.startDate.month,
                    day: data.data.Media.startDate.day,
                };
                mangaInfo.endDate = {
                    year: data.data.Media.endDate.year,
                    month: data.data.Media.endDate.month,
                    day: data.data.Media.endDate.day,
                };
                mangaInfo.rating = data.data.Media.averageScore;
                mangaInfo.genres = data.data.Media.genres;
                mangaInfo.season = data.data.Media.season;
                mangaInfo.studios = data.data.Media.studios.edges.map((item) => item.node.name);
                mangaInfo.type = data.data.Media.format;
                mangaInfo.recommendations = data.data.Media.recommendations.edges.map((item) => {
                    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12;
                    return ({
                        id: (_b = item.node.mediaRecommendation) === null || _b === void 0 ? void 0 : _b.id,
                        malId: (_c = item.node.mediaRecommendation) === null || _c === void 0 ? void 0 : _c.idMal,
                        title: {
                            romaji: (_e = (_d = item.node.mediaRecommendation) === null || _d === void 0 ? void 0 : _d.title) === null || _e === void 0 ? void 0 : _e.romaji,
                            english: (_g = (_f = item.node.mediaRecommendation) === null || _f === void 0 ? void 0 : _f.title) === null || _g === void 0 ? void 0 : _g.english,
                            native: (_j = (_h = item.node.mediaRecommendation) === null || _h === void 0 ? void 0 : _h.title) === null || _j === void 0 ? void 0 : _j.native,
                            userPreferred: (_l = (_k = item.node.mediaRecommendation) === null || _k === void 0 ? void 0 : _k.title) === null || _l === void 0 ? void 0 : _l.userPreferred,
                        },
                        status: ((_m = item.node.mediaRecommendation) === null || _m === void 0 ? void 0 : _m.status) == 'RELEASING'
                            ? models_1.MediaStatus.ONGOING
                            : ((_o = item.node.mediaRecommendation) === null || _o === void 0 ? void 0 : _o.status) == 'FINISHED'
                                ? models_1.MediaStatus.COMPLETED
                                : ((_p = item.node.mediaRecommendation) === null || _p === void 0 ? void 0 : _p.status) == 'NOT_YET_RELEASED'
                                    ? models_1.MediaStatus.NOT_YET_AIRED
                                    : ((_q = item.node.mediaRecommendation) === null || _q === void 0 ? void 0 : _q.status) == 'CANCELLED'
                                        ? models_1.MediaStatus.CANCELLED
                                        : ((_r = item.node.mediaRecommendation) === null || _r === void 0 ? void 0 : _r.status) == 'HIATUS'
                                            ? models_1.MediaStatus.HIATUS
                                            : models_1.MediaStatus.UNKNOWN,
                        chapters: (_s = item.node.mediaRecommendation) === null || _s === void 0 ? void 0 : _s.chapters,
                        image: (_y = (_v = (_u = (_t = item.node.mediaRecommendation) === null || _t === void 0 ? void 0 : _t.coverImage) === null || _u === void 0 ? void 0 : _u.extraLarge) !== null && _v !== void 0 ? _v : (_x = (_w = item.node.mediaRecommendation) === null || _w === void 0 ? void 0 : _w.coverImage) === null || _x === void 0 ? void 0 : _x.large) !== null && _y !== void 0 ? _y : (_0 = (_z = item.node.mediaRecommendation) === null || _z === void 0 ? void 0 : _z.coverImage) === null || _0 === void 0 ? void 0 : _0.medium,
                        cover: (_8 = (_5 = (_2 = (_1 = item.node.mediaRecommendation) === null || _1 === void 0 ? void 0 : _1.bannerImage) !== null && _2 !== void 0 ? _2 : (_4 = (_3 = item.node.mediaRecommendation) === null || _3 === void 0 ? void 0 : _3.coverImage) === null || _4 === void 0 ? void 0 : _4.extraLarge) !== null && _5 !== void 0 ? _5 : (_7 = (_6 = item.node.mediaRecommendation) === null || _6 === void 0 ? void 0 : _6.coverImage) === null || _7 === void 0 ? void 0 : _7.large) !== null && _8 !== void 0 ? _8 : (_10 = (_9 = item.node.mediaRecommendation) === null || _9 === void 0 ? void 0 : _9.coverImage) === null || _10 === void 0 ? void 0 : _10.medium,
                        rating: (_11 = item.node.mediaRecommendation) === null || _11 === void 0 ? void 0 : _11.meanScore,
                        type: (_12 = item.node.mediaRecommendation) === null || _12 === void 0 ? void 0 : _12.format,
                    });
                });
                mangaInfo.characters = data.data.Media.characters.edges.map((item) => {
                    var _b, _c;
                    return ({
                        id: (_b = item.node) === null || _b === void 0 ? void 0 : _b.id,
                        role: item.role,
                        name: {
                            first: item.node.name.first,
                            last: item.node.name.last,
                            full: item.node.name.full,
                            native: item.node.name.native,
                            userPreferred: item.node.name.userPreferred,
                        },
                        image: (_c = item.node.image.large) !== null && _c !== void 0 ? _c : item.node.image.medium,
                    });
                });
                mangaInfo.relations = data.data.Media.relations.edges.map((item) => {
                    var _b, _c, _d, _e, _f, _g;
                    return ({
                        id: item.node.id,
                        relationType: item.relationType,
                        malId: item.node.idMal,
                        title: {
                            romaji: item.node.title.romaji,
                            english: item.node.title.english,
                            native: item.node.title.native,
                            userPreferred: item.node.title.userPreferred,
                        },
                        status: item.node.status == 'RELEASING'
                            ? models_1.MediaStatus.ONGOING
                            : item.node.status == 'FINISHED'
                                ? models_1.MediaStatus.COMPLETED
                                : item.node.status == 'NOT_YET_RELEASED'
                                    ? models_1.MediaStatus.NOT_YET_AIRED
                                    : item.node.status == 'CANCELLED'
                                        ? models_1.MediaStatus.CANCELLED
                                        : item.node.status == 'HIATUS'
                                            ? models_1.MediaStatus.HIATUS
                                            : models_1.MediaStatus.UNKNOWN,
                        chapters: item.node.chapters,
                        image: (_c = (_b = item.node.coverImage.extraLarge) !== null && _b !== void 0 ? _b : item.node.coverImage.large) !== null && _c !== void 0 ? _c : item.node.coverImage.medium,
                        color: (_d = item.node.coverImage) === null || _d === void 0 ? void 0 : _d.color,
                        type: item.node.format,
                        cover: (_g = (_f = (_e = item.node.bannerImage) !== null && _e !== void 0 ? _e : item.node.coverImage.extraLarge) !== null && _f !== void 0 ? _f : item.node.coverImage.large) !== null && _g !== void 0 ? _g : item.node.coverImage.medium,
                        rating: item.node.meanScore,
                    });
                });
                mangaInfo.chapters = yield new Anilist().findManga(this.provider, { english: mangaInfo.title.english, romaji: mangaInfo.title.romaji }, mangaInfo.malId);
                return mangaInfo;
            }
            catch (error) {
                throw Error(error.message);
            }
        });
        this.provider = provider || new mangasee123_1.default();
    }
};
// (async () => {
//   const ani = new Anilist(
//     await Crunchyroll.create(
//       undefined,
//       'O+xmBPFx1UxoAiQYjDc9YYq01SdCZo1ABBoHDrNuIScEIKmYfIZoj57l1xeoLWGW3R2ZlxPlyqUf5R3hWzx+xSQnmPyk3GoUIFF19P0oCqp2B9ivNhtYiqir06rBK71mRzIjVUCmN3C7MvQUhH82QQhiUPhOY962XyXwVpfRNIQ=',
//       undefined
//     )
//   );
//   console.time('fetch');
//   const res = await ani.fetchAnimeInfo('98659');
//   console.log(res);
//   console.timeEnd('fetch');
// })();
// (async () => {
//   const ani = new Anilist(
//     new Bilibili(    )
//   );
//   console.time('fetch');
//   const res = await ani.fetchAnimeInfo('98659');
//   const sources = await ani.fetchEpisodeSources(res.episodes![0].id);
//   console.log(sources);
//   console.timeEnd('fetch');
// })();
exports.default = Anilist;
//# sourceMappingURL=anilist.js.map