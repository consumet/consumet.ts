"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../../models");
const utils_1 = require("../../utils");
const hianime_1 = __importDefault(require("../anime/hianime"));
const utils_2 = require("../../utils/utils");
const queries_1 = require("../../utils/queries");
const mangadex_1 = __importDefault(require("../manga/mangadex"));
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
        this.anifyUrl = 'https://anify.eltik.cc';
        /**
         * @param authToken Anilist auth token
         * @param type Type of favorites to fetch: 'ANIME', 'MANGA', or 'BOTH' (default: 'BOTH')
         * @returns favorite lists
         */
        this.fetchFavoriteList = async (authToken, type = 'BOTH') => {
            const options = {
                query: (0, queries_1.anilistFavouritesQuery)(),
            };
            try {
                let { data, status } = await this.client.post(this.anilistGraphqlUrl, options, {
                    validateStatus: () => true,
                    headers: {
                        Authorization: authToken,
                        'User-Agent': utils_2.USER_AGENT,
                    },
                });
                const result = {};
                if (type === 'ANIME' || type === 'BOTH') {
                    result.anime = data.data.Viewer.favourites.anime.nodes.map((item) => ({
                        id: item.id.toString(),
                        malId: item.idMal,
                        title: item.title
                            ? {
                                romaji: item.title.romaji,
                                english: item.title.english,
                                native: item.title.native,
                                userPreferred: item.title.userPreferred,
                            }
                            : item.title.romaji,
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
                        image: item.coverImage?.extraLarge ?? item.coverImage?.large ?? item.coverImage?.medium,
                        imageHash: (0, utils_2.getHashFromImage)(item.coverImage?.extraLarge ?? item.coverImage?.large ?? item.coverImage?.medium),
                        cover: item.bannerImage,
                        coverHash: (0, utils_2.getHashFromImage)(item.bannerImage),
                        popularity: item.popularity,
                        description: item.description,
                        rating: item.averageScore,
                        genres: item.genres,
                        color: item.coverImage?.color,
                        totalEpisodes: item.episodes ?? undefined,
                        totalChapters: item.chapters ?? undefined,
                        totalVolumes: item.volumes ?? undefined,
                        type: item.format,
                        mediaType: item.type,
                        releaseDate: item.seasonYear,
                    }));
                }
                if (type === 'MANGA' || type === 'BOTH') {
                    result.manga = data.data.Viewer.favourites.manga.nodes.map((item) => ({
                        id: item.id.toString(),
                        malId: item.idMal,
                        title: item.title
                            ? {
                                romaji: item.title.romaji,
                                english: item.title.english,
                                native: item.title.native,
                                userPreferred: item.title.userPreferred,
                            }
                            : item.title.romaji,
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
                        image: item.coverImage?.extraLarge ?? item.coverImage?.large ?? item.coverImage?.medium,
                        imageHash: (0, utils_2.getHashFromImage)(item.coverImage?.extraLarge ?? item.coverImage?.large ?? item.coverImage?.medium),
                        cover: item.bannerImage,
                        coverHash: (0, utils_2.getHashFromImage)(item.bannerImage),
                        popularity: item.popularity,
                        description: item.description,
                        rating: item.averageScore,
                        genres: item.genres,
                        color: item.coverImage?.color,
                        totalEpisodes: item.episodes ?? undefined,
                        totalChapters: item.chapters ?? undefined,
                        totalVolumes: item.volumes ?? undefined,
                        type: item.format,
                        mediaType: item.type,
                        releaseDate: item.seasonYear,
                    }));
                }
                return result;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * @param query Search query
         * @param page Page number (optional)
         * @param perPage Number of results per page (optional) (default: 15) (max: 50)
         */
        this.search = async (query, page = 1, perPage = 15) => {
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: (0, utils_1.anilistSearchQuery)(query, page, perPage),
            };
            try {
                let { data, status } = await this.client.post(this.anilistGraphqlUrl, options, {
                    validateStatus: () => true,
                });
                const res = {
                    currentPage: data.data.Page?.pageInfo?.currentPage ?? data.meta?.currentPage,
                    hasNextPage: data.data.Page?.pageInfo?.hasNextPage ?? data.meta?.currentPage != data.meta?.lastPage,
                    results: data.data?.Page?.media?.map((item) => ({
                        id: item.id.toString(),
                        malId: item.idMal,
                        title: item.title
                            ? {
                                romaji: item.title.romaji,
                                english: item.title.english,
                                native: item.title.native,
                                userPreferred: item.title.userPreferred,
                            }
                            : item.title.romaji,
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
                        image: item.coverImage?.extraLarge ?? item.coverImage?.large ?? item.coverImage?.medium,
                        imageHash: (0, utils_2.getHashFromImage)(item.coverImage?.extraLarge ?? item.coverImage?.large ?? item.coverImage?.medium),
                        cover: item.bannerImage,
                        coverHash: (0, utils_2.getHashFromImage)(item.bannerImage),
                        popularity: item.popularity,
                        description: item.description,
                        rating: item.averageScore,
                        genres: item.genres,
                        color: item.coverImage?.color,
                        totalEpisodes: item.episodes ||
                            (item.nextAiringEpisode?.episode ? item.nextAiringEpisode.episode - 1 : undefined),
                        currentEpisodeCount: item?.nextAiringEpisode
                            ? item?.nextAiringEpisode?.episode - 1
                            : item.episodes,
                        type: item.format,
                        releaseDate: item.seasonYear,
                    })) ??
                        data.data.map((item) => ({
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
                            image: item.coverImage ?? item.bannerImage,
                            imageHash: (0, utils_2.getHashFromImage)(item.coverImage ?? item.bannerImage),
                            cover: item.bannerImage,
                            coverHash: (0, utils_2.getHashFromImage)(item.bannerImage),
                            popularity: item.popularity,
                            description: item.description,
                            rating: item.averageScore,
                            genres: item.genre,
                            color: item.color,
                            totalEpisodes: item.currentEpisode,
                            currentEpisodeCount: item?.nextAiringEpisode
                                ? item?.nextAiringEpisode?.episode - 1
                                : item.currentEpisode,
                            type: item.format,
                            releaseDate: item.year,
                        })),
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
         * @param countryOfOrigin Country of origin (optional)
         */
        this.advancedSearch = async (query, type = 'ANIME', page = 1, perPage = 20, format, sort, genres, id, year, status, season, countryOfOrigin) => {
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: (0, utils_1.anilistAdvancedQuery)(),
                variables: {
                    search: query,
                    type,
                    page,
                    size: perPage,
                    format,
                    sort,
                    genres,
                    id,
                    year: year ? `${year}%` : undefined,
                    status,
                    season,
                    countryOfOrigin,
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
                const res = {
                    currentPage: data.data?.Page?.pageInfo?.currentPage ?? data.meta?.currentPage,
                    hasNextPage: data.data?.Page?.pageInfo?.hasNextPage ?? data.meta?.currentPage != data.meta?.lastPage,
                    totalPages: data.data?.Page?.pageInfo?.lastPage,
                    totalResults: data.data?.Page?.pageInfo?.total,
                    results: [],
                };
                res.results.push(...(data.data?.Page?.media?.map((item) => ({
                    id: item.id.toString(),
                    malId: item.idMal,
                    title: item.title
                        ? {
                            romaji: item.title.romaji,
                            english: item.title.english,
                            native: item.title.native,
                            userPreferred: item.title.userPreferred,
                        }
                        : item.title.romaji,
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
                    image: item.coverImage.extraLarge ?? item.coverImage.large ?? item.coverImage.medium,
                    imageHash: (0, utils_2.getHashFromImage)(item.coverImage.extraLarge ?? item.coverImage.large ?? item.coverImage.medium),
                    cover: item.bannerImage,
                    coverHash: (0, utils_2.getHashFromImage)(item.bannerImage),
                    popularity: item.popularity,
                    totalEpisodes: item.episodes ||
                        (item.nextAiringEpisode?.episode ? item.nextAiringEpisode.episode - 1 : undefined),
                    currentEpisode: item.nextAiringEpisode?.episode - 1 || item.episodes,
                    countryOfOrigin: item.countryOfOrigin,
                    chapters: item.chapters ?? undefined,
                    description: item.description,
                    genres: item.genres,
                    rating: item.averageScore,
                    color: item.coverImage?.color,
                    type: item.format,
                    releaseDate: item?.seasonYear ?? item.startDate?.year,
                })) ??
                    data.data?.map((item) => ({
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
                        image: item.coverImage ?? item.bannerImage,
                        imageHash: (0, utils_2.getHashFromImage)(item.coverImage ?? item.bannerImage),
                        cover: item.bannerImage,
                        coverHash: (0, utils_2.getHashFromImage)(item.bannerImage),
                        popularity: item.popularity,
                        description: item.description,
                        rating: item.averageScore,
                        genres: item.genre,
                        color: item.color,
                        totalEpisodes: item.currentEpisode,
                        chapters: item.totalChapters ?? undefined,
                        type: item.format,
                        releaseDate: item.year ?? item.startDate?.year,
                    })) ??
                    []));
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
                animeInfo.malId = data.data?.Media?.idMal ?? data?.mappings?.mal;
                animeInfo.title = data.data.Media
                    ? {
                        romaji: data.data.Media.title.romaji,
                        english: data.data.Media.title.english,
                        native: data.data.Media.title.native,
                        userPreferred: data.data.Media.title.userPreferred,
                    }
                    : data.data.title;
                animeInfo.synonyms = data.data?.Media?.synonyms ?? data?.synonyms;
                animeInfo.isLicensed = data.data?.Media?.isLicensed ?? undefined;
                animeInfo.isAdult = data.data?.Media?.isAdult ?? undefined;
                animeInfo.countryOfOrigin = data.data?.Media?.countryOfOrigin ?? undefined;
                if (data.data?.Media?.trailer?.id) {
                    animeInfo.trailer = {
                        id: data.data.Media.trailer.id,
                        site: data.data.Media.trailer?.site,
                        thumbnail: data.data.Media.trailer?.thumbnail,
                        thumbnailHash: (0, utils_2.getHashFromImage)(data.data.Media.trailer?.thumbnail),
                    };
                }
                animeInfo.image =
                    data.data?.Media?.coverImage?.extraLarge ??
                        data.data?.Media?.coverImage?.large ??
                        data.data?.Media?.coverImage?.medium ??
                        data.coverImage ??
                        data.bannerImage;
                animeInfo.imageHash = (0, utils_2.getHashFromImage)(data.data?.Media?.coverImage?.extraLarge ??
                    data.data?.Media?.coverImage?.large ??
                    data.data?.Media?.coverImage?.medium ??
                    data.coverImage ??
                    data.bannerImage);
                animeInfo.popularity = data.data?.Media?.popularity ?? data?.popularity;
                animeInfo.color = data.data?.Media?.coverImage?.color ?? data?.color;
                animeInfo.cover = data.data?.Media?.bannerImage ?? data?.bannerImage ?? animeInfo.image;
                animeInfo.coverHash = (0, utils_2.getHashFromImage)(data.data?.Media?.bannerImage ?? data?.bannerImage ?? animeInfo.image);
                animeInfo.description = data.data?.Media?.description ?? data?.description;
                switch (data.data?.Media?.status ?? data?.status) {
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
                animeInfo.releaseDate = data.data?.Media?.startDate?.year ?? data.year;
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
                if (data.data.Media.nextAiringEpisode?.airingAt)
                    animeInfo.nextAiringEpisode = {
                        airingTime: data.data.Media.nextAiringEpisode?.airingAt,
                        timeUntilAiring: data.data.Media.nextAiringEpisode?.timeUntilAiring,
                        episode: data.data.Media.nextAiringEpisode?.episode,
                    };
                animeInfo.totalEpisodes = data.data.Media?.episodes ?? data.data.Media.nextAiringEpisode?.episode - 1;
                animeInfo.currentEpisode = data.data.Media?.nextAiringEpisode?.episode
                    ? data.data.Media.nextAiringEpisode?.episode - 1
                    : data.data.Media?.episodes;
                animeInfo.rating = data.data.Media.averageScore;
                animeInfo.duration = data.data.Media.duration;
                animeInfo.genres = data.data.Media.genres;
                animeInfo.season = data.data.Media.season;
                animeInfo.studios = data.data.Media.studios.edges.map((item) => item.node.name);
                animeInfo.subOrDub = dub ? models_1.SubOrSub.DUB : models_1.SubOrSub.SUB;
                animeInfo.type = data.data.Media.format;
                animeInfo.recommendations = data.data.Media?.recommendations?.edges?.map((item) => ({
                    id: item.node.mediaRecommendation?.id,
                    malId: item.node.mediaRecommendation?.idMal,
                    title: {
                        romaji: item.node.mediaRecommendation?.title?.romaji,
                        english: item.node.mediaRecommendation?.title?.english,
                        native: item.node.mediaRecommendation?.title?.native,
                        userPreferred: item.node.mediaRecommendation?.title?.userPreferred,
                    },
                    status: item.node.mediaRecommendation?.status == 'RELEASING'
                        ? models_1.MediaStatus.ONGOING
                        : item.node.mediaRecommendation?.status == 'FINISHED'
                            ? models_1.MediaStatus.COMPLETED
                            : item.node.mediaRecommendation?.status == 'NOT_YET_RELEASED'
                                ? models_1.MediaStatus.NOT_YET_AIRED
                                : item.node.mediaRecommendation?.status == 'CANCELLED'
                                    ? models_1.MediaStatus.CANCELLED
                                    : item.node.mediaRecommendation?.status == 'HIATUS'
                                        ? models_1.MediaStatus.HIATUS
                                        : models_1.MediaStatus.UNKNOWN,
                    episodes: item.node.mediaRecommendation?.episodes,
                    image: item.node.mediaRecommendation?.coverImage?.extraLarge ??
                        item.node.mediaRecommendation?.coverImage?.large ??
                        item.node.mediaRecommendation?.coverImage?.medium,
                    imageHash: (0, utils_2.getHashFromImage)(item.node.mediaRecommendation?.coverImage?.extraLarge ??
                        item.node.mediaRecommendation?.coverImage?.large ??
                        item.node.mediaRecommendation?.coverImage?.medium),
                    cover: item.node.mediaRecommendation?.bannerImage ??
                        item.node.mediaRecommendation?.coverImage?.extraLarge ??
                        item.node.mediaRecommendation?.coverImage?.large ??
                        item.node.mediaRecommendation?.coverImage?.medium,
                    coverHash: (0, utils_2.getHashFromImage)(item.node.mediaRecommendation?.bannerImage ??
                        item.node.mediaRecommendation?.coverImage?.extraLarge ??
                        item.node.mediaRecommendation?.coverImage?.large ??
                        item.node.mediaRecommendation?.coverImage?.medium),
                    rating: item.node.mediaRecommendation?.meanScore,
                    type: item.node.mediaRecommendation?.format,
                }));
                animeInfo.characters = data.data?.Media?.characters?.edges?.map((item) => ({
                    id: item.node?.id,
                    role: item.role,
                    name: {
                        first: item.node.name.first,
                        last: item.node.name.last,
                        full: item.node.name.full,
                        native: item.node.name.native,
                        userPreferred: item.node.name.userPreferred,
                    },
                    image: item.node.image.large ?? item.node.image.medium,
                    imageHash: (0, utils_2.getHashFromImage)(item.node.image.large ?? item.node.image.medium),
                    voiceActors: item.voiceActors.map((voiceActor) => ({
                        id: voiceActor.id,
                        language: voiceActor.languageV2,
                        name: {
                            first: voiceActor.name.first,
                            last: voiceActor.name.last,
                            full: voiceActor.name.full,
                            native: voiceActor.name.native,
                            userPreferred: voiceActor.name.userPreferred,
                        },
                        image: voiceActor.image.large ?? voiceActor.image.medium,
                        imageHash: (0, utils_2.getHashFromImage)(voiceActor.image.large ?? voiceActor.image.medium),
                    })),
                }));
                animeInfo.relations = data.data?.Media?.relations?.edges?.map((item) => ({
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
                    image: item.node.coverImage.extraLarge ?? item.node.coverImage.large ?? item.node.coverImage.medium,
                    imageHash: (0, utils_2.getHashFromImage)(item.node.coverImage.extraLarge ?? item.node.coverImage.large ?? item.node.coverImage.medium),
                    color: item.node.coverImage?.color,
                    type: item.node.format,
                    cover: item.node.bannerImage ??
                        item.node.coverImage.extraLarge ??
                        item.node.coverImage.large ??
                        item.node.coverImage.medium,
                    coverHash: (0, utils_2.getHashFromImage)(item.node.bannerImage ??
                        item.node.coverImage.extraLarge ??
                        item.node.coverImage.large ??
                        item.node.coverImage.medium),
                    rating: item.node.meanScore,
                }));
                if (this.provider instanceof hianime_1.default &&
                    !dub &&
                    (animeInfo.status === models_1.MediaStatus.ONGOING ||
                        (0, utils_1.range)({ from: 1940, to: new Date().getFullYear() + 1 }).includes(parseInt(animeInfo.releaseDate)))) {
                    try {
                        // Note: commenting out for now, will fix it properly in future
                        // const anifyInfo = await new Anify(
                        //   this.proxyConfig,
                        //   this.adapter,
                        //   this.provider.name.toLowerCase() as 'gogoanime' | 'Hianime' | 'animepahe' | '9anime'
                        // ).fetchAnimeInfo(id);
                        // animeInfo.mappings = anifyInfo.mappings;
                        // animeInfo.artwork = anifyInfo.artwork;
                        // animeInfo.episodes = anifyInfo.episodes?.map((item: any) => ({
                        //   id: item.id,
                        //   title: item.title,
                        //   description: item.description,
                        //   number: item.number,
                        //   image: item.image,
                        //   imageHash: getHashFromImage(item.image),
                        //   airDate: item.airDate ?? null,
                        // }));
                        if (!animeInfo.episodes?.length) {
                            animeInfo.episodes = await this.fetchDefaultEpisodeList({
                                idMal: animeInfo.malId,
                                season: data.data.Media.season,
                                startDate: { year: parseInt(animeInfo.releaseDate) },
                                title: {
                                    english: animeInfo.title?.english,
                                    romaji: animeInfo.title?.romaji,
                                },
                            }, dub, id);
                            animeInfo.episodes = animeInfo.episodes?.map((episode) => {
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
                                english: animeInfo.title?.english,
                                romaji: animeInfo.title?.romaji,
                            },
                        }, dub, id);
                        animeInfo.episodes = animeInfo.episodes?.map((episode) => {
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
                            english: animeInfo.title?.english,
                            romaji: animeInfo.title?.romaji,
                        },
                        externalLinks: data.data.Media.externalLinks.filter((link) => link.type === 'STREAMING'),
                    }, dub, id);
                if (fetchFiller) {
                    const { data: fillerData } = await this.client.get(`https://raw.githubusercontent.com/saikou-app/mal-id-filler-list/main/fillers/${animeInfo.malId}.json`, { validateStatus: () => true });
                    if (!fillerData.toString().startsWith('404')) {
                        fillerEpisodes = [];
                        fillerEpisodes?.push(...fillerData.episodes);
                    }
                }
                animeInfo.episodes = animeInfo.episodes?.map((episode) => {
                    if (!episode.image) {
                        episode.image = animeInfo.image;
                        episode.imageHash = animeInfo.imageHash;
                    }
                    if (fetchFiller &&
                        fillerEpisodes?.length > 0 &&
                        fillerEpisodes?.length >= animeInfo.episodes.length) {
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
            title.english = title.english ?? title.romaji;
            title.romaji = title.romaji ?? title.english;
            title.english = title.english.toLowerCase();
            title.romaji = title.romaji.toLowerCase();
            if (title.english === title.romaji) {
                return ((await this.findAnimeSlug(title.english, season, startDate, malId, dub, anilistId, externalLinks)) ??
                    []);
            }
            const romajiPossibleEpisodes = await this.findAnimeSlug(title.romaji, season, startDate, malId, dub, anilistId, externalLinks);
            if (romajiPossibleEpisodes) {
                return romajiPossibleEpisodes;
            }
            const englishPossibleEpisodes = await this.findAnimeSlug(title.english, season, startDate, malId, dub, anilistId, externalLinks);
            return englishPossibleEpisodes ?? [];
        };
        this.findAnimeSlug = async (title, season, startDate, malId, dub, anilistId, externalLinks) => {
            const slug = title.replace(/[^0-9a-zA-Z]+/g, ' ');
            let possibleAnime;
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
            if (this.provider instanceof hianime_1.default) {
                // Set the correct episode sub/dub request type
                possibleAnime.episodes.forEach((_, index) => {
                    if (possibleAnime.subOrDub === models_1.SubOrSub.BOTH) {
                        possibleAnime.episodes[index].id = possibleAnime.episodes[index].id.replace(`$both`, dub ? '$dub' : '$sub');
                    }
                });
            }
            const possibleProviderEpisodes = possibleAnime.episodes;
            if (typeof possibleProviderEpisodes[0]?.image !== 'undefined' &&
                typeof possibleProviderEpisodes[0]?.title !== 'undefined' &&
                typeof possibleProviderEpisodes[0]?.description !== 'undefined')
                return possibleProviderEpisodes;
            const options = {
                headers: { 'Content-Type': 'application/json' },
                query: (0, utils_1.kitsuSearchQuery)(slug),
            };
            const newEpisodeList = await this.findKitsuAnime(possibleProviderEpisodes, options, season, startDate);
            return newEpisodeList;
        };
        this.findKitsuAnime = async (possibleProviderEpisodes, options, season, startDate) => {
            try {
                const kitsuEpisodes = await this.client.post(this.kitsuGraphqlUrl, options);
                const episodesList = new Map();
                if (kitsuEpisodes?.data.data) {
                    const { nodes } = kitsuEpisodes.data.data.searchAnimeByTitle;
                    if (nodes) {
                        nodes.forEach((node) => {
                            if (node.season === season && node.startDate.trim().split('-')[0] === startDate?.toString()) {
                                const episodes = node.episodes.nodes;
                                for (const episode of episodes) {
                                    const i = episode?.number.toString().replace(/"/g, '');
                                    let name = undefined;
                                    let description = undefined;
                                    let thumbnail = undefined;
                                    let thumbnailHash = undefined;
                                    if (episode?.description?.en)
                                        description = episode?.description.en.toString().replace(/"/g, '').replace('\\n', '\n');
                                    if (episode?.thumbnail) {
                                        thumbnail = episode?.thumbnail.original.url.toString().replace(/"/g, '');
                                        thumbnailHash = (0, utils_2.getHashFromImage)(episode?.thumbnail.original.url.toString().replace(/"/g, ''));
                                    }
                                    if (episode) {
                                        if (episode.titles?.canonical)
                                            name = episode.titles.canonical.toString().replace(/"/g, '');
                                        episodesList.set(i, {
                                            episodeNum: episode?.number.toString().replace(/"/g, ''),
                                            title: name,
                                            description,
                                            createdAt: episode?.createdAt,
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
                if (possibleProviderEpisodes?.length !== 0) {
                    possibleProviderEpisodes?.forEach((ep, i) => {
                        const j = (i + 1).toString();
                        newEpisodeList.push({
                            id: ep.id,
                            title: ep.title ?? episodesList.get(j)?.title ?? null,
                            image: ep.image ?? episodesList.get(j)?.thumbnail ?? null,
                            imageHash: (0, utils_2.getHashFromImage)(ep.image ?? episodesList.get(j)?.thumbnail ?? null),
                            number: ep.number,
                            createdAt: ep.createdAt ?? episodesList.get(j)?.createdAt ?? null,
                            description: ep.description ?? episodesList.get(j)?.description ?? null,
                            url: ep.url ?? null,
                        });
                    });
                }
                return newEpisodeList;
            }
            catch (error) {
                return possibleProviderEpisodes;
            }
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
                query: (0, utils_1.anilistTrendingQuery)(page, perPage),
            };
            try {
                const { data } = await this.client.post(this.anilistGraphqlUrl, options);
                const res = {
                    currentPage: data.data.Page.pageInfo.currentPage,
                    hasNextPage: data.data.Page.pageInfo.hasNextPage,
                    results: data.data.Page.media.map((item) => ({
                        id: item.id.toString(),
                        malId: item.idMal,
                        title: item.title
                            ? {
                                romaji: item.title.romaji,
                                english: item.title.english,
                                native: item.title.native,
                                userPreferred: item.title.userPreferred,
                            }
                            : item.title.romaji,
                        image: item.coverImage.extraLarge ?? item.coverImage.large ?? item.coverImage.medium,
                        imageHash: (0, utils_2.getHashFromImage)(item.coverImage.extraLarge ?? item.coverImage.large ?? item.coverImage.medium),
                        trailer: {
                            id: item.trailer?.id,
                            site: item.trailer?.site,
                            thumbnail: item.trailer?.thumbnail,
                            thumbnailHash: (0, utils_2.getHashFromImage)(item.trailer?.thumbnail),
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
                        cover: item.bannerImage ?? item.coverImage.extraLarge ?? item.coverImage.large ?? item.coverImage.medium,
                        coverHash: (0, utils_2.getHashFromImage)(item.bannerImage ?? item.coverImage.extraLarge ?? item.coverImage.large ?? item.coverImage.medium),
                        rating: item.averageScore,
                        releaseDate: item.seasonYear,
                        color: item.coverImage?.color,
                        genres: item.genres,
                        totalEpisodes: isNaN(item.episodes) ? 0 : item.episodes,
                        duration: item.duration,
                        type: item.format,
                    })),
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
                query: (0, utils_1.anilistPopularQuery)(page, perPage),
            };
            try {
                const { data } = await this.client.post(this.anilistGraphqlUrl, options);
                const res = {
                    currentPage: data.data.Page.pageInfo.currentPage,
                    hasNextPage: data.data.Page.pageInfo.hasNextPage,
                    results: data.data.Page.media.map((item) => ({
                        id: item.id.toString(),
                        malId: item.idMal,
                        title: item.title
                            ? {
                                romaji: item.title.romaji,
                                english: item.title.english,
                                native: item.title.native,
                                userPreferred: item.title.userPreferred,
                            }
                            : item.title.romaji,
                        image: item.coverImage.extraLarge ?? item.coverImage.large ?? item.coverImage.medium,
                        imageHash: (0, utils_2.getHashFromImage)(item.coverImage.extraLarge ?? item.coverImage.large ?? item.coverImage.medium),
                        trailer: {
                            id: item.trailer?.id,
                            site: item.trailer?.site,
                            thumbnail: item.trailer?.thumbnail,
                            thumbnailHash: (0, utils_2.getHashFromImage)(item.trailer?.thumbnail),
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
                        cover: item.bannerImage ?? item.coverImage.extraLarge ?? item.coverImage.large ?? item.coverImage.medium,
                        coverHash: (0, utils_2.getHashFromImage)(item.bannerImage ?? item.coverImage.extraLarge ?? item.coverImage.large ?? item.coverImage.medium),
                        rating: item.averageScore,
                        releaseDate: item.seasonYear,
                        color: item.coverImage?.color,
                        genres: item.genres,
                        totalEpisodes: isNaN(item.episodes) ? 0 : item.episodes,
                        duration: item.duration,
                        type: item.format,
                    })),
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
                [day1, day2] = (0, utils_1.getDays)((0, utils_1.capitalizeFirstLetter)(weekStart.toLowerCase()), (0, utils_1.capitalizeFirstLetter)(weekEnd.toLowerCase()));
            else if (typeof weekStart === 'number' && typeof weekEnd === 'number')
                [day1, day2] = [weekStart, weekEnd];
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
                const { data } = await this.client.post(this.anilistGraphqlUrl, options);
                const res = {
                    currentPage: data.data.Page.pageInfo.currentPage,
                    hasNextPage: data.data.Page.pageInfo.hasNextPage,
                    results: data.data.Page.airingSchedules.map((item) => ({
                        id: item.media.id.toString(),
                        malId: item.media.idMal,
                        episode: item.episode,
                        airingAt: item.airingAt,
                        title: item.media.title
                            ? {
                                romaji: item.media.title.romaji,
                                english: item.media.title.english,
                                native: item.media.title.native,
                                userPreferred: item.media.title.userPreferred,
                            }
                            : item.media.title.romaji,
                        country: item.media.countryOfOrigin,
                        image: item.media.coverImage.extraLarge ?? item.media.coverImage.large ?? item.media.coverImage.medium,
                        imageHash: (0, utils_2.getHashFromImage)(item.media.coverImage.extraLarge ?? item.media.coverImage.large ?? item.media.coverImage.medium),
                        description: item.media.description,
                        cover: item.media.bannerImage ??
                            item.media.coverImage.extraLarge ??
                            item.media.coverImage.large ??
                            item.media.coverImage.medium,
                        coverHash: (0, utils_2.getHashFromImage)(item.media.bannerImage ??
                            item.media.coverImage.extraLarge ??
                            item.media.coverImage.large ??
                            item.media.coverImage.medium),
                        genres: item.media.genres,
                        color: item.media.coverImage?.color,
                        rating: item.media.averageScore,
                        releaseDate: item.media.seasonYear,
                        type: item.media.format,
                    })),
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
                query: (0, utils_1.anilistGenresQuery)(genres, page, perPage),
            };
            try {
                const { data } = await this.client.post(this.anilistGraphqlUrl, options);
                const res = {
                    currentPage: data.data.Page.pageInfo.currentPage,
                    hasNextPage: data.data.Page.pageInfo.hasNextPage,
                    results: data.data.Page.media.map((item) => ({
                        id: item.id.toString(),
                        malId: item.idMal,
                        title: item.title
                            ? {
                                romaji: item.title.romaji,
                                english: item.title.english,
                                native: item.title.native,
                                userPreferred: item.title.userPreferred,
                            }
                            : item.title.romaji,
                        image: item.coverImage.extraLarge ?? item.coverImage.large ?? item.coverImage.medium,
                        imageHash: (0, utils_2.getHashFromImage)(item.coverImage.extraLarge ?? item.coverImage.large ?? item.coverImage.medium),
                        trailer: {
                            id: item.trailer?.id,
                            site: item.trailer?.site,
                            thumbnail: item.trailer?.thumbnail,
                            thumbnailHash: (0, utils_2.getHashFromImage)(item.trailer?.thumbnail),
                        },
                        description: item.description,
                        cover: item.bannerImage ?? item.coverImage.extraLarge ?? item.coverImage.large ?? item.coverImage.medium,
                        coverHash: (0, utils_2.getHashFromImage)(item.bannerImage ?? item.coverImage.extraLarge ?? item.coverImage.large ?? item.coverImage.medium),
                        rating: item.averageScore,
                        releaseDate: item.seasonYear,
                        color: item.coverImage?.color,
                        genres: item.genres,
                        totalEpisodes: isNaN(item.episodes) ? 0 : item.episodes,
                        duration: item.duration,
                        type: item.format,
                    })),
                };
                return res;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.findAnimeRaw = async (title) => {
            const searchTerm = title?.romaji || title?.english || title?.userPreferred || '';
            const findAnime = (await this.provider.search(searchTerm));
            if (!findAnime?.results) {
                return {};
            }
            // Run similar title searches in parallel
            const [mappedEng, mappedRom] = await Promise.all([
                Promise.resolve((0, utils_2.findSimilarTitles)(title?.english || '', findAnime.results)),
                Promise.resolve((0, utils_2.findSimilarTitles)(title?.romaji || '', findAnime.results)),
            ]);
            // Use Set for efficient deduplication
            const uniqueResults = Array.from(new Set([...mappedEng, ...mappedRom].map(item => JSON.stringify(item)))).map(str => JSON.parse(str));
            // Sort by similarity score
            uniqueResults.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
            const mappings = {};
            for (const obj of uniqueResults) {
                const match = obj.title.replace(/\(TV\)/g, '').match(/\(([^)0-9]+)\)/);
                const key = match ? match[1].replace(/\s+/g, '-').toLowerCase() : 'sub';
                if (!mappings[key]) {
                    mappings[key] = obj.id;
                }
                // Early return if we have both sub and dub
                if (mappings.sub && mappings.dub)
                    break;
            }
            // console.log('mappings', mappings);
            // console.time('animeinfo');
            const animeInfo = await this.provider.fetchAnimeInfo(mappings.sub || mappings.dub);
            // console.timeEnd('animeinfo');
            return animeInfo.episodes;
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
                query: (0, utils_1.anilistSiteStatisticsQuery)(),
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
                const ids = data?.trim().split('\n');
                const selectedAnime = Math.floor(Math.random() * ids.length);
                return await this.fetchAnimeInfo(ids[selectedAnime]);
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * @param provider The provider to get the episode Ids from (optional) default: `gogoanime` (options: `gogoanime`, `Hianime`)
         * @param page page number (optional)
         * @param perPage number of results per page (optional)
         */
        this.fetchRecentEpisodes = async (provider = 'gogoanime', page = 1, perPage = 25) => {
            try {
                const { data } = await this.client.get(`${this.anifyUrl}/recent?page=${page}&perPage=${perPage}&type=anime`);
                const results = data?.map((item) => {
                    return {
                        id: item.id.toString(),
                        malId: item.mappings.find((item) => item.providerType === 'META' && item.providerId === 'mal')
                            ?.id,
                        title: {
                            romaji: item.title?.romaji,
                            english: item.title?.english,
                            native: item.title?.native,
                            // userPreferred: (_f = item.title) === null || _f === void 0 ? void 0 : _f.userPreferred,
                        },
                        image: item.coverImage ?? item.bannerImage,
                        imageHash: (0, utils_2.getHashFromImage)(item.coverImage ?? item.bannerImage),
                        rating: item.averageScore,
                        color: item.anime?.color,
                        episodeId: `${provider === 'gogoanime'
                            ? item.episodes.data
                                .find((source) => source.providerId.toLowerCase() === 'gogoanime')
                                ?.episodes.pop()?.id
                            : item.episodes.data
                                .find((source) => source.providerId.toLowerCase() === 'hianime')
                                ?.episodes.pop()?.id}`,
                        episodeTitle: item.episodes.latest.latestTitle ?? `Episode ${item.currentEpisode}`,
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
                    totalResults: results?.length,
                    results: results,
                };
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchDefaultEpisodeList = async (Media, dub, id) => {
            let episodes = [];
            episodes = await this.findAnimeRaw({ english: Media.title?.english, romaji: Media.title?.romaji });
            // console.log('fetchDefaultEpisodeList', episodes);
            return episodes;
        };
        /**
         * @param id anilist id
         * @param dub language of the dubbed version (optional) currently only works for gogoanime
         * @param fetchFiller to get filler boolean on the episode object (optional) set to `true` to get filler boolean on the episode object.
         * @returns episode list **(without anime info)**
         */
        this.fetchEpisodesListById = async (id, dub = false, fetchFiller = false) => {
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
            if (this.provider instanceof hianime_1.default &&
                !dub &&
                (Media.status === 'RELEASING' ||
                    (0, utils_1.range)({ from: 2000, to: new Date().getFullYear() + 1 }).includes(parseInt(Media.startDate?.year)))) {
                try {
                    // NOTE: gotta fix in future
                    // possibleAnimeEpisodes = (
                    //   await new Anify().fetchAnimeInfoByAnilistId(
                    //     id,
                    //     this.provider.name.toLowerCase() as 'gogoanime' | 'Hianime'
                    //   )
                    // ).episodes?.map((item: any) => ({
                    //   id: item.slug,
                    //   title: item.title,
                    //   description: item.description,
                    //   number: item.number,
                    //   image: item.image,
                    //   imageHash: getHashFromImage(item.image),
                    // }))!;
                    if (!possibleAnimeEpisodes.length) {
                        possibleAnimeEpisodes = await this.fetchDefaultEpisodeList(Media, dub, id);
                        possibleAnimeEpisodes = possibleAnimeEpisodes?.map((episode) => {
                            if (!episode.image) {
                                episode.image =
                                    Media.coverImage.extraLarge ?? Media.coverImage.large ?? Media.coverImage.medium;
                                episode.imageHash = (0, utils_2.getHashFromImage)(Media.coverImage.extraLarge ?? Media.coverImage.large ?? Media.coverImage.medium);
                            }
                            return episode;
                        });
                    }
                }
                catch (err) {
                    possibleAnimeEpisodes = await this.fetchDefaultEpisodeList(Media, dub, id);
                    possibleAnimeEpisodes = possibleAnimeEpisodes?.map((episode) => {
                        if (!episode.image) {
                            episode.image = Media.coverImage.extraLarge ?? Media.coverImage.large ?? Media.coverImage.medium;
                            episode.imageHash = (0, utils_2.getHashFromImage)(Media.coverImage.extraLarge ?? Media.coverImage.large ?? Media.coverImage.medium);
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
                    fillerEpisodes?.push(...fillerData.episodes);
                }
            }
            possibleAnimeEpisodes = possibleAnimeEpisodes?.map((episode) => {
                if (!episode.image) {
                    episode.image = Media.coverImage.extraLarge ?? Media.coverImage.large ?? Media.coverImage.medium;
                    episode.imageHash = (0, utils_2.getHashFromImage)(Media.coverImage.extraLarge ?? Media.coverImage.large ?? Media.coverImage.medium);
                }
                if (fetchFiller && fillerEpisodes?.length > 0 && fillerEpisodes?.length >= Media.episodes) {
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
                if (data.data.Media.trailer?.id) {
                    animeInfo.trailer = {
                        id: data.data.Media.trailer?.id,
                        site: data.data.Media.trailer?.site,
                        thumbnail: data.data.Media.trailer?.thumbnail,
                        thumbnailHash: (0, utils_2.getHashFromImage)(data.data.Media.trailer?.thumbnail),
                    };
                }
                animeInfo.synonyms = data.data.Media.synonyms;
                animeInfo.isLicensed = data.data.Media.isLicensed;
                animeInfo.isAdult = data.data.Media.isAdult;
                animeInfo.countryOfOrigin = data.data.Media.countryOfOrigin;
                animeInfo.image =
                    data.data.Media.coverImage.extraLarge ??
                        data.data.Media.coverImage.large ??
                        data.data.Media.coverImage.medium;
                animeInfo.imageHash = (0, utils_2.getHashFromImage)(data.data.Media.coverImage.extraLarge ??
                    data.data.Media.coverImage.large ??
                    data.data.Media.coverImage.medium);
                animeInfo.cover = data.data.Media.bannerImage ?? animeInfo.image;
                animeInfo.coverHash = (0, utils_2.getHashFromImage)(data.data.Media.bannerImage ?? animeInfo.image);
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
                if (data.data.Media.nextAiringEpisode?.airingAt)
                    animeInfo.nextAiringEpisode = {
                        airingTime: data.data.Media.nextAiringEpisode?.airingAt,
                        timeUntilAiring: data.data.Media.nextAiringEpisode?.timeUntilAiring,
                        episode: data.data.Media.nextAiringEpisode?.episode,
                    };
                animeInfo.totalEpisodes = data.data.Media?.episodes ?? data.data.Media.nextAiringEpisode?.episode - 1;
                animeInfo.totalChapters = data.data.Media.chapters;
                animeInfo.currentEpisode = data.data.Media?.nextAiringEpisode?.episode
                    ? data.data.Media.nextAiringEpisode?.episode - 1
                    : data.data.Media?.episodes || undefined;
                animeInfo.rating = data.data.Media.averageScore;
                animeInfo.duration = data.data.Media.duration;
                animeInfo.genres = data.data.Media.genres;
                animeInfo.studios = data.data.Media.studios.edges.map((item) => item.node.name);
                animeInfo.season = data.data.Media.season;
                animeInfo.popularity = data.data.Media.popularity;
                animeInfo.type = data.data.Media.format;
                animeInfo.startDate = {
                    year: data.data.Media.startDate?.year,
                    month: data.data.Media.startDate?.month,
                    day: data.data.Media.startDate?.day,
                };
                animeInfo.endDate = {
                    year: data.data.Media.endDate?.year,
                    month: data.data.Media.endDate?.month,
                    day: data.data.Media.endDate?.day,
                };
                animeInfo.recommendations = data.data.Media.recommendations.edges.map((item) => ({
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
                    chapters: item.node.mediaRecommendation.chapters,
                    image: item.node.mediaRecommendation.coverImage.extraLarge ??
                        item.node.mediaRecommendation.coverImage.large ??
                        item.node.mediaRecommendation.coverImage.medium,
                    imageHash: (0, utils_2.getHashFromImage)(item.node.mediaRecommendation.coverImage.extraLarge ??
                        item.node.mediaRecommendation.coverImage.large ??
                        item.node.mediaRecommendation.coverImage.medium),
                    cover: item.node.mediaRecommendation.bannerImage ??
                        item.node.mediaRecommendation.coverImage.extraLarge ??
                        item.node.mediaRecommendation.coverImage.large ??
                        item.node.mediaRecommendation.coverImage.medium,
                    coverHash: item.node.mediaRecommendation.bannerImage ??
                        item.node.mediaRecommendation.coverImage.extraLarge ??
                        item.node.mediaRecommendation.coverImage.large ??
                        item.node.mediaRecommendation.coverImage.medium,
                    rating: item.node.mediaRecommendation.meanScore,
                    type: item.node.mediaRecommendation.format,
                }));
                animeInfo.characters = data.data.Media.characters.edges.map((item) => ({
                    id: item.node.id,
                    role: item.role,
                    name: {
                        first: item.node.name.first,
                        last: item.node.name.last,
                        full: item.node.name.full,
                        native: item.node.name.native,
                        userPreferred: item.node.name.userPreferred,
                    },
                    image: item.node.image.large ?? item.node.image.medium,
                    imageHash: (0, utils_2.getHashFromImage)(item.node.image.large ?? item.node.image.medium),
                    voiceActors: item.voiceActors.map((voiceActor) => ({
                        id: voiceActor.id,
                        language: voiceActor.languageV2,
                        name: {
                            first: voiceActor.name.first,
                            last: voiceActor.name.last,
                            full: voiceActor.name.full,
                            native: voiceActor.name.native,
                            userPreferred: voiceActor.name.userPreferred,
                        },
                        image: voiceActor.image.large ?? voiceActor.image.medium,
                        imageHash: (0, utils_2.getHashFromImage)(voiceActor.image.large ?? voiceActor.image.medium),
                    })),
                }));
                animeInfo.color = data.data.Media.coverImage?.color;
                animeInfo.relations = data.data.Media.relations.edges.map((item) => ({
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
                    chapters: item.node.chapters,
                    image: item.node.coverImage.extraLarge ?? item.node.coverImage.large ?? item.node.coverImage.medium,
                    imageHash: (0, utils_2.getHashFromImage)(item.node.coverImage.extraLarge ?? item.node.coverImage.large ?? item.node.coverImage.medium),
                    cover: item.node.bannerImage ??
                        item.node.coverImage.extraLarge ??
                        item.node.coverImage.large ??
                        item.node.coverImage.medium,
                    coverHash: (0, utils_2.getHashFromImage)(item.node.bannerImage ??
                        item.node.coverImage.extraLarge ??
                        item.node.coverImage.large ??
                        item.node.coverImage.medium),
                    rating: item.node.meanScore,
                    type: item.node.format,
                }));
                return animeInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * To get Staff details by anilistId
         * @param id staff id from anilist
         *
         */
        this.fetchStaffById = async (id) => {
            const staffInfo = {
                id: String(id),
                name: { first: '', last: '', native: '', full: '' },
            };
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: (0, utils_1.anilistStaffInfoQuery)(id),
            };
            try {
                const { data } = await this.client.post(this.anilistGraphqlUrl, options).catch(err => {
                    throw new Error(err.message);
                });
                const staff = data.data.Staff;
                staffInfo.id = staff?.id;
                staffInfo.name = staff?.name;
                staffInfo.image = staff?.image;
                staffInfo.description = staff?.description;
                staffInfo.siteUrl = staff?.siteUrl;
                staffInfo.roles = staff?.staffMedia.edges.map((media) => ({
                    id: media?.node?.id,
                    title: media?.node?.title,
                    type: media?.node?.type,
                    image: {
                        extraLarge: media?.node?.coverImage?.extraLarge,
                        large: media?.node?.coverImage?.large,
                        medium: media?.node?.coverImage?.medium,
                    },
                    color: media?.node?.coverImage?.color,
                }));
                return staffInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         *
         * @param id character id from anilist
         */
        this.fetchCharacterInfoById = async (id) => {
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
                const { data: { data: { Character }, }, } = await this.client.post(this.anilistGraphqlUrl, options);
                const height = Character.description.match(/__Height:__(.*)/)?.[1].trim();
                const weight = Character.description.match(/__Weight:__(.*)/)?.[1].trim();
                const hairColor = Character.description.match(/__Hair Color:__(.*)/)?.[1].trim();
                const eyeColor = Character.description.match(/__Eye Color:__(.*)/)?.[1].trim();
                const relatives = Character.description
                    .match(/__Relatives:__(.*)/)?.[1]
                    .trim()
                    .split(/(, \[)/g)
                    .filter((g) => !g.includes(', ['))
                    .map((r) => ({
                    id: r.match(/\/(\d+)/)?.[1],
                    name: r.match(/([^)]+)\]/)?.[1].replace(/\[/g, ''),
                    relationship: r.match(/\(([^)]+)\).*?(\(([^)]+)\))/)?.[3],
                }));
                const race = Character.description
                    .match(/__Race:__(.*)/)?.[1]
                    .split(', ')
                    .map((r) => r.trim());
                const rank = Character.description.match(/__Rank:__(.*)/)?.[1];
                const occupation = Character.description.match(/__Occupation:__(.*)/)?.[1];
                const previousPosition = Character.description.match(/__Previous Position:__(.*)/)?.[1]?.trim();
                const partner = Character.description
                    .match(/__Partner:__(.*)/)?.[1]
                    .split(/(, \[)/g)
                    .filter((g) => !g.includes(', ['))
                    .map((r) => ({
                    id: r.match(/\/(\d+)/)?.[1],
                    name: r.match(/([^)]+)\]/)?.[1].replace(/\[/g, ''),
                }));
                const dislikes = Character.description.match(/__Dislikes:__(.*)/)?.[1];
                const sign = Character.description.match(/__Sign:__(.*)/)?.[1];
                const zodicSign = Character.description.match(/__Zodiac sign:__(.*)/)?.[1]?.trim();
                const zodicAnimal = Character.description.match(/__Zodiac Animal:__(.*)/)?.[1]?.trim();
                const themeSong = Character.description.match(/__Theme Song:__(.*)/)?.[1]?.trim();
                Character.description = Character.description.replace(/__Theme Song:__(.*)\n|__Race:__(.*)\n|__Height:__(.*)\n|__Relatives:__(.*)\n|__Rank:__(.*)\n|__Zodiac sign:__(.*)\n|__Zodiac Animal:__(.*)\n|__Weight:__(.*)\n|__Eye Color:__(.*)\n|__Hair Color:__(.*)\n|__Dislikes:__(.*)\n|__Sign:__(.*)\n|__Partner:__(.*)\n|__Previous Position:__(.*)\n|__Occupation:__(.*)\n/gm, '');
                const characterInfo = {
                    id: Character.id,
                    name: {
                        first: Character.name?.first,
                        last: Character.name?.last,
                        full: Character.name?.full,
                        native: Character.name?.native,
                        userPreferred: Character.name?.userPreferred,
                        alternative: Character.name?.alternative,
                        alternativeSpoiler: Character.name?.alternativeSpoiler,
                    },
                    image: Character.image?.large ?? Character.image?.medium,
                    imageHash: (0, utils_2.getHashFromImage)(Character.image?.large ?? Character.image?.medium),
                    description: Character.description,
                    gender: Character.gender,
                    dateOfBirth: {
                        year: Character.dateOfBirth?.year,
                        month: Character.dateOfBirth?.month,
                        day: Character.dateOfBirth?.day,
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
                    relations: Character.media.edges?.map((v) => ({
                        id: v.node.id,
                        malId: v.node.idMal,
                        role: v.characterRole,
                        title: {
                            romaji: v.node.title?.romaji,
                            english: v.node.title?.english,
                            native: v.node.title?.native,
                            userPreferred: v.node.title?.userPreferred,
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
                        image: v.node.coverImage?.extraLarge ?? v.node.coverImage?.large ?? v.node.coverImage?.medium,
                        imageHash: (0, utils_2.getHashFromImage)(v.node.coverImage?.extraLarge ?? v.node.coverImage?.large ?? v.node.coverImage?.medium),
                        rating: v.node.averageScore,
                        releaseDate: v.node.startDate?.year,
                        type: v.node.format,
                        color: v.node.coverImage?.color,
                    })),
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
            title.english = title.english ?? title.romaji;
            title.romaji = title.romaji ?? title.english;
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
        this.provider = provider || new hianime_1.default();
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
        this.search = async (query, page = 1, perPage = 20) => {
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                query: (0, utils_1.anilistSearchQuery)(query, page, perPage, 'MANGA'),
            };
            try {
                const { data } = await axios_1.default.post(new _a().anilistGraphqlUrl, options);
                const res = {
                    currentPage: data.data.Page.pageInfo.currentPage,
                    hasNextPage: data.data.Page.pageInfo.hasNextPage,
                    results: data.data.Page.media.map((item) => ({
                        id: item.id.toString(),
                        malId: item.idMal,
                        title: item.title
                            ? {
                                romaji: item.title.romaji,
                                english: item.title.english,
                                native: item.title.native,
                                userPreferred: item.title.userPreferred,
                            }
                            : item.title.romaji,
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
                        image: item.coverImage?.extraLarge ?? item.coverImage?.large ?? item.coverImage?.medium,
                        imageHash: (0, utils_2.getHashFromImage)(item.coverImage?.extraLarge ?? item.coverImage?.large ?? item.coverImage?.medium),
                        cover: item.bannerImage,
                        coverHash: (0, utils_2.getHashFromImage)(item.bannerImage),
                        popularity: item.popularity,
                        description: item.description,
                        rating: item.averageScore,
                        genres: item.genres,
                        color: item.coverImage?.color,
                        totalChapters: item.chapters,
                        volumes: item.volumes,
                        type: item.format,
                        releaseDate: item.seasonYear,
                    })),
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
        this.fetchChaptersList = async (mangaId, ...args) => {
            try {
                const options = {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    query: (0, utils_1.anilistMediaDetailQuery)(mangaId),
                };
                const { data } = await axios_1.default.post(new _a().anilistGraphqlUrl, options).catch(err => {
                    throw new Error('Media not found');
                });
                const title = {
                    english: data.data.Media.title.english,
                    romaji: data.data.Media.title.romaji,
                };
                const malId = data.data.Media.idMal;
                const chapters = await new _a().findManga(this.provider, title, malId);
                return chapters.reverse();
            }
            catch (error) {
                throw new Error(error.message);
            }
        };
        this.fetchMangaInfo = async (id, ...args) => {
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
                const { data } = await axios_1.default.post(new _a().anilistGraphqlUrl, options).catch(err => {
                    throw new Error('Media not found');
                });
                mangaInfo.malId = data.data.Media.idMal;
                mangaInfo.title = {
                    romaji: data.data.Media.title.romaji,
                    english: data.data.Media.title.english,
                    native: data.data.Media.title.native,
                    userPreferred: data.data.Media.title.userPreferred,
                };
                if (data.data.Media.trailer?.id) {
                    mangaInfo.trailer = {
                        id: data.data.Media.trailer.id,
                        site: data.data.Media.trailer?.site,
                        thumbnail: data.data.Media.trailer?.thumbnail,
                        thumbnailHash: (0, utils_2.getHashFromImage)(data.data.Media.trailer?.thumbnail),
                    };
                }
                mangaInfo.image =
                    data.data.Media.coverImage.extraLarge ??
                        data.data.Media.coverImage.large ??
                        data.data.Media.coverImage.medium;
                mangaInfo.imageHash = (0, utils_2.getHashFromImage)(data.data.Media.coverImage.extraLarge ??
                    data.data.Media.coverImage.large ??
                    data.data.Media.coverImage.medium);
                mangaInfo.popularity = data.data.Media.popularity;
                mangaInfo.color = data.data.Media.coverImage?.color;
                mangaInfo.cover = data.data.Media.bannerImage ?? mangaInfo.image;
                mangaInfo.coverHash = (0, utils_2.getHashFromImage)(data.data.Media.bannerImage ?? mangaInfo.image);
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
                mangaInfo.recommendations = data.data.Media.recommendations.edges.map((item) => ({
                    id: item.node.mediaRecommendation?.id,
                    malId: item.node.mediaRecommendation?.idMal,
                    title: {
                        romaji: item.node.mediaRecommendation?.title?.romaji,
                        english: item.node.mediaRecommendation?.title?.english,
                        native: item.node.mediaRecommendation?.title?.native,
                        userPreferred: item.node.mediaRecommendation?.title?.userPreferred,
                    },
                    status: item.node.mediaRecommendation?.status == 'RELEASING'
                        ? models_1.MediaStatus.ONGOING
                        : item.node.mediaRecommendation?.status == 'FINISHED'
                            ? models_1.MediaStatus.COMPLETED
                            : item.node.mediaRecommendation?.status == 'NOT_YET_RELEASED'
                                ? models_1.MediaStatus.NOT_YET_AIRED
                                : item.node.mediaRecommendation?.status == 'CANCELLED'
                                    ? models_1.MediaStatus.CANCELLED
                                    : item.node.mediaRecommendation?.status == 'HIATUS'
                                        ? models_1.MediaStatus.HIATUS
                                        : models_1.MediaStatus.UNKNOWN,
                    chapters: item.node.mediaRecommendation?.chapters,
                    image: item.node.mediaRecommendation?.coverImage?.extraLarge ??
                        item.node.mediaRecommendation?.coverImage?.large ??
                        item.node.mediaRecommendation?.coverImage?.medium,
                    imageHash: (0, utils_2.getHashFromImage)(item.node.mediaRecommendation?.coverImage?.extraLarge ??
                        item.node.mediaRecommendation?.coverImage?.large ??
                        item.node.mediaRecommendation?.coverImage?.medium),
                    cover: item.node.mediaRecommendation?.bannerImage ??
                        item.node.mediaRecommendation?.coverImage?.extraLarge ??
                        item.node.mediaRecommendation?.coverImage?.large ??
                        item.node.mediaRecommendation?.coverImage?.medium,
                    coverHash: (0, utils_2.getHashFromImage)(item.node.mediaRecommendation?.bannerImage ??
                        item.node.mediaRecommendation?.coverImage?.extraLarge ??
                        item.node.mediaRecommendation?.coverImage?.large ??
                        item.node.mediaRecommendation?.coverImage?.medium),
                    rating: item.node.mediaRecommendation?.meanScore,
                    type: item.node.mediaRecommendation?.format,
                }));
                mangaInfo.characters = data.data.Media.characters.edges.map((item) => ({
                    id: item.node?.id,
                    role: item.role,
                    name: {
                        first: item.node.name.first,
                        last: item.node.name.last,
                        full: item.node.name.full,
                        native: item.node.name.native,
                        userPreferred: item.node.name.userPreferred,
                    },
                    image: item.node.image.large ?? item.node.image.medium,
                    imageHash: (0, utils_2.getHashFromImage)(item.node.image.large ?? item.node.image.medium),
                }));
                mangaInfo.relations = data.data.Media.relations.edges.map((item) => ({
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
                    image: item.node.coverImage.extraLarge ?? item.node.coverImage.large ?? item.node.coverImage.medium,
                    imageHash: (0, utils_2.getHashFromImage)(item.node.coverImage.extraLarge ?? item.node.coverImage.large ?? item.node.coverImage.medium),
                    color: item.node.coverImage?.color,
                    type: item.node.format,
                    cover: item.node.bannerImage ??
                        item.node.coverImage.extraLarge ??
                        item.node.coverImage.large ??
                        item.node.coverImage.medium,
                    coverHash: (0, utils_2.getHashFromImage)(item.node.bannerImage ??
                        item.node.coverImage.extraLarge ??
                        item.node.coverImage.large ??
                        item.node.coverImage.medium),
                    rating: item.node.meanScore,
                }));
                mangaInfo.chapters = await new _a().findManga(this.provider, {
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
        this.provider = provider || new mangadex_1.default();
    }
};
// (async () => {
//   const ani = new Anilist(new Hianime());
//   const anime = await ani.advancedSearch(undefined, "MANGA", undefined, undefined, undefined, ["POPULARITY_DESC"], undefined, undefined, undefined, undefined, undefined, "KR");
//   console.log(anime.results[0].title);
//   const details = await ani.fetchAnimeInfo(anime.results[0].id);
//   console.log(details.startDate);
//   console.log(details.totalChapters);
//   console.log(details.episodes);
//   // const chapters = await new Anilist.Manga(new MangaReader()).fetchChaptersList(anime.results[0].id);
//   // console.log(chapters);
//   // const pages = await new Anilist.Manga(new MangaReader()).fetchChapterPages(chapters[0].id);
//   // console.log(pages);
// })();
exports.default = Anilist;
//# sourceMappingURL=anilist.js.map