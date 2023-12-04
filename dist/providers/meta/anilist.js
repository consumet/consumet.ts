"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../../models");
const utils_1 = require("../../utils");
const gogoanime_1 = __importDefault(require("../../providers/anime/gogoanime"));
const anify_1 = __importDefault(require("../anime/anify"));
const zoro_1 = __importDefault(require("../anime/zoro"));
const mangasee123_1 = __importDefault(require("../manga/mangasee123"));
const crunchyroll_1 = __importDefault(require("../anime/crunchyroll"));
const bilibili_1 = __importDefault(require("../anime/bilibili"));
const _9anime_1 = __importDefault(require("../anime/9anime"));
const utils_2 = require("../../utils/utils");
class Anilist extends models_1.AnimeParser {
    /**
     * This class maps anilist to kitsu with any other anime provider.
     * kitsu is used for episode images, titles and description.
     * @param provider anime provider (optional) default: Gogoanime
     * @param proxyConfig proxy config (optional)
     * @param adapter axios adapter (optional)
     */
    constructor(provider, proxyConfig, adapter) {
        super(proxyConfig, adapter);
        this.proxyConfig = proxyConfig;
        this.name = 'Anilist';
        this.baseUrl = 'https://anilist.co';
        this.logo = 'https://upload.wikimedia.org/wikipedia/commons/6/61/AniList_logo.svg';
        this.classPath = 'META.Anilist';
        this.anilistGraphqlUrl = 'https://graphql.anilist.co';
        this.kitsuGraphqlUrl = 'https://kitsu.io/api/graphql';
        this.malSyncUrl = 'https://api.malsync.moe';
        this.anifyUrl = 'https://api.anify.tv';
        /**
         * @param query Search query
         * @param page Page number (optional)
         * @param perPage Number of results per page (optional) (default: 15) (max: 50)
         */
        this.search = async (query, page = 1, perPage = 15) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: utils_1.anilistSearchQuery(query, page, perPage),
            };
            try {
                let { data, status } = await this.client.post(this.anilistGraphqlUrl, options, {
                    validateStatus: () => true,
                });
                if (status >= 500 || status == 429)
                    data = await new anify_1.default().rawSearch(query, page);
                const res = {
                    currentPage: (_c = (_b = (_a = data.data.Page) === null || _a === void 0 ? void 0 : _a.pageInfo) === null || _b === void 0 ? void 0 : _b.currentPage) !== null && _c !== void 0 ? _c : (_d = data.meta) === null || _d === void 0 ? void 0 : _d.currentPage,
                    hasNextPage: (_g = (_f = (_e = data.data.Page) === null || _e === void 0 ? void 0 : _e.pageInfo) === null || _f === void 0 ? void 0 : _f.hasNextPage) !== null && _g !== void 0 ? _g : ((_h = data.meta) === null || _h === void 0 ? void 0 : _h.currentPage) != ((_j = data.meta) === null || _j === void 0 ? void 0 : _j.lastPage),
                    results: (_o = (_m = (_l = (_k = data.data) === null || _k === void 0 ? void 0 : _k.Page) === null || _l === void 0 ? void 0 : _l.media) === null || _m === void 0 ? void 0 : _m.map((item) => {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
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
                            image: (_d = (_b = (_a = item.coverImage) === null || _a === void 0 ? void 0 : _a.extraLarge) !== null && _b !== void 0 ? _b : (_c = item.coverImage) === null || _c === void 0 ? void 0 : _c.large) !== null && _d !== void 0 ? _d : (_e = item.coverImage) === null || _e === void 0 ? void 0 : _e.medium,
                            imageHash: utils_2.getHashFromImage((_j = (_g = (_f = item.coverImage) === null || _f === void 0 ? void 0 : _f.extraLarge) !== null && _g !== void 0 ? _g : (_h = item.coverImage) === null || _h === void 0 ? void 0 : _h.large) !== null && _j !== void 0 ? _j : (_k = item.coverImage) === null || _k === void 0 ? void 0 : _k.medium),
                            cover: item.bannerImage,
                            coverHash: utils_2.getHashFromImage(item.bannerImage),
                            popularity: item.popularity,
                            description: item.description,
                            rating: item.averageScore,
                            genres: item.genres,
                            color: (_l = item.coverImage) === null || _l === void 0 ? void 0 : _l.color,
                            totalEpisodes: (_m = item.episodes) !== null && _m !== void 0 ? _m : ((_o = item.nextAiringEpisode) === null || _o === void 0 ? void 0 : _o.episode) - 1,
                            currentEpisodeCount: (item === null || item === void 0 ? void 0 : item.nextAiringEpisode)
                                ? ((_p = item === null || item === void 0 ? void 0 : item.nextAiringEpisode) === null || _p === void 0 ? void 0 : _p.episode) - 1
                                : item.episodes,
                            type: item.format,
                            releaseDate: item.seasonYear,
                        });
                    })) !== null && _o !== void 0 ? _o : data.data.map((item) => {
                        var _a, _b, _c;
                        return ({
                            id: item.anilistId.toString(),
                            malId: item.mappings['mal'],
                            title: item.title,
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
                            image: (_a = item.coverImage) !== null && _a !== void 0 ? _a : item.bannerImage,
                            imageHash: utils_2.getHashFromImage((_b = item.coverImage) !== null && _b !== void 0 ? _b : item.bannerImage),
                            cover: item.bannerImage,
                            coverHash: utils_2.getHashFromImage(item.bannerImage),
                            popularity: item.popularity,
                            description: item.description,
                            rating: item.averageScore,
                            genres: item.genre,
                            color: item.color,
                            totalEpisodes: item.currentEpisode,
                            currentEpisodeCount: (item === null || item === void 0 ? void 0 : item.nextAiringEpisode)
                                ? ((_c = item === null || item === void 0 ? void 0 : item.nextAiringEpisode) === null || _c === void 0 ? void 0 : _c.episode) - 1
                                : item.currentEpisode,
                            type: item.format,
                            releaseDate: item.year,
                        });
                    }),
                };
                return res;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
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
        this.advancedSearch = async (query, type = 'ANIME', page = 1, perPage = 20, format, sort, genres, id, year, status, season) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: utils_1.anilistAdvancedQuery(),
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
                let { data, status } = await this.client.post(this.anilistGraphqlUrl, options, {
                    validateStatus: () => true,
                });
                if (status >= 500 && !query)
                    throw new Error('No results found');
                if (status >= 500)
                    data = await new anify_1.default().rawSearch(query, page);
                const res = {
                    currentPage: (_d = (_c = (_b = (_a = data.data) === null || _a === void 0 ? void 0 : _a.Page) === null || _b === void 0 ? void 0 : _b.pageInfo) === null || _c === void 0 ? void 0 : _c.currentPage) !== null && _d !== void 0 ? _d : (_e = data.meta) === null || _e === void 0 ? void 0 : _e.currentPage,
                    hasNextPage: (_j = (_h = (_g = (_f = data.data) === null || _f === void 0 ? void 0 : _f.Page) === null || _g === void 0 ? void 0 : _g.pageInfo) === null || _h === void 0 ? void 0 : _h.hasNextPage) !== null && _j !== void 0 ? _j : ((_k = data.meta) === null || _k === void 0 ? void 0 : _k.currentPage) != ((_l = data.meta) === null || _l === void 0 ? void 0 : _l.lastPage),
                    totalPages: (_p = (_o = (_m = data.data) === null || _m === void 0 ? void 0 : _m.Page) === null || _o === void 0 ? void 0 : _o.pageInfo) === null || _p === void 0 ? void 0 : _p.lastPage,
                    totalResults: (_s = (_r = (_q = data.data) === null || _q === void 0 ? void 0 : _q.Page) === null || _r === void 0 ? void 0 : _r.pageInfo) === null || _s === void 0 ? void 0 : _s.total,
                    results: [],
                };
                res.results.push(...((_w = (_v = (_u = (_t = data.data) === null || _t === void 0 ? void 0 : _t.Page) === null || _u === void 0 ? void 0 : _u.media) === null || _v === void 0 ? void 0 : _v.map((item) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
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
                        imageHash: utils_2.getHashFromImage((_d = (_c = item.coverImage.extraLarge) !== null && _c !== void 0 ? _c : item.coverImage.large) !== null && _d !== void 0 ? _d : item.coverImage.medium),
                        cover: item.bannerImage,
                        coverHash: utils_2.getHashFromImage(item.bannerImage),
                        popularity: item.popularity,
                        totalEpisodes: (_e = item.episodes) !== null && _e !== void 0 ? _e : ((_f = item.nextAiringEpisode) === null || _f === void 0 ? void 0 : _f.episode) - 1,
                        currentEpisode: (_h = ((_g = item.nextAiringEpisode) === null || _g === void 0 ? void 0 : _g.episode) - 1) !== null && _h !== void 0 ? _h : item.episodes,
                        countryOfOrigin: item.countryOfOrigin,
                        description: item.description,
                        genres: item.genres,
                        rating: item.averageScore,
                        color: (_j = item.coverImage) === null || _j === void 0 ? void 0 : _j.color,
                        type: item.format,
                        releaseDate: item.seasonYear,
                    });
                })) !== null && _w !== void 0 ? _w : (_x = data.data) === null || _x === void 0 ? void 0 : _x.map((item) => {
                    var _a, _b;
                    return ({
                        id: item.anilistId.toString(),
                        malId: item.mappings['mal'],
                        title: item.title,
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
                        image: (_a = item.coverImage) !== null && _a !== void 0 ? _a : item.bannerImage,
                        imageHash: utils_2.getHashFromImage((_b = item.coverImage) !== null && _b !== void 0 ? _b : item.bannerImage),
                        cover: item.bannerImage,
                        coverHash: utils_2.getHashFromImage(item.bannerImage),
                        popularity: item.popularity,
                        description: item.description,
                        rating: item.averageScore,
                        genres: item.genre,
                        color: item.color,
                        totalEpisodes: item.currentEpisode,
                        type: item.format,
                        releaseDate: item.year,
                    });
                })));
                return res;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         *
         * @param id Anime id
         * @param dub to get dubbed episodes (optional) set to `true` to get dubbed episodes. **ONLY WORKS FOR GOGOANIME**
         * @param fetchFiller to get filler boolean on the episode object (optional) set to `true` to get filler boolean on the episode object.
         */
        this.fetchAnimeInfo = async (id, dub = false, fetchFiller = false) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55, _56, _57, _58, _59, _60, _61, _62, _63, _64, _65, _66, _67, _68, _69, _70, _71, _72, _73, _74, _75, _76, _77, _78, _79, _80, _81;
            const animeInfo = {
                id: id,
                title: '',
            };
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: utils_1.anilistMediaDetailQuery(id),
            };
            let fillerEpisodes;
            try {
                let { data, status } = await this.client.post(this.anilistGraphqlUrl, options, {
                    validateStatus: () => true,
                });
                if (status == 404)
                    throw new Error('Media not found. Perhaps the id is invalid or the anime is not in anilist');
                if (status == 429)
                    throw new Error('You have been ratelimited by anilist. Please try again later');
                // if (status >= 500) throw new Error('Anilist seems to be down. Please try again later');
                if (status != 200 && status < 429)
                    throw Error('Media not found. If the problem persists, please contact the developer');
                if (status >= 500)
                    data = await new anify_1.default().fetchAnimeInfoByIdRaw(id);
                animeInfo.malId = (_c = (_b = (_a = data.data) === null || _a === void 0 ? void 0 : _a.Media) === null || _b === void 0 ? void 0 : _b.idMal) !== null && _c !== void 0 ? _c : (_d = data === null || data === void 0 ? void 0 : data.mappings) === null || _d === void 0 ? void 0 : _d.mal;
                animeInfo.title = data.data.Media
                    ? {
                        romaji: data.data.Media.title.romaji,
                        english: data.data.Media.title.english,
                        native: data.data.Media.title.native,
                        userPreferred: data.data.Media.title.userPreferred,
                    }
                    : data.data.title;
                animeInfo.synonyms = (_g = (_f = (_e = data.data) === null || _e === void 0 ? void 0 : _e.Media) === null || _f === void 0 ? void 0 : _f.synonyms) !== null && _g !== void 0 ? _g : data === null || data === void 0 ? void 0 : data.synonyms;
                animeInfo.isLicensed = (_k = (_j = (_h = data.data) === null || _h === void 0 ? void 0 : _h.Media) === null || _j === void 0 ? void 0 : _j.isLicensed) !== null && _k !== void 0 ? _k : undefined;
                animeInfo.isAdult = (_o = (_m = (_l = data.data) === null || _l === void 0 ? void 0 : _l.Media) === null || _m === void 0 ? void 0 : _m.isAdult) !== null && _o !== void 0 ? _o : undefined;
                animeInfo.countryOfOrigin = (_r = (_q = (_p = data.data) === null || _p === void 0 ? void 0 : _p.Media) === null || _q === void 0 ? void 0 : _q.countryOfOrigin) !== null && _r !== void 0 ? _r : undefined;
                if ((_u = (_t = (_s = data.data) === null || _s === void 0 ? void 0 : _s.Media) === null || _t === void 0 ? void 0 : _t.trailer) === null || _u === void 0 ? void 0 : _u.id) {
                    animeInfo.trailer = {
                        id: data.data.Media.trailer.id,
                        site: (_v = data.data.Media.trailer) === null || _v === void 0 ? void 0 : _v.site,
                        thumbnail: (_w = data.data.Media.trailer) === null || _w === void 0 ? void 0 : _w.thumbnail,
                        thumbnailHash: utils_2.getHashFromImage((_x = data.data.Media.trailer) === null || _x === void 0 ? void 0 : _x.thumbnail),
                    };
                }
                animeInfo.image =
                    (_10 = (_9 = (_5 = (_1 = (_0 = (_z = (_y = data.data) === null || _y === void 0 ? void 0 : _y.Media) === null || _z === void 0 ? void 0 : _z.coverImage) === null || _0 === void 0 ? void 0 : _0.extraLarge) !== null && _1 !== void 0 ? _1 : (_4 = (_3 = (_2 = data.data) === null || _2 === void 0 ? void 0 : _2.Media) === null || _3 === void 0 ? void 0 : _3.coverImage) === null || _4 === void 0 ? void 0 : _4.large) !== null && _5 !== void 0 ? _5 : (_8 = (_7 = (_6 = data.data) === null || _6 === void 0 ? void 0 : _6.Media) === null || _7 === void 0 ? void 0 : _7.coverImage) === null || _8 === void 0 ? void 0 : _8.medium) !== null && _9 !== void 0 ? _9 : data.coverImage) !== null && _10 !== void 0 ? _10 : data.bannerImage;
                animeInfo.imageHash = utils_2.getHashFromImage((_23 = (_22 = (_18 = (_14 = (_13 = (_12 = (_11 = data.data) === null || _11 === void 0 ? void 0 : _11.Media) === null || _12 === void 0 ? void 0 : _12.coverImage) === null || _13 === void 0 ? void 0 : _13.extraLarge) !== null && _14 !== void 0 ? _14 : (_17 = (_16 = (_15 = data.data) === null || _15 === void 0 ? void 0 : _15.Media) === null || _16 === void 0 ? void 0 : _16.coverImage) === null || _17 === void 0 ? void 0 : _17.large) !== null && _18 !== void 0 ? _18 : (_21 = (_20 = (_19 = data.data) === null || _19 === void 0 ? void 0 : _19.Media) === null || _20 === void 0 ? void 0 : _20.coverImage) === null || _21 === void 0 ? void 0 : _21.medium) !== null && _22 !== void 0 ? _22 : data.coverImage) !== null && _23 !== void 0 ? _23 : data.bannerImage);
                animeInfo.popularity = (_26 = (_25 = (_24 = data.data) === null || _24 === void 0 ? void 0 : _24.Media) === null || _25 === void 0 ? void 0 : _25.popularity) !== null && _26 !== void 0 ? _26 : data === null || data === void 0 ? void 0 : data.popularity;
                animeInfo.color = (_30 = (_29 = (_28 = (_27 = data.data) === null || _27 === void 0 ? void 0 : _27.Media) === null || _28 === void 0 ? void 0 : _28.coverImage) === null || _29 === void 0 ? void 0 : _29.color) !== null && _30 !== void 0 ? _30 : data === null || data === void 0 ? void 0 : data.color;
                animeInfo.cover = (_34 = (_33 = (_32 = (_31 = data.data) === null || _31 === void 0 ? void 0 : _31.Media) === null || _32 === void 0 ? void 0 : _32.bannerImage) !== null && _33 !== void 0 ? _33 : data === null || data === void 0 ? void 0 : data.bannerImage) !== null && _34 !== void 0 ? _34 : animeInfo.image;
                animeInfo.coverHash = utils_2.getHashFromImage((_38 = (_37 = (_36 = (_35 = data.data) === null || _35 === void 0 ? void 0 : _35.Media) === null || _36 === void 0 ? void 0 : _36.bannerImage) !== null && _37 !== void 0 ? _37 : data === null || data === void 0 ? void 0 : data.bannerImage) !== null && _38 !== void 0 ? _38 : animeInfo.image);
                animeInfo.description = (_41 = (_40 = (_39 = data.data) === null || _39 === void 0 ? void 0 : _39.Media) === null || _40 === void 0 ? void 0 : _40.description) !== null && _41 !== void 0 ? _41 : data === null || data === void 0 ? void 0 : data.description;
                switch ((_44 = (_43 = (_42 = data.data) === null || _42 === void 0 ? void 0 : _42.Media) === null || _43 === void 0 ? void 0 : _43.status) !== null && _44 !== void 0 ? _44 : data === null || data === void 0 ? void 0 : data.status) {
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
                animeInfo.releaseDate = (_48 = (_47 = (_46 = (_45 = data.data) === null || _45 === void 0 ? void 0 : _45.Media) === null || _46 === void 0 ? void 0 : _46.startDate) === null || _47 === void 0 ? void 0 : _47.year) !== null && _48 !== void 0 ? _48 : data.year;
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
                if ((_49 = data.data.Media.nextAiringEpisode) === null || _49 === void 0 ? void 0 : _49.airingAt)
                    animeInfo.nextAiringEpisode = {
                        airingTime: (_50 = data.data.Media.nextAiringEpisode) === null || _50 === void 0 ? void 0 : _50.airingAt,
                        timeUntilAiring: (_51 = data.data.Media.nextAiringEpisode) === null || _51 === void 0 ? void 0 : _51.timeUntilAiring,
                        episode: (_52 = data.data.Media.nextAiringEpisode) === null || _52 === void 0 ? void 0 : _52.episode,
                    };
                animeInfo.totalEpisodes = (_54 = (_53 = data.data.Media) === null || _53 === void 0 ? void 0 : _53.episodes) !== null && _54 !== void 0 ? _54 : ((_55 = data.data.Media.nextAiringEpisode) === null || _55 === void 0 ? void 0 : _55.episode) - 1;
                animeInfo.currentEpisode = ((_57 = (_56 = data.data.Media) === null || _56 === void 0 ? void 0 : _56.nextAiringEpisode) === null || _57 === void 0 ? void 0 : _57.episode)
                    ? ((_58 = data.data.Media.nextAiringEpisode) === null || _58 === void 0 ? void 0 : _58.episode) - 1
                    : (_59 = data.data.Media) === null || _59 === void 0 ? void 0 : _59.episodes;
                animeInfo.rating = data.data.Media.averageScore;
                animeInfo.duration = data.data.Media.duration;
                animeInfo.genres = data.data.Media.genres;
                animeInfo.season = data.data.Media.season;
                animeInfo.studios = data.data.Media.studios.edges.map((item) => item.node.name);
                animeInfo.subOrDub = dub ? models_1.SubOrSub.DUB : models_1.SubOrSub.SUB;
                animeInfo.type = data.data.Media.format;
                animeInfo.recommendations = (_62 = (_61 = (_60 = data.data.Media) === null || _60 === void 0 ? void 0 : _60.recommendations) === null || _61 === void 0 ? void 0 : _61.edges) === null || _62 === void 0 ? void 0 : _62.map((item) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29;
                    return ({
                        id: (_a = item.node.mediaRecommendation) === null || _a === void 0 ? void 0 : _a.id,
                        malId: (_b = item.node.mediaRecommendation) === null || _b === void 0 ? void 0 : _b.idMal,
                        title: {
                            romaji: (_d = (_c = item.node.mediaRecommendation) === null || _c === void 0 ? void 0 : _c.title) === null || _d === void 0 ? void 0 : _d.romaji,
                            english: (_f = (_e = item.node.mediaRecommendation) === null || _e === void 0 ? void 0 : _e.title) === null || _f === void 0 ? void 0 : _f.english,
                            native: (_h = (_g = item.node.mediaRecommendation) === null || _g === void 0 ? void 0 : _g.title) === null || _h === void 0 ? void 0 : _h.native,
                            userPreferred: (_k = (_j = item.node.mediaRecommendation) === null || _j === void 0 ? void 0 : _j.title) === null || _k === void 0 ? void 0 : _k.userPreferred,
                        },
                        status: ((_l = item.node.mediaRecommendation) === null || _l === void 0 ? void 0 : _l.status) == 'RELEASING'
                            ? models_1.MediaStatus.ONGOING
                            : ((_m = item.node.mediaRecommendation) === null || _m === void 0 ? void 0 : _m.status) == 'FINISHED'
                                ? models_1.MediaStatus.COMPLETED
                                : ((_o = item.node.mediaRecommendation) === null || _o === void 0 ? void 0 : _o.status) == 'NOT_YET_RELEASED'
                                    ? models_1.MediaStatus.NOT_YET_AIRED
                                    : ((_p = item.node.mediaRecommendation) === null || _p === void 0 ? void 0 : _p.status) == 'CANCELLED'
                                        ? models_1.MediaStatus.CANCELLED
                                        : ((_q = item.node.mediaRecommendation) === null || _q === void 0 ? void 0 : _q.status) == 'HIATUS'
                                            ? models_1.MediaStatus.HIATUS
                                            : models_1.MediaStatus.UNKNOWN,
                        episodes: (_r = item.node.mediaRecommendation) === null || _r === void 0 ? void 0 : _r.episodes,
                        image: (_x = (_u = (_t = (_s = item.node.mediaRecommendation) === null || _s === void 0 ? void 0 : _s.coverImage) === null || _t === void 0 ? void 0 : _t.extraLarge) !== null && _u !== void 0 ? _u : (_w = (_v = item.node.mediaRecommendation) === null || _v === void 0 ? void 0 : _v.coverImage) === null || _w === void 0 ? void 0 : _w.large) !== null && _x !== void 0 ? _x : (_z = (_y = item.node.mediaRecommendation) === null || _y === void 0 ? void 0 : _y.coverImage) === null || _z === void 0 ? void 0 : _z.medium,
                        imageHash: utils_2.getHashFromImage((_5 = (_2 = (_1 = (_0 = item.node.mediaRecommendation) === null || _0 === void 0 ? void 0 : _0.coverImage) === null || _1 === void 0 ? void 0 : _1.extraLarge) !== null && _2 !== void 0 ? _2 : (_4 = (_3 = item.node.mediaRecommendation) === null || _3 === void 0 ? void 0 : _3.coverImage) === null || _4 === void 0 ? void 0 : _4.large) !== null && _5 !== void 0 ? _5 : (_7 = (_6 = item.node.mediaRecommendation) === null || _6 === void 0 ? void 0 : _6.coverImage) === null || _7 === void 0 ? void 0 : _7.medium),
                        cover: (_15 = (_12 = (_9 = (_8 = item.node.mediaRecommendation) === null || _8 === void 0 ? void 0 : _8.bannerImage) !== null && _9 !== void 0 ? _9 : (_11 = (_10 = item.node.mediaRecommendation) === null || _10 === void 0 ? void 0 : _10.coverImage) === null || _11 === void 0 ? void 0 : _11.extraLarge) !== null && _12 !== void 0 ? _12 : (_14 = (_13 = item.node.mediaRecommendation) === null || _13 === void 0 ? void 0 : _13.coverImage) === null || _14 === void 0 ? void 0 : _14.large) !== null && _15 !== void 0 ? _15 : (_17 = (_16 = item.node.mediaRecommendation) === null || _16 === void 0 ? void 0 : _16.coverImage) === null || _17 === void 0 ? void 0 : _17.medium,
                        coverHash: utils_2.getHashFromImage((_25 = (_22 = (_19 = (_18 = item.node.mediaRecommendation) === null || _18 === void 0 ? void 0 : _18.bannerImage) !== null && _19 !== void 0 ? _19 : (_21 = (_20 = item.node.mediaRecommendation) === null || _20 === void 0 ? void 0 : _20.coverImage) === null || _21 === void 0 ? void 0 : _21.extraLarge) !== null && _22 !== void 0 ? _22 : (_24 = (_23 = item.node.mediaRecommendation) === null || _23 === void 0 ? void 0 : _23.coverImage) === null || _24 === void 0 ? void 0 : _24.large) !== null && _25 !== void 0 ? _25 : (_27 = (_26 = item.node.mediaRecommendation) === null || _26 === void 0 ? void 0 : _26.coverImage) === null || _27 === void 0 ? void 0 : _27.medium),
                        rating: (_28 = item.node.mediaRecommendation) === null || _28 === void 0 ? void 0 : _28.meanScore,
                        type: (_29 = item.node.mediaRecommendation) === null || _29 === void 0 ? void 0 : _29.format,
                    });
                });
                animeInfo.characters = (_66 = (_65 = (_64 = (_63 = data.data) === null || _63 === void 0 ? void 0 : _63.Media) === null || _64 === void 0 ? void 0 : _64.characters) === null || _65 === void 0 ? void 0 : _65.edges) === null || _66 === void 0 ? void 0 : _66.map((item) => {
                    var _a, _b, _c;
                    return ({
                        id: (_a = item.node) === null || _a === void 0 ? void 0 : _a.id,
                        role: item.role,
                        name: {
                            first: item.node.name.first,
                            last: item.node.name.last,
                            full: item.node.name.full,
                            native: item.node.name.native,
                            userPreferred: item.node.name.userPreferred,
                        },
                        image: (_b = item.node.image.large) !== null && _b !== void 0 ? _b : item.node.image.medium,
                        imageHash: utils_2.getHashFromImage((_c = item.node.image.large) !== null && _c !== void 0 ? _c : item.node.image.medium),
                        voiceActors: item.voiceActors.map((voiceActor) => {
                            var _a, _b;
                            return ({
                                id: voiceActor.id,
                                language: voiceActor.languageV2,
                                name: {
                                    first: voiceActor.name.first,
                                    last: voiceActor.name.last,
                                    full: voiceActor.name.full,
                                    native: voiceActor.name.native,
                                    userPreferred: voiceActor.name.userPreferred,
                                },
                                image: (_a = voiceActor.image.large) !== null && _a !== void 0 ? _a : voiceActor.image.medium,
                                imageHash: utils_2.getHashFromImage((_b = voiceActor.image.large) !== null && _b !== void 0 ? _b : voiceActor.image.medium),
                            });
                        }),
                    });
                });
                animeInfo.relations = (_70 = (_69 = (_68 = (_67 = data.data) === null || _67 === void 0 ? void 0 : _67.Media) === null || _68 === void 0 ? void 0 : _68.relations) === null || _69 === void 0 ? void 0 : _69.edges) === null || _70 === void 0 ? void 0 : _70.map((item) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
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
                        image: (_b = (_a = item.node.coverImage.extraLarge) !== null && _a !== void 0 ? _a : item.node.coverImage.large) !== null && _b !== void 0 ? _b : item.node.coverImage.medium,
                        imageHash: utils_2.getHashFromImage((_d = (_c = item.node.coverImage.extraLarge) !== null && _c !== void 0 ? _c : item.node.coverImage.large) !== null && _d !== void 0 ? _d : item.node.coverImage.medium),
                        color: (_e = item.node.coverImage) === null || _e === void 0 ? void 0 : _e.color,
                        type: item.node.format,
                        cover: (_h = (_g = (_f = item.node.bannerImage) !== null && _f !== void 0 ? _f : item.node.coverImage.extraLarge) !== null && _g !== void 0 ? _g : item.node.coverImage.large) !== null && _h !== void 0 ? _h : item.node.coverImage.medium,
                        coverHash: utils_2.getHashFromImage((_l = (_k = (_j = item.node.bannerImage) !== null && _j !== void 0 ? _j : item.node.coverImage.extraLarge) !== null && _k !== void 0 ? _k : item.node.coverImage.large) !== null && _l !== void 0 ? _l : item.node.coverImage.medium),
                        rating: item.node.meanScore,
                    });
                });
                if ((this.provider instanceof zoro_1.default || this.provider instanceof gogoanime_1.default) &&
                    !dub &&
                    (animeInfo.status === models_1.MediaStatus.ONGOING ||
                        utils_1.range({ from: 1940, to: new Date().getFullYear() + 1 }).includes(parseInt(animeInfo.releaseDate)))) {
                    try {
                        const anifyInfo = await new anify_1.default(this.proxyConfig, this.adapter, this.provider.name.toLowerCase()).fetchAnimeInfo(id);
                        animeInfo.mappings = anifyInfo.mappings;
                        animeInfo.artwork = anifyInfo.artwork;
                        animeInfo.episodes = (_71 = anifyInfo.episodes) === null || _71 === void 0 ? void 0 : _71.map((item) => {
                            var _a;
                            return ({
                                id: item.id,
                                title: item.title,
                                description: item.description,
                                number: item.number,
                                image: item.image,
                                imageHash: utils_2.getHashFromImage(item.image),
                                airDate: (_a = item.airDate) !== null && _a !== void 0 ? _a : null,
                            });
                        });
                        if (!((_72 = animeInfo.episodes) === null || _72 === void 0 ? void 0 : _72.length)) {
                            animeInfo.episodes = await this.fetchDefaultEpisodeList({
                                idMal: animeInfo.malId,
                                season: data.data.Media.season,
                                startDate: { year: parseInt(animeInfo.releaseDate) },
                                title: {
                                    english: (_73 = animeInfo.title) === null || _73 === void 0 ? void 0 : _73.english,
                                    romaji: (_74 = animeInfo.title) === null || _74 === void 0 ? void 0 : _74.romaji,
                                },
                            }, dub, id);
                            animeInfo.episodes = (_75 = animeInfo.episodes) === null || _75 === void 0 ? void 0 : _75.map((episode) => {
                                if (!episode.image) {
                                    episode.image = animeInfo.image;
                                    episode.imageHash = animeInfo.imageHash;
                                }
                                return episode;
                            });
                        }
                    }
                    catch (err) {
                        animeInfo.episodes = await this.fetchDefaultEpisodeList({
                            idMal: animeInfo.malId,
                            season: data.data.Media.season,
                            startDate: { year: parseInt(animeInfo.releaseDate) },
                            title: {
                                english: (_76 = animeInfo.title) === null || _76 === void 0 ? void 0 : _76.english,
                                romaji: (_77 = animeInfo.title) === null || _77 === void 0 ? void 0 : _77.romaji,
                            },
                        }, dub, id);
                        animeInfo.episodes = (_78 = animeInfo.episodes) === null || _78 === void 0 ? void 0 : _78.map((episode) => {
                            if (!episode.image) {
                                episode.image = animeInfo.image;
                                episode.imageHash = animeInfo.imageHash;
                            }
                            return episode;
                        });
                        return animeInfo;
                    }
                }
                else
                    animeInfo.episodes = await this.fetchDefaultEpisodeList({
                        idMal: animeInfo.malId,
                        season: data.data.Media.season,
                        startDate: { year: parseInt(animeInfo.releaseDate) },
                        title: {
                            english: (_79 = animeInfo.title) === null || _79 === void 0 ? void 0 : _79.english,
                            romaji: (_80 = animeInfo.title) === null || _80 === void 0 ? void 0 : _80.romaji,
                        },
                        externalLinks: data.data.Media.externalLinks.filter((link) => link.type === 'STREAMING'),
                    }, dub, id);
                if (fetchFiller) {
                    const { data: fillerData } = await this.client.get(`https://raw.githubusercontent.com/saikou-app/mal-id-filler-list/main/fillers/${animeInfo.malId}.json`, { validateStatus: () => true });
                    if (!fillerData.toString().startsWith('404')) {
                        fillerEpisodes = [];
                        fillerEpisodes === null || fillerEpisodes === void 0 ? void 0 : fillerEpisodes.push(...fillerData.episodes);
                    }
                }
                animeInfo.episodes = (_81 = animeInfo.episodes) === null || _81 === void 0 ? void 0 : _81.map((episode) => {
                    if (!episode.image) {
                        episode.image = animeInfo.image;
                        episode.imageHash = animeInfo.imageHash;
                    }
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
        };
        /**
         *
         * @param episodeId Episode id
         */
        this.fetchEpisodeSources = async (episodeId, ...args) => {
            try {
                if (this.provider instanceof anify_1.default)
                    return new anify_1.default().fetchEpisodeSources(episodeId, args[0], args[1]);
                return this.provider.fetchEpisodeSources(episodeId, ...args);
            }
            catch (err) {
                throw new Error(`Failed to fetch episode sources from ${this.provider.name}: ${err}`);
            }
        };
        /**
         *
         * @param episodeId Episode id
         */
        this.fetchEpisodeServers = async (episodeId) => {
            try {
                return this.provider.fetchEpisodeServers(episodeId);
            }
            catch (err) {
                throw new Error(`Failed to fetch episode servers from ${this.provider.name}: ${err}`);
            }
        };
        this.findAnime = async (title, season, startDate, malId, dub, anilistId, externalLinks) => {
            var _a, _b, _c;
            title.english = (_a = title.english) !== null && _a !== void 0 ? _a : title.romaji;
            title.romaji = (_b = title.romaji) !== null && _b !== void 0 ? _b : title.english;
            title.english = title.english.toLowerCase();
            title.romaji = title.romaji.toLowerCase();
            if (title.english === title.romaji) {
                return ((_c = (await this.findAnimeSlug(title.english, season, startDate, malId, dub, anilistId, externalLinks))) !== null && _c !== void 0 ? _c : []);
            }
            const romajiPossibleEpisodes = await this.findAnimeSlug(title.romaji, season, startDate, malId, dub, anilistId, externalLinks);
            if (romajiPossibleEpisodes) {
                return romajiPossibleEpisodes;
            }
            const englishPossibleEpisodes = await this.findAnimeSlug(title.english, season, startDate, malId, dub, anilistId, externalLinks);
            return englishPossibleEpisodes !== null && englishPossibleEpisodes !== void 0 ? englishPossibleEpisodes : [];
        };
        this.findAnimeSlug = async (title, season, startDate, malId, dub, anilistId, externalLinks) => {
            var _a, _b, _c;
            if (this.provider instanceof anify_1.default)
                return (await this.provider.fetchAnimeInfo(anilistId)).episodes;
            const slug = title.replace(/[^0-9a-zA-Z]+/g, ' ');
            let possibleAnime;
            if (malId && !(this.provider instanceof crunchyroll_1.default || this.provider instanceof bilibili_1.default)) {
                const malAsyncReq = await this.client.get(`${this.malSyncUrl}/mal/anime/${malId}`, {
                    validateStatus: () => true,
                });
                if (malAsyncReq.status === 200) {
                    const sitesT = malAsyncReq.data.Sites;
                    let sites = Object.values(sitesT).map((v, i) => {
                        const obj = [...Object.values(Object.values(sitesT)[i])];
                        const pages = obj.map((v) => ({
                            page: v.page,
                            url: v.url,
                            title: v.title,
                        }));
                        return pages;
                    });
                    sites = sites.flat();
                    sites.sort((a, b) => {
                        const targetTitle = malAsyncReq.data.title.toLowerCase();
                        const firstRating = utils_2.compareTwoStrings(targetTitle, a.title.toLowerCase());
                        const secondRating = utils_2.compareTwoStrings(targetTitle, b.title.toLowerCase());
                        // Sort in descending order
                        return secondRating - firstRating;
                    });
                    const possibleSource = sites.find(s => {
                        if (s.page.toLowerCase() === this.provider.name.toLowerCase())
                            if (this.provider instanceof gogoanime_1.default)
                                return dub ? s.title.toLowerCase().includes('dub') : !s.title.toLowerCase().includes('dub');
                            else
                                return true;
                        return false;
                    });
                    if (possibleSource) {
                        try {
                            possibleAnime = await this.provider.fetchAnimeInfo(possibleSource.url.split('/').pop());
                        }
                        catch (err) {
                            console.error(err);
                            possibleAnime = await this.findAnimeRaw(slug);
                        }
                    }
                    else
                        possibleAnime = await this.findAnimeRaw(slug);
                }
                else
                    possibleAnime = await this.findAnimeRaw(slug);
            }
            else
                possibleAnime = await this.findAnimeRaw(slug, externalLinks);
            if (!possibleAnime)
                return undefined;
            // To avoid a new request, lets match and see if the anime show found is in sub/dub
            const expectedType = dub ? models_1.SubOrSub.DUB : models_1.SubOrSub.SUB;
            // Have this as a fallback in the meantime for compatibility
            if (possibleAnime.subOrDub) {
                if (possibleAnime.subOrDub != models_1.SubOrSub.BOTH && possibleAnime.subOrDub != expectedType) {
                    return undefined;
                }
            }
            else if ((!possibleAnime.hasDub && dub) || (!possibleAnime.hasSub && !dub)) {
                return undefined;
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
                const nestedEpisodes = Object.keys(possibleAnime.episodes)
                    .filter((key) => key.toLowerCase().includes(dub ? 'dub' : 'sub'))
                    .sort((first, second) => {
                    var _a, _b, _c, _d;
                    return (((_b = (_a = possibleAnime.episodes[first]) === null || _a === void 0 ? void 0 : _a[0].season_number) !== null && _b !== void 0 ? _b : 0) -
                        ((_d = (_c = possibleAnime.episodes[second]) === null || _c === void 0 ? void 0 : _c[0].season_number) !== null && _d !== void 0 ? _d : 0));
                })
                    .map((key) => {
                    const audio = key
                        .replace(/[0-9]/g, '')
                        .replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
                    possibleAnime.episodes[key].forEach((element) => (element.type = audio));
                    return possibleAnime.episodes[key];
                });
                return nestedEpisodes.flat();
            }
            if (this.provider instanceof _9anime_1.default) {
                possibleAnime.episodes.forEach((_, index) => {
                    if (expectedType == models_1.SubOrSub.DUB) {
                        possibleAnime.episodes[index].id = possibleAnime.episodes[index].dubId;
                    }
                    if (possibleAnime.episodes[index].dubId) {
                        delete possibleAnime.episodes[index].dubId;
                    }
                });
                possibleAnime.episodes = possibleAnime.episodes.filter((el) => el.id != undefined);
            }
            const possibleProviderEpisodes = possibleAnime.episodes;
            if (typeof ((_a = possibleProviderEpisodes[0]) === null || _a === void 0 ? void 0 : _a.image) !== 'undefined' &&
                typeof ((_b = possibleProviderEpisodes[0]) === null || _b === void 0 ? void 0 : _b.title) !== 'undefined' &&
                typeof ((_c = possibleProviderEpisodes[0]) === null || _c === void 0 ? void 0 : _c.description) !== 'undefined')
                return possibleProviderEpisodes;
            const options = {
                headers: { 'Content-Type': 'application/json' },
                query: utils_1.kitsuSearchQuery(slug),
            };
            const newEpisodeList = await this.findKitsuAnime(possibleProviderEpisodes, options, season, startDate);
            return newEpisodeList;
        };
        this.findKitsuAnime = async (possibleProviderEpisodes, options, season, startDate) => {
            const kitsuEpisodes = await this.client.post(this.kitsuGraphqlUrl, options);
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
                                let thumbnailHash = undefined;
                                if ((_a = episode === null || episode === void 0 ? void 0 : episode.description) === null || _a === void 0 ? void 0 : _a.en)
                                    description = episode === null || episode === void 0 ? void 0 : episode.description.en.toString().replace(/"/g, '').replace('\\n', '\n');
                                if (episode === null || episode === void 0 ? void 0 : episode.thumbnail) {
                                    thumbnail = episode === null || episode === void 0 ? void 0 : episode.thumbnail.original.url.toString().replace(/"/g, '');
                                    thumbnailHash = utils_2.getHashFromImage(episode === null || episode === void 0 ? void 0 : episode.thumbnail.original.url.toString().replace(/"/g, ''));
                                }
                                if (episode) {
                                    if ((_b = episode.titles) === null || _b === void 0 ? void 0 : _b.canonical)
                                        name = episode.titles.canonical.toString().replace(/"/g, '');
                                    episodesList.set(i, {
                                        episodeNum: episode === null || episode === void 0 ? void 0 : episode.number.toString().replace(/"/g, ''),
                                        title: name,
                                        description,
                                        createdAt: episode === null || episode === void 0 ? void 0 : episode.createdAt,
                                        thumbnail,
                                    });
                                    continue;
                                }
                                episodesList.set(i, {
                                    episodeNum: undefined,
                                    title: undefined,
                                    description: undefined,
                                    createdAt: undefined,
                                    thumbnail,
                                    thumbnailHash,
                                });
                            }
                        }
                    });
                }
            }
            const newEpisodeList = [];
            if ((possibleProviderEpisodes === null || possibleProviderEpisodes === void 0 ? void 0 : possibleProviderEpisodes.length) !== 0) {
                possibleProviderEpisodes === null || possibleProviderEpisodes === void 0 ? void 0 : possibleProviderEpisodes.forEach((ep, i) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
                    const j = (i + 1).toString();
                    newEpisodeList.push({
                        id: ep.id,
                        title: (_c = (_a = ep.title) !== null && _a !== void 0 ? _a : (_b = episodesList.get(j)) === null || _b === void 0 ? void 0 : _b.title) !== null && _c !== void 0 ? _c : null,
                        image: (_f = (_d = ep.image) !== null && _d !== void 0 ? _d : (_e = episodesList.get(j)) === null || _e === void 0 ? void 0 : _e.thumbnail) !== null && _f !== void 0 ? _f : null,
                        imageHash: utils_2.getHashFromImage((_j = (_g = ep.image) !== null && _g !== void 0 ? _g : (_h = episodesList.get(j)) === null || _h === void 0 ? void 0 : _h.thumbnail) !== null && _j !== void 0 ? _j : null),
                        number: ep.number,
                        createdAt: (_m = (_k = ep.createdAt) !== null && _k !== void 0 ? _k : (_l = episodesList.get(j)) === null || _l === void 0 ? void 0 : _l.createdAt) !== null && _m !== void 0 ? _m : null,
                        description: (_q = (_o = ep.description) !== null && _o !== void 0 ? _o : (_p = episodesList.get(j)) === null || _p === void 0 ? void 0 : _p.description) !== null && _q !== void 0 ? _q : null,
                        url: (_r = ep.url) !== null && _r !== void 0 ? _r : null,
                    });
                });
            }
            return newEpisodeList;
        };
        /**
         * @param page page number to search for (optional)
         * @param perPage number of results per page (optional)
         */
        this.fetchTrendingAnime = async (page = 1, perPage = 10) => {
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: utils_1.anilistTrendingQuery(page, perPage),
            };
            try {
                const { data } = await this.client.post(this.anilistGraphqlUrl, options);
                const res = {
                    currentPage: data.data.Page.pageInfo.currentPage,
                    hasNextPage: data.data.Page.pageInfo.hasNextPage,
                    results: data.data.Page.media.map((item) => {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
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
                            imageHash: utils_2.getHashFromImage((_d = (_c = item.coverImage.extraLarge) !== null && _c !== void 0 ? _c : item.coverImage.large) !== null && _d !== void 0 ? _d : item.coverImage.medium),
                            trailer: {
                                id: (_e = item.trailer) === null || _e === void 0 ? void 0 : _e.id,
                                site: (_f = item.trailer) === null || _f === void 0 ? void 0 : _f.site,
                                thumbnail: (_g = item.trailer) === null || _g === void 0 ? void 0 : _g.thumbnail,
                                thumbnailHash: utils_2.getHashFromImage((_h = item.trailer) === null || _h === void 0 ? void 0 : _h.thumbnail),
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
                            cover: (_l = (_k = (_j = item.bannerImage) !== null && _j !== void 0 ? _j : item.coverImage.extraLarge) !== null && _k !== void 0 ? _k : item.coverImage.large) !== null && _l !== void 0 ? _l : item.coverImage.medium,
                            coverHash: utils_2.getHashFromImage((_p = (_o = (_m = item.bannerImage) !== null && _m !== void 0 ? _m : item.coverImage.extraLarge) !== null && _o !== void 0 ? _o : item.coverImage.large) !== null && _p !== void 0 ? _p : item.coverImage.medium),
                            rating: item.averageScore,
                            releaseDate: item.seasonYear,
                            color: (_q = item.coverImage) === null || _q === void 0 ? void 0 : _q.color,
                            genres: item.genres,
                            totalEpisodes: isNaN(item.episodes) ? 0 : (_t = (_r = item.episodes) !== null && _r !== void 0 ? _r : ((_s = item.nextAiringEpisode) === null || _s === void 0 ? void 0 : _s.episode) - 1) !== null && _t !== void 0 ? _t : 0,
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
        };
        /**
         *
         * @param page page number to search for (optional)
         * @param perPage number of results per page (optional)
         */
        this.fetchPopularAnime = async (page = 1, perPage = 10) => {
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: utils_1.anilistPopularQuery(page, perPage),
            };
            try {
                const { data } = await this.client.post(this.anilistGraphqlUrl, options);
                const res = {
                    currentPage: data.data.Page.pageInfo.currentPage,
                    hasNextPage: data.data.Page.pageInfo.hasNextPage,
                    results: data.data.Page.media.map((item) => {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
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
                            imageHash: utils_2.getHashFromImage((_d = (_c = item.coverImage.extraLarge) !== null && _c !== void 0 ? _c : item.coverImage.large) !== null && _d !== void 0 ? _d : item.coverImage.medium),
                            trailer: {
                                id: (_e = item.trailer) === null || _e === void 0 ? void 0 : _e.id,
                                site: (_f = item.trailer) === null || _f === void 0 ? void 0 : _f.site,
                                thumbnail: (_g = item.trailer) === null || _g === void 0 ? void 0 : _g.thumbnail,
                                thumbnailHash: utils_2.getHashFromImage((_h = item.trailer) === null || _h === void 0 ? void 0 : _h.thumbnail),
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
                            cover: (_l = (_k = (_j = item.bannerImage) !== null && _j !== void 0 ? _j : item.coverImage.extraLarge) !== null && _k !== void 0 ? _k : item.coverImage.large) !== null && _l !== void 0 ? _l : item.coverImage.medium,
                            coverHash: utils_2.getHashFromImage((_p = (_o = (_m = item.bannerImage) !== null && _m !== void 0 ? _m : item.coverImage.extraLarge) !== null && _o !== void 0 ? _o : item.coverImage.large) !== null && _p !== void 0 ? _p : item.coverImage.medium),
                            rating: item.averageScore,
                            releaseDate: item.seasonYear,
                            color: (_q = item.coverImage) === null || _q === void 0 ? void 0 : _q.color,
                            genres: item.genres,
                            totalEpisodes: isNaN(item.episodes) ? 0 : (_t = (_r = item.episodes) !== null && _r !== void 0 ? _r : ((_s = item.nextAiringEpisode) === null || _s === void 0 ? void 0 : _s.episode) - 1) !== null && _t !== void 0 ? _t : 0,
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
        };
        /**
         *
         * @param page page number (optional)
         * @param perPage number of results per page (optional)
         * @param weekStart Filter by the start of the week (optional) (default: todays date) (options: 2 = Monday, 3 = Tuesday, 4 = Wednesday, 5 = Thursday, 6 = Friday, 0 = Saturday, 1 = Sunday) you can use either the number or the string
         * @param weekEnd Filter by the end of the week (optional) similar to weekStart
         * @param notYetAired if true will return anime that have not yet aired (optional)
         * @returns the next airing episodes
         */
        this.fetchAiringSchedule = async (page = 1, perPage = 20, weekStart = (new Date().getDay() + 1) % 7, weekEnd = (new Date().getDay() + 7) % 7, notYetAired = false) => {
            let day1, day2 = undefined;
            if (typeof weekStart === 'string' && typeof weekEnd === 'string')
                [day1, day2] = utils_1.getDays(utils_1.capitalizeFirstLetter(weekStart.toLowerCase()), utils_1.capitalizeFirstLetter(weekEnd.toLowerCase()));
            else if (typeof weekStart === 'number' && typeof weekEnd === 'number')
                [day1, day2] = [weekStart, weekEnd];
            else
                throw new Error('Invalid weekStart or weekEnd');
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: utils_1.anilistAiringScheduleQuery(page, perPage, day1, day2, notYetAired),
            };
            try {
                const { data } = await this.client.post(this.anilistGraphqlUrl, options);
                const res = {
                    currentPage: data.data.Page.pageInfo.currentPage,
                    hasNextPage: data.data.Page.pageInfo.hasNextPage,
                    results: data.data.Page.airingSchedules.map((item) => {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
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
                            imageHash: utils_2.getHashFromImage((_d = (_c = item.media.coverImage.extraLarge) !== null && _c !== void 0 ? _c : item.media.coverImage.large) !== null && _d !== void 0 ? _d : item.media.coverImage.medium),
                            description: item.media.description,
                            cover: (_g = (_f = (_e = item.media.bannerImage) !== null && _e !== void 0 ? _e : item.media.coverImage.extraLarge) !== null && _f !== void 0 ? _f : item.media.coverImage.large) !== null && _g !== void 0 ? _g : item.media.coverImage.medium,
                            coverHash: utils_2.getHashFromImage((_k = (_j = (_h = item.media.bannerImage) !== null && _h !== void 0 ? _h : item.media.coverImage.extraLarge) !== null && _j !== void 0 ? _j : item.media.coverImage.large) !== null && _k !== void 0 ? _k : item.media.coverImage.medium),
                            genres: item.media.genres,
                            color: (_l = item.media.coverImage) === null || _l === void 0 ? void 0 : _l.color,
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
        };
        /**
         *
         * @param genres An array of genres to filter by (optional) genres: [`Action`, `Adventure`, `Cars`, `Comedy`, `Drama`, `Fantasy`, `Horror`, `Mahou Shoujo`, `Mecha`, `Music`, `Mystery`, `Psychological`, `Romance`, `Sci-Fi`, `Slice of Life`, `Sports`, `Supernatural`, `Thriller`]
         * @param page page number (optional)
         * @param perPage number of results per page (optional)
         */
        this.fetchAnimeGenres = async (genres, page = 1, perPage = 20) => {
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
                query: utils_1.anilistGenresQuery(genres, page, perPage),
            };
            try {
                const { data } = await this.client.post(this.anilistGraphqlUrl, options);
                const res = {
                    currentPage: data.data.Page.pageInfo.currentPage,
                    hasNextPage: data.data.Page.pageInfo.hasNextPage,
                    results: data.data.Page.media.map((item) => {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
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
                            imageHash: utils_2.getHashFromImage((_d = (_c = item.coverImage.extraLarge) !== null && _c !== void 0 ? _c : item.coverImage.large) !== null && _d !== void 0 ? _d : item.coverImage.medium),
                            trailer: {
                                id: (_e = item.trailer) === null || _e === void 0 ? void 0 : _e.id,
                                site: (_f = item.trailer) === null || _f === void 0 ? void 0 : _f.site,
                                thumbnail: (_g = item.trailer) === null || _g === void 0 ? void 0 : _g.thumbnail,
                                thumbnailHash: utils_2.getHashFromImage((_h = item.trailer) === null || _h === void 0 ? void 0 : _h.thumbnail),
                            },
                            description: item.description,
                            cover: (_l = (_k = (_j = item.bannerImage) !== null && _j !== void 0 ? _j : item.coverImage.extraLarge) !== null && _k !== void 0 ? _k : item.coverImage.large) !== null && _l !== void 0 ? _l : item.coverImage.medium,
                            coverHash: utils_2.getHashFromImage((_p = (_o = (_m = item.bannerImage) !== null && _m !== void 0 ? _m : item.coverImage.extraLarge) !== null && _o !== void 0 ? _o : item.coverImage.large) !== null && _p !== void 0 ? _p : item.coverImage.medium),
                            rating: item.averageScore,
                            releaseDate: item.seasonYear,
                            color: (_q = item.coverImage) === null || _q === void 0 ? void 0 : _q.color,
                            genres: item.genres,
                            totalEpisodes: isNaN(item.episodes) ? 0 : (_t = (_r = item.episodes) !== null && _r !== void 0 ? _r : ((_s = item.nextAiringEpisode) === null || _s === void 0 ? void 0 : _s.episode) - 1) !== null && _t !== void 0 ? _t : 0,
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
        };
        this.findAnimeRaw = async (slug, externalLinks) => {
            if (this.provider instanceof crunchyroll_1.default && externalLinks) {
                const link = externalLinks.find((link) => link.site.includes('Crunchyroll'));
                if (link) {
                    const { request } = await this.client.get(link.url, {
                        validateStatus: () => true,
                    });
                    if (request.res.responseUrl.includes('series') || request.res.responseUrl.includes('watch')) {
                        const mediaType = request.res.responseUrl.split('/')[3];
                        const id = request.res.responseUrl.split('/')[4];
                        return await this.provider.fetchAnimeInfo(id, mediaType);
                    }
                }
            }
            const findAnime = (await this.provider.search(slug));
            if (findAnime.results.length === 0)
                return undefined;
            // Sort the retrieved info for more accurate results.
            let topRating = 0;
            findAnime.results.sort((a, b) => {
                var _a, _b, _c, _d;
                const targetTitle = slug.toLowerCase();
                let firstTitle;
                let secondTitle;
                if (typeof a.title == 'string')
                    firstTitle = a.title;
                else
                    firstTitle = (_b = (_a = a.title.english) !== null && _a !== void 0 ? _a : a.title.romaji) !== null && _b !== void 0 ? _b : '';
                if (typeof b.title == 'string')
                    secondTitle = b.title;
                else
                    secondTitle = (_d = (_c = b.title.english) !== null && _c !== void 0 ? _c : b.title.romaji) !== null && _d !== void 0 ? _d : '';
                const firstRating = utils_2.compareTwoStrings(targetTitle, firstTitle.toLowerCase());
                const secondRating = utils_2.compareTwoStrings(targetTitle, secondTitle.toLowerCase());
                if (firstRating > topRating) {
                    topRating = firstRating;
                }
                if (secondRating > topRating) {
                    topRating = secondRating;
                }
                // Sort in descending order
                return secondRating - firstRating;
            });
            if (topRating >= 0.7) {
                if (this.provider instanceof crunchyroll_1.default) {
                    return await this.provider.fetchAnimeInfo(findAnime.results[0].id, findAnime.results[0].type);
                }
                else {
                    return await this.provider.fetchAnimeInfo(findAnime.results[0].id);
                }
            }
            return undefined;
        };
        /**
         * @returns a random anime
         */
        this.fetchRandomAnime = async () => {
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: utils_1.anilistSiteStatisticsQuery(),
            };
            try {
                // const {
                //   data: { data },
                // } = await this.client.post(this.anilistGraphqlUrl, options);
                // const selectedAnime = Math.floor(
                //   Math.random() * data.SiteStatistics.anime.nodes[data.SiteStatistics.anime.nodes.length - 1].count
                // );
                // const { results } = await this.advancedSearch(undefined, 'ANIME', Math.ceil(selectedAnime / 50), 50);
                const { data: data } = await this.client.get('https://raw.githubusercontent.com/5H4D0WILA/IDFetch/main/ids.txt');
                const ids = data === null || data === void 0 ? void 0 : data.trim().split('\n');
                const selectedAnime = Math.floor(Math.random() * ids.length);
                return await this.fetchAnimeInfo(ids[selectedAnime]);
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * @param provider The provider to get the episode Ids from (optional) default: `gogoanime` (options: `gogoanime`, `zoro`)
         * @param page page number (optional)
         * @param perPage number of results per page (optional)
         */
        this.fetchRecentEpisodes = async (provider = 'gogoanime', page = 1, perPage = 25) => {
            try {
                const { data } = await this.client.get(`${this.anifyUrl}/recent?page=${page}&perPage=${perPage}&type=anime`);
                const results = data === null || data === void 0 ? void 0 : data.map((item) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                    return {
                        id: item.id.toString(),
                        malId: (_a = item.mappings.find((item) => item.providerType === 'META' && item.providerId === 'mal')) === null || _a === void 0 ? void 0 : _a.id,
                        title: {
                            romaji: (_b = item.title) === null || _b === void 0 ? void 0 : _b.romaji,
                            english: (_c = item.title) === null || _c === void 0 ? void 0 : _c.english,
                            native: (_d = item.title) === null || _d === void 0 ? void 0 : _d.native,
                            // userPreferred: (_f = item.title) === null || _f === void 0 ? void 0 : _f.userPreferred,
                        },
                        image: (_e = item.coverImage) !== null && _e !== void 0 ? _e : item.bannerImage,
                        imageHash: utils_2.getHashFromImage((_f = item.coverImage) !== null && _f !== void 0 ? _f : item.bannerImage),
                        rating: item.averageScore,
                        color: (_g = item.anime) === null || _g === void 0 ? void 0 : _g.color,
                        episodeId: `${provider === 'gogoanime'
                            ? (_j = (_h = item.episodes.data
                                .find((source) => source.providerId.toLowerCase() === 'gogoanime')) === null || _h === void 0 ? void 0 : _h.episodes.pop()) === null || _j === void 0 ? void 0 : _j.id
                            : (_l = (_k = item.episodes.data
                                .find((source) => source.providerId.toLowerCase() === 'zoro')) === null || _k === void 0 ? void 0 : _k.episodes.pop()) === null || _l === void 0 ? void 0 : _l.id}`,
                        episodeTitle: (_m = item.episodes.latest.latestTitle) !== null && _m !== void 0 ? _m : `Episode ${item.currentEpisode}`,
                        episodeNumber: item.currentEpisode,
                        genres: item.genre,
                        type: item.format,
                    };
                });
                // results = results.filter((item) => item.episodeNumber !== 0 &&
                //     item.episodeId.replace('-enime', '').length > 0 &&
                //     item.episodeId.replace('-enime', '') !== 'undefined');
                return {
                    currentPage: page,
                    // hasNextPage: meta.lastPage !== page,
                    // totalPages: meta.lastPage,
                    totalResults: results === null || results === void 0 ? void 0 : results.length,
                    results: results,
                };
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchDefaultEpisodeList = async (Media, dub, id) => {
            var _a, _b;
            let episodes = [];
            episodes = await this.findAnime({ english: (_a = Media.title) === null || _a === void 0 ? void 0 : _a.english, romaji: (_b = Media.title) === null || _b === void 0 ? void 0 : _b.romaji }, Media.season, Media.startDate.year, Media.idMal, dub, id, Media.externalLinks);
            return episodes;
        };
        /**
         * @param id anilist id
         * @param dub language of the dubbed version (optional) currently only works for gogoanime
         * @param fetchFiller to get filler boolean on the episode object (optional) set to `true` to get filler boolean on the episode object.
         * @returns episode list **(without anime info)**
         */
        this.fetchEpisodesListById = async (id, dub = false, fetchFiller = false) => {
            var _a, _b;
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: `query($id: Int = ${id}){ Media(id: $id){ idMal externalLinks { site url } title { romaji english } status season episodes startDate { year month day } endDate { year month day }  coverImage {extraLarge large medium} } }`,
            };
            const { data: { data: { Media }, }, } = await this.client.post(this.anilistGraphqlUrl, options);
            let possibleAnimeEpisodes = [];
            let fillerEpisodes = [];
            if ((this.provider instanceof zoro_1.default || this.provider instanceof gogoanime_1.default) &&
                !dub &&
                (Media.status === 'RELEASING' ||
                    utils_1.range({ from: 2000, to: new Date().getFullYear() + 1 }).includes(parseInt((_a = Media.startDate) === null || _a === void 0 ? void 0 : _a.year)))) {
                try {
                    possibleAnimeEpisodes = (_b = (await new anify_1.default().fetchAnimeInfoByAnilistId(id, this.provider.name.toLowerCase())).episodes) === null || _b === void 0 ? void 0 : _b.map((item) => ({
                        id: item.slug,
                        title: item.title,
                        description: item.description,
                        number: item.number,
                        image: item.image,
                        imageHash: utils_2.getHashFromImage(item.image),
                    }));
                    if (!possibleAnimeEpisodes.length) {
                        possibleAnimeEpisodes = await this.fetchDefaultEpisodeList(Media, dub, id);
                        possibleAnimeEpisodes = possibleAnimeEpisodes === null || possibleAnimeEpisodes === void 0 ? void 0 : possibleAnimeEpisodes.map((episode) => {
                            var _a, _b, _c, _d;
                            if (!episode.image) {
                                episode.image =
                                    (_b = (_a = Media.coverImage.extraLarge) !== null && _a !== void 0 ? _a : Media.coverImage.large) !== null && _b !== void 0 ? _b : Media.coverImage.medium;
                                episode.imageHash = utils_2.getHashFromImage((_d = (_c = Media.coverImage.extraLarge) !== null && _c !== void 0 ? _c : Media.coverImage.large) !== null && _d !== void 0 ? _d : Media.coverImage.medium);
                            }
                            return episode;
                        });
                    }
                }
                catch (err) {
                    possibleAnimeEpisodes = await this.fetchDefaultEpisodeList(Media, dub, id);
                    possibleAnimeEpisodes = possibleAnimeEpisodes === null || possibleAnimeEpisodes === void 0 ? void 0 : possibleAnimeEpisodes.map((episode) => {
                        var _a, _b, _c, _d;
                        if (!episode.image) {
                            episode.image = (_b = (_a = Media.coverImage.extraLarge) !== null && _a !== void 0 ? _a : Media.coverImage.large) !== null && _b !== void 0 ? _b : Media.coverImage.medium;
                            episode.imageHash = utils_2.getHashFromImage((_d = (_c = Media.coverImage.extraLarge) !== null && _c !== void 0 ? _c : Media.coverImage.large) !== null && _d !== void 0 ? _d : Media.coverImage.medium);
                        }
                        return episode;
                    });
                    return possibleAnimeEpisodes;
                }
            }
            else
                possibleAnimeEpisodes = await this.fetchDefaultEpisodeList(Media, dub, id);
            if (fetchFiller) {
                const { data: fillerData } = await this.client.get(`https://raw.githubusercontent.com/saikou-app/mal-id-filler-list/main/fillers/${Media.idMal}.json`, {
                    validateStatus: () => true,
                });
                if (!fillerData.toString().startsWith('404')) {
                    fillerEpisodes = [];
                    fillerEpisodes === null || fillerEpisodes === void 0 ? void 0 : fillerEpisodes.push(...fillerData.episodes);
                }
            }
            possibleAnimeEpisodes = possibleAnimeEpisodes === null || possibleAnimeEpisodes === void 0 ? void 0 : possibleAnimeEpisodes.map((episode) => {
                var _a, _b, _c, _d;
                if (!episode.image) {
                    episode.image = (_b = (_a = Media.coverImage.extraLarge) !== null && _a !== void 0 ? _a : Media.coverImage.large) !== null && _b !== void 0 ? _b : Media.coverImage.medium;
                    episode.imageHash = utils_2.getHashFromImage((_d = (_c = Media.coverImage.extraLarge) !== null && _c !== void 0 ? _c : Media.coverImage.large) !== null && _d !== void 0 ? _d : Media.coverImage.medium);
                }
                if (fetchFiller && (fillerEpisodes === null || fillerEpisodes === void 0 ? void 0 : fillerEpisodes.length) > 0 && (fillerEpisodes === null || fillerEpisodes === void 0 ? void 0 : fillerEpisodes.length) >= Media.episodes) {
                    if (fillerEpisodes[episode.number - 1])
                        episode.isFiller = new Boolean(fillerEpisodes[episode.number - 1]['filler-bool']).valueOf();
                }
                return episode;
            });
            return possibleAnimeEpisodes;
        };
        /**
         * @param id anilist id
         * @returns anilist data for the anime **(without episodes)** (use `fetchEpisodesListById` to get the episodes) (use `fetchAnimeInfo` to get both)
         */
        this.fetchAnilistInfoById = async (id) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4;
            const animeInfo = {
                id: id,
                title: '',
            };
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: utils_1.anilistMediaDetailQuery(id),
            };
            try {
                const { data } = await this.client.post(this.anilistGraphqlUrl, options).catch(() => {
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
                        thumbnailHash: utils_2.getHashFromImage((_e = data.data.Media.trailer) === null || _e === void 0 ? void 0 : _e.thumbnail),
                    };
                }
                animeInfo.synonyms = data.data.Media.synonyms;
                animeInfo.isLicensed = data.data.Media.isLicensed;
                animeInfo.isAdult = data.data.Media.isAdult;
                animeInfo.countryOfOrigin = data.data.Media.countryOfOrigin;
                animeInfo.image =
                    (_g = (_f = data.data.Media.coverImage.extraLarge) !== null && _f !== void 0 ? _f : data.data.Media.coverImage.large) !== null && _g !== void 0 ? _g : data.data.Media.coverImage.medium;
                animeInfo.imageHash = utils_2.getHashFromImage((_j = (_h = data.data.Media.coverImage.extraLarge) !== null && _h !== void 0 ? _h : data.data.Media.coverImage.large) !== null && _j !== void 0 ? _j : data.data.Media.coverImage.medium);
                animeInfo.cover = (_k = data.data.Media.bannerImage) !== null && _k !== void 0 ? _k : animeInfo.image;
                animeInfo.coverHash = utils_2.getHashFromImage((_l = data.data.Media.bannerImage) !== null && _l !== void 0 ? _l : animeInfo.image);
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
                if ((_m = data.data.Media.nextAiringEpisode) === null || _m === void 0 ? void 0 : _m.airingAt)
                    animeInfo.nextAiringEpisode = {
                        airingTime: (_o = data.data.Media.nextAiringEpisode) === null || _o === void 0 ? void 0 : _o.airingAt,
                        timeUntilAiring: (_p = data.data.Media.nextAiringEpisode) === null || _p === void 0 ? void 0 : _p.timeUntilAiring,
                        episode: (_q = data.data.Media.nextAiringEpisode) === null || _q === void 0 ? void 0 : _q.episode,
                    };
                animeInfo.totalEpisodes = (_s = (_r = data.data.Media) === null || _r === void 0 ? void 0 : _r.episodes) !== null && _s !== void 0 ? _s : ((_t = data.data.Media.nextAiringEpisode) === null || _t === void 0 ? void 0 : _t.episode) - 1;
                animeInfo.currentEpisode = ((_v = (_u = data.data.Media) === null || _u === void 0 ? void 0 : _u.nextAiringEpisode) === null || _v === void 0 ? void 0 : _v.episode)
                    ? ((_w = data.data.Media.nextAiringEpisode) === null || _w === void 0 ? void 0 : _w.episode) - 1
                    : ((_x = data.data.Media) === null || _x === void 0 ? void 0 : _x.episodes) || undefined;
                animeInfo.rating = data.data.Media.averageScore;
                animeInfo.duration = data.data.Media.duration;
                animeInfo.genres = data.data.Media.genres;
                animeInfo.studios = data.data.Media.studios.edges.map((item) => item.node.name);
                animeInfo.season = data.data.Media.season;
                animeInfo.popularity = data.data.Media.popularity;
                animeInfo.type = data.data.Media.format;
                animeInfo.startDate = {
                    year: (_y = data.data.Media.startDate) === null || _y === void 0 ? void 0 : _y.year,
                    month: (_z = data.data.Media.startDate) === null || _z === void 0 ? void 0 : _z.month,
                    day: (_0 = data.data.Media.startDate) === null || _0 === void 0 ? void 0 : _0.day,
                };
                animeInfo.endDate = {
                    year: (_1 = data.data.Media.endDate) === null || _1 === void 0 ? void 0 : _1.year,
                    month: (_2 = data.data.Media.endDate) === null || _2 === void 0 ? void 0 : _2.month,
                    day: (_3 = data.data.Media.endDate) === null || _3 === void 0 ? void 0 : _3.day,
                };
                animeInfo.recommendations = data.data.Media.recommendations.edges.map((item) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
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
                        imageHash: utils_2.getHashFromImage((_d = (_c = item.node.mediaRecommendation.coverImage.extraLarge) !== null && _c !== void 0 ? _c : item.node.mediaRecommendation.coverImage.large) !== null && _d !== void 0 ? _d : item.node.mediaRecommendation.coverImage.medium),
                        cover: (_g = (_f = (_e = item.node.mediaRecommendation.bannerImage) !== null && _e !== void 0 ? _e : item.node.mediaRecommendation.coverImage.extraLarge) !== null && _f !== void 0 ? _f : item.node.mediaRecommendation.coverImage.large) !== null && _g !== void 0 ? _g : item.node.mediaRecommendation.coverImage.medium,
                        coverHash: (_k = (_j = (_h = item.node.mediaRecommendation.bannerImage) !== null && _h !== void 0 ? _h : item.node.mediaRecommendation.coverImage.extraLarge) !== null && _j !== void 0 ? _j : item.node.mediaRecommendation.coverImage.large) !== null && _k !== void 0 ? _k : item.node.mediaRecommendation.coverImage.medium,
                        rating: item.node.mediaRecommendation.meanScore,
                        type: item.node.mediaRecommendation.format,
                    });
                });
                animeInfo.characters = data.data.Media.characters.edges.map((item) => {
                    var _a, _b;
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
                        image: (_a = item.node.image.large) !== null && _a !== void 0 ? _a : item.node.image.medium,
                        imageHash: utils_2.getHashFromImage((_b = item.node.image.large) !== null && _b !== void 0 ? _b : item.node.image.medium),
                        voiceActors: item.voiceActors.map((voiceActor) => {
                            var _a, _b;
                            return ({
                                id: voiceActor.id,
                                language: voiceActor.languageV2,
                                name: {
                                    first: voiceActor.name.first,
                                    last: voiceActor.name.last,
                                    full: voiceActor.name.full,
                                    native: voiceActor.name.native,
                                    userPreferred: voiceActor.name.userPreferred,
                                },
                                image: (_a = voiceActor.image.large) !== null && _a !== void 0 ? _a : voiceActor.image.medium,
                                imageHash: utils_2.getHashFromImage((_b = voiceActor.image.large) !== null && _b !== void 0 ? _b : voiceActor.image.medium),
                            });
                        }),
                    });
                });
                animeInfo.color = (_4 = data.data.Media.coverImage) === null || _4 === void 0 ? void 0 : _4.color;
                animeInfo.relations = data.data.Media.relations.edges.map((item) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
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
                        image: (_b = (_a = item.node.coverImage.extraLarge) !== null && _a !== void 0 ? _a : item.node.coverImage.large) !== null && _b !== void 0 ? _b : item.node.coverImage.medium,
                        imageHash: utils_2.getHashFromImage((_d = (_c = item.node.coverImage.extraLarge) !== null && _c !== void 0 ? _c : item.node.coverImage.large) !== null && _d !== void 0 ? _d : item.node.coverImage.medium),
                        cover: (_g = (_f = (_e = item.node.bannerImage) !== null && _e !== void 0 ? _e : item.node.coverImage.extraLarge) !== null && _f !== void 0 ? _f : item.node.coverImage.large) !== null && _g !== void 0 ? _g : item.node.coverImage.medium,
                        coverHash: utils_2.getHashFromImage((_k = (_j = (_h = item.node.bannerImage) !== null && _h !== void 0 ? _h : item.node.coverImage.extraLarge) !== null && _j !== void 0 ? _j : item.node.coverImage.large) !== null && _k !== void 0 ? _k : item.node.coverImage.medium),
                        rating: item.node.meanScore,
                        type: item.node.format,
                    });
                });
                return animeInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * TODO: finish this (got lazy)
         * @param id staff id from anilist
         *
         */
        this.fetchStaffById = async (id) => {
            throw new Error('Not implemented yet');
        };
        /**
         *
         * @param id character id from anilist
         */
        this.fetchCharacterInfoById = async (id) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11;
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: utils_1.anilistCharacterQuery(),
                variables: {
                    id: id,
                },
            };
            try {
                const { data: { data: { Character }, }, } = await this.client.post(this.anilistGraphqlUrl, options);
                const height = (_a = Character.description.match(/__Height:__(.*)/)) === null || _a === void 0 ? void 0 : _a[1].trim();
                const weight = (_b = Character.description.match(/__Weight:__(.*)/)) === null || _b === void 0 ? void 0 : _b[1].trim();
                const hairColor = (_c = Character.description.match(/__Hair Color:__(.*)/)) === null || _c === void 0 ? void 0 : _c[1].trim();
                const eyeColor = (_d = Character.description.match(/__Eye Color:__(.*)/)) === null || _d === void 0 ? void 0 : _d[1].trim();
                const relatives = (_e = Character.description
                    .match(/__Relatives:__(.*)/)) === null || _e === void 0 ? void 0 : _e[1].trim().split(/(, \[)/g).filter((g) => !g.includes(', [')).map((r) => {
                    var _a, _b, _c;
                    return ({
                        id: (_a = r.match(/\/(\d+)/)) === null || _a === void 0 ? void 0 : _a[1],
                        name: (_b = r.match(/([^)]+)\]/)) === null || _b === void 0 ? void 0 : _b[1].replace(/\[/g, ''),
                        relationship: (_c = r.match(/\(([^)]+)\).*?(\(([^)]+)\))/)) === null || _c === void 0 ? void 0 : _c[3],
                    });
                });
                const race = (_f = Character.description
                    .match(/__Race:__(.*)/)) === null || _f === void 0 ? void 0 : _f[1].split(', ').map((r) => r.trim());
                const rank = (_g = Character.description.match(/__Rank:__(.*)/)) === null || _g === void 0 ? void 0 : _g[1];
                const occupation = (_h = Character.description.match(/__Occupation:__(.*)/)) === null || _h === void 0 ? void 0 : _h[1];
                const previousPosition = (_k = (_j = Character.description.match(/__Previous Position:__(.*)/)) === null || _j === void 0 ? void 0 : _j[1]) === null || _k === void 0 ? void 0 : _k.trim();
                const partner = (_l = Character.description
                    .match(/__Partner:__(.*)/)) === null || _l === void 0 ? void 0 : _l[1].split(/(, \[)/g).filter((g) => !g.includes(', [')).map((r) => {
                    var _a, _b;
                    return ({
                        id: (_a = r.match(/\/(\d+)/)) === null || _a === void 0 ? void 0 : _a[1],
                        name: (_b = r.match(/([^)]+)\]/)) === null || _b === void 0 ? void 0 : _b[1].replace(/\[/g, ''),
                    });
                });
                const dislikes = (_m = Character.description.match(/__Dislikes:__(.*)/)) === null || _m === void 0 ? void 0 : _m[1];
                const sign = (_o = Character.description.match(/__Sign:__(.*)/)) === null || _o === void 0 ? void 0 : _o[1];
                const zodicSign = (_q = (_p = Character.description.match(/__Zodiac sign:__(.*)/)) === null || _p === void 0 ? void 0 : _p[1]) === null || _q === void 0 ? void 0 : _q.trim();
                const zodicAnimal = (_s = (_r = Character.description.match(/__Zodiac Animal:__(.*)/)) === null || _r === void 0 ? void 0 : _r[1]) === null || _s === void 0 ? void 0 : _s.trim();
                const themeSong = (_u = (_t = Character.description.match(/__Theme Song:__(.*)/)) === null || _t === void 0 ? void 0 : _t[1]) === null || _u === void 0 ? void 0 : _u.trim();
                Character.description = Character.description.replace(/__Theme Song:__(.*)\n|__Race:__(.*)\n|__Height:__(.*)\n|__Relatives:__(.*)\n|__Rank:__(.*)\n|__Zodiac sign:__(.*)\n|__Zodiac Animal:__(.*)\n|__Weight:__(.*)\n|__Eye Color:__(.*)\n|__Hair Color:__(.*)\n|__Dislikes:__(.*)\n|__Sign:__(.*)\n|__Partner:__(.*)\n|__Previous Position:__(.*)\n|__Occupation:__(.*)\n/gm, '');
                const characterInfo = {
                    id: Character.id,
                    name: {
                        first: (_v = Character.name) === null || _v === void 0 ? void 0 : _v.first,
                        last: (_w = Character.name) === null || _w === void 0 ? void 0 : _w.last,
                        full: (_x = Character.name) === null || _x === void 0 ? void 0 : _x.full,
                        native: (_y = Character.name) === null || _y === void 0 ? void 0 : _y.native,
                        userPreferred: (_z = Character.name) === null || _z === void 0 ? void 0 : _z.userPreferred,
                        alternative: (_0 = Character.name) === null || _0 === void 0 ? void 0 : _0.alternative,
                        alternativeSpoiler: (_1 = Character.name) === null || _1 === void 0 ? void 0 : _1.alternativeSpoiler,
                    },
                    image: (_3 = (_2 = Character.image) === null || _2 === void 0 ? void 0 : _2.large) !== null && _3 !== void 0 ? _3 : (_4 = Character.image) === null || _4 === void 0 ? void 0 : _4.medium,
                    imageHash: utils_2.getHashFromImage((_6 = (_5 = Character.image) === null || _5 === void 0 ? void 0 : _5.large) !== null && _6 !== void 0 ? _6 : (_7 = Character.image) === null || _7 === void 0 ? void 0 : _7.medium),
                    description: Character.description,
                    gender: Character.gender,
                    dateOfBirth: {
                        year: (_8 = Character.dateOfBirth) === null || _8 === void 0 ? void 0 : _8.year,
                        month: (_9 = Character.dateOfBirth) === null || _9 === void 0 ? void 0 : _9.month,
                        day: (_10 = Character.dateOfBirth) === null || _10 === void 0 ? void 0 : _10.day,
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
                    relations: (_11 = Character.media.edges) === null || _11 === void 0 ? void 0 : _11.map((v) => {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
                        return ({
                            id: v.node.id,
                            malId: v.node.idMal,
                            role: v.characterRole,
                            title: {
                                romaji: (_a = v.node.title) === null || _a === void 0 ? void 0 : _a.romaji,
                                english: (_b = v.node.title) === null || _b === void 0 ? void 0 : _b.english,
                                native: (_c = v.node.title) === null || _c === void 0 ? void 0 : _c.native,
                                userPreferred: (_d = v.node.title) === null || _d === void 0 ? void 0 : _d.userPreferred,
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
                            image: (_h = (_f = (_e = v.node.coverImage) === null || _e === void 0 ? void 0 : _e.extraLarge) !== null && _f !== void 0 ? _f : (_g = v.node.coverImage) === null || _g === void 0 ? void 0 : _g.large) !== null && _h !== void 0 ? _h : (_j = v.node.coverImage) === null || _j === void 0 ? void 0 : _j.medium,
                            imageHash: utils_2.getHashFromImage((_o = (_l = (_k = v.node.coverImage) === null || _k === void 0 ? void 0 : _k.extraLarge) !== null && _l !== void 0 ? _l : (_m = v.node.coverImage) === null || _m === void 0 ? void 0 : _m.large) !== null && _o !== void 0 ? _o : (_p = v.node.coverImage) === null || _p === void 0 ? void 0 : _p.medium),
                            rating: v.node.averageScore,
                            releaseDate: (_q = v.node.startDate) === null || _q === void 0 ? void 0 : _q.year,
                            type: v.node.format,
                            color: (_r = v.node.coverImage) === null || _r === void 0 ? void 0 : _r.color,
                        });
                    }),
                };
                return characterInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.findMangaSlug = async (provider, title, malId) => {
            const slug = title.replace(/[^0-9a-zA-Z]+/g, ' ');
            let possibleManga;
            if (malId) {
                const malAsyncReq = await this.client.get(`${this.malSyncUrl}/mal/manga/${malId}`, {
                    validateStatus: () => true,
                });
                if (malAsyncReq.status === 200) {
                    const sitesT = malAsyncReq.data.Sites;
                    let sites = Object.values(sitesT).map((v, i) => {
                        const obj = [...Object.values(Object.values(sitesT)[i])];
                        const pages = obj.map((v) => ({
                            page: v.page,
                            url: v.url,
                            title: v.title,
                        }));
                        return pages;
                    });
                    sites = sites.flat();
                    const possibleSource = sites.find(s => s.page.toLowerCase() === provider.name.toLowerCase());
                    if (possibleSource)
                        possibleManga = await provider.fetchMangaInfo(possibleSource.url.split('/').pop());
                    else
                        possibleManga = await this.findMangaRaw(provider, slug, title);
                }
                else
                    possibleManga = await this.findMangaRaw(provider, slug, title);
            }
            else
                possibleManga = await this.findMangaRaw(provider, slug, title);
            const possibleProviderChapters = possibleManga.chapters;
            return possibleProviderChapters;
        };
        this.findMangaRaw = async (provider, slug, title) => {
            const findAnime = (await provider.search(slug));
            if (findAnime.results.length === 0)
                return [];
            // TODO: use much better way than this
            const possibleManga = findAnime.results.find((manga) => title.toLowerCase() == (typeof manga.title === 'string' ? manga.title.toLowerCase() : ''));
            if (!possibleManga)
                return (await provider.fetchMangaInfo(findAnime.results[0].id));
            return (await provider.fetchMangaInfo(possibleManga.id));
        };
        this.findManga = async (provider, title, malId) => {
            var _a, _b;
            title.english = (_a = title.english) !== null && _a !== void 0 ? _a : title.romaji;
            title.romaji = (_b = title.romaji) !== null && _b !== void 0 ? _b : title.english;
            title.english = title.english.toLowerCase();
            title.romaji = title.romaji.toLowerCase();
            if (title.english === title.romaji)
                return await this.findMangaSlug(provider, title.english, malId);
            const romajiPossibleEpisodes = this.findMangaSlug(provider, title.romaji, malId);
            if (romajiPossibleEpisodes) {
                return romajiPossibleEpisodes;
            }
            const englishPossibleEpisodes = this.findMangaSlug(provider, title.english, malId);
            return englishPossibleEpisodes;
        };
        this.provider = provider || new gogoanime_1.default(proxyConfig);
    }
}
/**
 * Anilist Anime class
 */
Anilist.Anime = this;
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
        this.search = async (query, page = 1, perPage = 20) => {
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: utils_1.anilistSearchQuery(query, page, perPage, 'MANGA'),
            };
            try {
                const { data } = await axios_1.default.post(new Anilist().anilistGraphqlUrl, options);
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
                            image: (_d = (_b = (_a = item.coverImage) === null || _a === void 0 ? void 0 : _a.extraLarge) !== null && _b !== void 0 ? _b : (_c = item.coverImage) === null || _c === void 0 ? void 0 : _c.large) !== null && _d !== void 0 ? _d : (_e = item.coverImage) === null || _e === void 0 ? void 0 : _e.medium,
                            imageHash: utils_2.getHashFromImage((_j = (_g = (_f = item.coverImage) === null || _f === void 0 ? void 0 : _f.extraLarge) !== null && _g !== void 0 ? _g : (_h = item.coverImage) === null || _h === void 0 ? void 0 : _h.large) !== null && _j !== void 0 ? _j : (_k = item.coverImage) === null || _k === void 0 ? void 0 : _k.medium),
                            cover: item.bannerImage,
                            coverHash: utils_2.getHashFromImage(item.bannerImage),
                            popularity: item.popularity,
                            description: item.description,
                            rating: item.averageScore,
                            genres: item.genres,
                            color: (_l = item.coverImage) === null || _l === void 0 ? void 0 : _l.color,
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
        };
        /**
         *
         * @param chapterId chapter id
         * @param args args to pass to the provider (if any)
         * @returns
         */
        this.fetchChapterPages = (chapterId, ...args) => {
            return this.provider.fetchChapterPages(chapterId, ...args);
        };
        this.fetchMangaInfo = async (id, ...args) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            const mangaInfo = {
                id: id,
                title: '',
            };
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: utils_1.anilistMediaDetailQuery(id),
            };
            try {
                const { data } = await axios_1.default.post(new Anilist().anilistGraphqlUrl, options).catch(err => {
                    throw new Error('Media not found');
                });
                mangaInfo.malId = data.data.Media.idMal;
                mangaInfo.title = {
                    romaji: data.data.Media.title.romaji,
                    english: data.data.Media.title.english,
                    native: data.data.Media.title.native,
                    userPreferred: data.data.Media.title.userPreferred,
                };
                if ((_a = data.data.Media.trailer) === null || _a === void 0 ? void 0 : _a.id) {
                    mangaInfo.trailer = {
                        id: data.data.Media.trailer.id,
                        site: (_b = data.data.Media.trailer) === null || _b === void 0 ? void 0 : _b.site,
                        thumbnail: (_c = data.data.Media.trailer) === null || _c === void 0 ? void 0 : _c.thumbnail,
                        thumbnailHash: utils_2.getHashFromImage((_d = data.data.Media.trailer) === null || _d === void 0 ? void 0 : _d.thumbnail),
                    };
                }
                mangaInfo.image =
                    (_f = (_e = data.data.Media.coverImage.extraLarge) !== null && _e !== void 0 ? _e : data.data.Media.coverImage.large) !== null && _f !== void 0 ? _f : data.data.Media.coverImage.medium;
                mangaInfo.imageHash = utils_2.getHashFromImage((_h = (_g = data.data.Media.coverImage.extraLarge) !== null && _g !== void 0 ? _g : data.data.Media.coverImage.large) !== null && _h !== void 0 ? _h : data.data.Media.coverImage.medium);
                mangaInfo.popularity = data.data.Media.popularity;
                mangaInfo.color = (_j = data.data.Media.coverImage) === null || _j === void 0 ? void 0 : _j.color;
                mangaInfo.cover = (_k = data.data.Media.bannerImage) !== null && _k !== void 0 ? _k : mangaInfo.image;
                mangaInfo.coverHash = utils_2.getHashFromImage((_l = data.data.Media.bannerImage) !== null && _l !== void 0 ? _l : mangaInfo.image);
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
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29;
                    return ({
                        id: (_a = item.node.mediaRecommendation) === null || _a === void 0 ? void 0 : _a.id,
                        malId: (_b = item.node.mediaRecommendation) === null || _b === void 0 ? void 0 : _b.idMal,
                        title: {
                            romaji: (_d = (_c = item.node.mediaRecommendation) === null || _c === void 0 ? void 0 : _c.title) === null || _d === void 0 ? void 0 : _d.romaji,
                            english: (_f = (_e = item.node.mediaRecommendation) === null || _e === void 0 ? void 0 : _e.title) === null || _f === void 0 ? void 0 : _f.english,
                            native: (_h = (_g = item.node.mediaRecommendation) === null || _g === void 0 ? void 0 : _g.title) === null || _h === void 0 ? void 0 : _h.native,
                            userPreferred: (_k = (_j = item.node.mediaRecommendation) === null || _j === void 0 ? void 0 : _j.title) === null || _k === void 0 ? void 0 : _k.userPreferred,
                        },
                        status: ((_l = item.node.mediaRecommendation) === null || _l === void 0 ? void 0 : _l.status) == 'RELEASING'
                            ? models_1.MediaStatus.ONGOING
                            : ((_m = item.node.mediaRecommendation) === null || _m === void 0 ? void 0 : _m.status) == 'FINISHED'
                                ? models_1.MediaStatus.COMPLETED
                                : ((_o = item.node.mediaRecommendation) === null || _o === void 0 ? void 0 : _o.status) == 'NOT_YET_RELEASED'
                                    ? models_1.MediaStatus.NOT_YET_AIRED
                                    : ((_p = item.node.mediaRecommendation) === null || _p === void 0 ? void 0 : _p.status) == 'CANCELLED'
                                        ? models_1.MediaStatus.CANCELLED
                                        : ((_q = item.node.mediaRecommendation) === null || _q === void 0 ? void 0 : _q.status) == 'HIATUS'
                                            ? models_1.MediaStatus.HIATUS
                                            : models_1.MediaStatus.UNKNOWN,
                        chapters: (_r = item.node.mediaRecommendation) === null || _r === void 0 ? void 0 : _r.chapters,
                        image: (_x = (_u = (_t = (_s = item.node.mediaRecommendation) === null || _s === void 0 ? void 0 : _s.coverImage) === null || _t === void 0 ? void 0 : _t.extraLarge) !== null && _u !== void 0 ? _u : (_w = (_v = item.node.mediaRecommendation) === null || _v === void 0 ? void 0 : _v.coverImage) === null || _w === void 0 ? void 0 : _w.large) !== null && _x !== void 0 ? _x : (_z = (_y = item.node.mediaRecommendation) === null || _y === void 0 ? void 0 : _y.coverImage) === null || _z === void 0 ? void 0 : _z.medium,
                        imageHash: utils_2.getHashFromImage((_5 = (_2 = (_1 = (_0 = item.node.mediaRecommendation) === null || _0 === void 0 ? void 0 : _0.coverImage) === null || _1 === void 0 ? void 0 : _1.extraLarge) !== null && _2 !== void 0 ? _2 : (_4 = (_3 = item.node.mediaRecommendation) === null || _3 === void 0 ? void 0 : _3.coverImage) === null || _4 === void 0 ? void 0 : _4.large) !== null && _5 !== void 0 ? _5 : (_7 = (_6 = item.node.mediaRecommendation) === null || _6 === void 0 ? void 0 : _6.coverImage) === null || _7 === void 0 ? void 0 : _7.medium),
                        cover: (_15 = (_12 = (_9 = (_8 = item.node.mediaRecommendation) === null || _8 === void 0 ? void 0 : _8.bannerImage) !== null && _9 !== void 0 ? _9 : (_11 = (_10 = item.node.mediaRecommendation) === null || _10 === void 0 ? void 0 : _10.coverImage) === null || _11 === void 0 ? void 0 : _11.extraLarge) !== null && _12 !== void 0 ? _12 : (_14 = (_13 = item.node.mediaRecommendation) === null || _13 === void 0 ? void 0 : _13.coverImage) === null || _14 === void 0 ? void 0 : _14.large) !== null && _15 !== void 0 ? _15 : (_17 = (_16 = item.node.mediaRecommendation) === null || _16 === void 0 ? void 0 : _16.coverImage) === null || _17 === void 0 ? void 0 : _17.medium,
                        coverHash: utils_2.getHashFromImage((_25 = (_22 = (_19 = (_18 = item.node.mediaRecommendation) === null || _18 === void 0 ? void 0 : _18.bannerImage) !== null && _19 !== void 0 ? _19 : (_21 = (_20 = item.node.mediaRecommendation) === null || _20 === void 0 ? void 0 : _20.coverImage) === null || _21 === void 0 ? void 0 : _21.extraLarge) !== null && _22 !== void 0 ? _22 : (_24 = (_23 = item.node.mediaRecommendation) === null || _23 === void 0 ? void 0 : _23.coverImage) === null || _24 === void 0 ? void 0 : _24.large) !== null && _25 !== void 0 ? _25 : (_27 = (_26 = item.node.mediaRecommendation) === null || _26 === void 0 ? void 0 : _26.coverImage) === null || _27 === void 0 ? void 0 : _27.medium),
                        rating: (_28 = item.node.mediaRecommendation) === null || _28 === void 0 ? void 0 : _28.meanScore,
                        type: (_29 = item.node.mediaRecommendation) === null || _29 === void 0 ? void 0 : _29.format,
                    });
                });
                mangaInfo.characters = data.data.Media.characters.edges.map((item) => {
                    var _a, _b, _c;
                    return ({
                        id: (_a = item.node) === null || _a === void 0 ? void 0 : _a.id,
                        role: item.role,
                        name: {
                            first: item.node.name.first,
                            last: item.node.name.last,
                            full: item.node.name.full,
                            native: item.node.name.native,
                            userPreferred: item.node.name.userPreferred,
                        },
                        image: (_b = item.node.image.large) !== null && _b !== void 0 ? _b : item.node.image.medium,
                        imageHash: utils_2.getHashFromImage((_c = item.node.image.large) !== null && _c !== void 0 ? _c : item.node.image.medium),
                    });
                });
                mangaInfo.relations = data.data.Media.relations.edges.map((item) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
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
                        image: (_b = (_a = item.node.coverImage.extraLarge) !== null && _a !== void 0 ? _a : item.node.coverImage.large) !== null && _b !== void 0 ? _b : item.node.coverImage.medium,
                        imageHash: utils_2.getHashFromImage((_d = (_c = item.node.coverImage.extraLarge) !== null && _c !== void 0 ? _c : item.node.coverImage.large) !== null && _d !== void 0 ? _d : item.node.coverImage.medium),
                        color: (_e = item.node.coverImage) === null || _e === void 0 ? void 0 : _e.color,
                        type: item.node.format,
                        cover: (_h = (_g = (_f = item.node.bannerImage) !== null && _f !== void 0 ? _f : item.node.coverImage.extraLarge) !== null && _g !== void 0 ? _g : item.node.coverImage.large) !== null && _h !== void 0 ? _h : item.node.coverImage.medium,
                        coverHash: utils_2.getHashFromImage((_l = (_k = (_j = item.node.bannerImage) !== null && _j !== void 0 ? _j : item.node.coverImage.extraLarge) !== null && _k !== void 0 ? _k : item.node.coverImage.large) !== null && _l !== void 0 ? _l : item.node.coverImage.medium),
                        rating: item.node.meanScore,
                    });
                });
                mangaInfo.chapters = await new Anilist().findManga(this.provider, {
                    english: mangaInfo.title.english,
                    romaji: mangaInfo.title.romaji,
                }, mangaInfo.malId);
                mangaInfo.chapters = mangaInfo.chapters.reverse();
                return mangaInfo;
            }
            catch (error) {
                throw Error(error.message);
            }
        };
        this.provider = provider || new mangasee123_1.default();
    }
};
// (async () => {
//   const ani = new Anilist(new Zoro());
//   const anime = await ani.fetchAnimeInfo('21');
//   console.log(anime.episodes);
//   const sources = await ani.fetchEpisodeSources(anime.episodes![0].id, anime.episodes![0].number, anime.id);
//   console.log(sources);
// })();
exports.default = Anilist;
//# sourceMappingURL=anilist.js.map