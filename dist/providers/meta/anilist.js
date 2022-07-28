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
class Anilist extends models_1.AnimeParser {
    /**
     * This class maps anilist to kitsu, and anime provider
     * @param provider anime provider (optional) default: Gogoanime
     */
    constructor(provider) {
        super();
        this.name = 'AnilistWithKitsu';
        this.baseUrl = 'https://anilist.co/';
        this.logo = 'https://upload.wikimedia.org/wikipedia/commons/6/61/AniList_logo.svg';
        this.classPath = 'META.Anilist';
        this.anilistGraphqlUrl = 'https://graphql.anilist.co';
        this.kitsuGraphqlUrl = 'https://kitsu.io/api/graphql';
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
                    results: data.data.Page.media.map((item) => ({
                        id: item.id.toString(),
                        title: {
                            romaji: item.title.romaji,
                            english: item.title.english,
                            native: item.title.native,
                            userPreferred: item.title.userPreferred,
                        } || item.title.romaji,
                        image: item.coverImage.large,
                        rating: item.averageScore,
                        releaseDate: item.seasonYear,
                    })),
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
            var _a, _b, _c, _d, _e, _f;
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
                const { data } = yield axios_1.default.post(this.anilistGraphqlUrl, options);
                animeInfo.malId = data.data.Media.idMal.toString();
                animeInfo.title = {
                    romaji: data.data.Media.title.romaji,
                    english: data.data.Media.title.english,
                    native: data.data.Media.title.native,
                    userPreferred: data.data.Media.title.userPreferred,
                };
                animeInfo.image =
                    (_b = (_a = data.data.Media.coverImage.large) !== null && _a !== void 0 ? _a : data.data.Media.coverImage.medium) !== null && _b !== void 0 ? _b : data.data.Media.coverImage.small;
                animeInfo.cover = (_c = data.data.Media.bannerImage) !== null && _c !== void 0 ? _c : animeInfo.image;
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
                animeInfo.rating = data.data.Media.averageScore;
                animeInfo.duration = data.data.Media.duration;
                animeInfo.genres = data.data.Media.genres;
                animeInfo.studios = data.data.Media.studios.edges.map((item) => item.node.name);
                animeInfo.subOrDub = dub ? models_1.SubOrSub.DUB : models_1.SubOrSub.SUB;
                const possibleAnimeEpisodes = yield this.findAnime({ english: (_d = animeInfo.title) === null || _d === void 0 ? void 0 : _d.english, romaji: (_e = animeInfo.title) === null || _e === void 0 ? void 0 : _e.romaji }, data.data.Media.season, data.data.Media.startDate.year);
                if (possibleAnimeEpisodes) {
                    animeInfo.episodes = possibleAnimeEpisodes;
                    if (this.provider.name === 'Gogoanime' && dub) {
                        animeInfo.episodes = animeInfo.episodes.map((episode) => {
                            const [episodeSlug, episodeNumber] = episode.id.split('-episode-')[0];
                            episode.id = `${episodeSlug.replace(/-movie$/, '')}-dub-episode-${episodeNumber}`;
                            return episode;
                        });
                    }
                }
                animeInfo.episodes = (_f = animeInfo.episodes) === null || _f === void 0 ? void 0 : _f.map((episode) => {
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
            return this.provider.fetchEpisodeSources(episodeId);
        });
        /**
         *
         * @param episodeId Episode id
         */
        this.fetchEpisodeServers = (episodeId) => __awaiter(this, void 0, void 0, function* () {
            return this.provider.fetchEpisodeServers(episodeId);
        });
        this.findAnime = (title, season, startDate) => __awaiter(this, void 0, void 0, function* () {
            title.english = title.english || title.romaji;
            title.romaji = title.romaji || title.english;
            title.english = title.english.toLocaleLowerCase();
            title.romaji = title.romaji.toLocaleLowerCase();
            if (title.english === title.romaji) {
                return yield this.findAnimeSlug(title.english, season, startDate);
            }
            const romajiAnime = this.findAnimeSlug(title.romaji, season, startDate);
            const englishAnime = this.findAnimeSlug(title.english, season, startDate);
            const episodes = yield Promise.all([englishAnime, romajiAnime]).then((r) => r[0].length > 0 ? r[0] : r[1]);
            return episodes;
        });
        this.findAnimeSlug = (title, season, startDate) => __awaiter(this, void 0, void 0, function* () {
            const slug = title.replace(/[^0-9a-zA-Z]+/g, ' ');
            const findAnime = (yield this.provider.search(slug));
            if (findAnime.results.length === 0)
                return [];
            const possibleAnime = (yield this.provider.fetchAnimeInfo(findAnime.results[0].id));
            const possibleProviderEpisodes = possibleAnime.episodes;
            const options = {
                headers: { 'Content-Type': 'application/json' },
                query: (0, utils_1.kitsuSearchQuery)(slug),
            };
            const kitsuEpisodes = yield axios_1.default.post(this.kitsuGraphqlUrl, options);
            const episodesList = new Map();
            if (kitsuEpisodes === null || kitsuEpisodes === void 0 ? void 0 : kitsuEpisodes.data.data) {
                const { nodes } = kitsuEpisodes.data.data.searchAnimeByTitle;
                if (nodes) {
                    nodes.forEach((node) => {
                        var _a, _b;
                        if (node.season === season && node.startDate.trim().split('-')[0] === startDate.toString()) {
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
            if (episodesList.size !== 0 && (possibleProviderEpisodes === null || possibleProviderEpisodes === void 0 ? void 0 : possibleProviderEpisodes.length) !== 0) {
                possibleProviderEpisodes === null || possibleProviderEpisodes === void 0 ? void 0 : possibleProviderEpisodes.forEach((ep, i) => {
                    var _a, _b, _c, _d, _e, _f;
                    const j = (i + 1).toString();
                    newEpisodeList.push({
                        id: ep.id,
                        title: (_b = (_a = episodesList.get(j)) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : null,
                        image: (_d = (_c = episodesList.get(j)) === null || _c === void 0 ? void 0 : _c.thumbnail) !== null && _d !== void 0 ? _d : null,
                        number: ep.number,
                        description: (_f = (_e = episodesList.get(j)) === null || _e === void 0 ? void 0 : _e.description) !== null && _f !== void 0 ? _f : null,
                    });
                });
            }
            return newEpisodeList;
        });
        this.provider = provider || new gogoanime_1.default();
    }
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const provider = new Anilist();
    const anime = yield provider.fetchAnimeInfo('102454');
    console.log(anime);
}))();
exports.default = Anilist;
//# sourceMappingURL=anilist.js.map