"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../../models");
class Anify extends models_1.AnimeParser {
    constructor() {
        super(...arguments);
        this.name = 'anify';
        this.baseUrl = 'https://api.anify.tv';
        this.classPath = 'ANIME.Anify';
        /**
         * @param query Search query
         * @param page Page number (optional)
         */
        this.rawSearch = async (query, page = 1) => {
            const { data } = await this.client.get(`${this.baseUrl}/search/anime/${query}?page=${page}`);
            return data;
        };
        /**
         * @param query Search query
         * @param page Page number (optional)
         */
        this.search = async (query, page = 1) => {
            const res = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            const { data } = await this.client.get(`${this.baseUrl}/search/anime/${query}?page=${page}`);
            // if (data.currentPage !== res.currentPage) res.hasNextPage = true;
            res.results = data === null || data === void 0 ? void 0 : data.map((anime) => {
                var _a, _b;
                return ({
                    id: anime.id,
                    anilistId: anime.id,
                    title: (_b = (_a = anime.title.english) !== null && _a !== void 0 ? _a : anime.title.romaji) !== null && _b !== void 0 ? _b : anime.title.native,
                    image: anime.coverImage,
                    cover: anime.bannerImage,
                    releaseDate: anime.year,
                    description: anime.description,
                    genres: anime.genres,
                    rating: anime.rating.anilist,
                    status: anime.status,
                    mappings: anime.mappings,
                    type: anime.type,
                });
            });
            return res;
        };
        /**
         * @param id Anime id
         * @param providerId Provider id (optional) default: gogoanime
         */
        this.fetchAnimeInfo = async (id, providerId = 'gogoanime') => {
            var _a, _b;
            const animeInfo = {
                id: id,
                title: '',
            };
            const { data } = await this.client.get(`${this.baseUrl}/info/${id}`).catch(() => {
                throw new Error('Anime not found. Please use a valid id!');
            });
            animeInfo.anilistId = data.mappings.find((m) => m.providerId === 'anilist').id;
            animeInfo.title = (_b = (_a = data.title.english) !== null && _a !== void 0 ? _a : data.title.romaji) !== null && _b !== void 0 ? _b : data.title.native;
            animeInfo.image = data.coverImage;
            animeInfo.cover = data.bannerImage;
            animeInfo.season = data.season;
            animeInfo.releaseDate = data.year;
            animeInfo.duration = data.duration;
            animeInfo.popularity = data.popularity.anilist;
            animeInfo.description = data.description;
            animeInfo.genres = data.genres;
            animeInfo.rating = data.rating.anilist;
            animeInfo.status = data.status;
            animeInfo.synonyms = data.synonyms;
            animeInfo.mappings = data.mappings;
            animeInfo.type = data.type;
            animeInfo.artwork = data.artwork;
            const providerData = data.episodes.data.filter((e) => e.providerId === providerId)[0];
            animeInfo.episodes = providerData.episodes.map((episode) => ({
                id: episode.id,
                number: episode.number,
                isFiller: episode.isFiller,
                title: episode.title,
                description: episode.description,
                image: episode.img,
                rating: episode.rating,
            }));
            return animeInfo;
        };
        this.fetchAnimeInfoByIdRaw = async (id) => {
            const { data } = await this.client.get(`${this.baseUrl}/info/${id}`).catch(err => {
                throw new Error("Backup api seems to be down! Can't fetch anime info");
            });
            return data;
        };
        /**
         * @param id anilist id
         * @param providerId Provider id (optional) default: gogoanime
         */
        this.fetchAnimeInfoByAnilistId = async (id, providerId = 'gogoanime') => {
            var _a, _b;
            const animeInfo = {
                id: id,
                title: '',
            };
            const { data } = await this.client.get(`${this.baseUrl}/mapping/anilist/${id}`).catch(err => {
                throw new Error(err);
            });
            animeInfo.anilistId = data.mappings.find((m) => m.providerId === 'anilist').id;
            animeInfo.title = (_b = (_a = data.title.english) !== null && _a !== void 0 ? _a : data.title.romaji) !== null && _b !== void 0 ? _b : data.title.native;
            animeInfo.image = data.coverImage;
            animeInfo.cover = data.bannerImage;
            animeInfo.season = data.season;
            animeInfo.releaseDate = data.year;
            animeInfo.duration = data.duration;
            animeInfo.popularity = data.popularity.anilist;
            animeInfo.description = data.description;
            animeInfo.genres = data.genres;
            animeInfo.rating = data.rating.anilist;
            animeInfo.status = data.status;
            animeInfo.synonyms = data.synonyms;
            animeInfo.mappings = data.mappings;
            animeInfo.type = data.type;
            animeInfo.artwork = data.artwork;
            const providerData = data.episodes.data.filter((e) => e.providerId === providerId)[0];
            animeInfo.episodes = providerData.episodes.map((episode) => ({
                id: episode.id.split('/').pop().replace('?ep=', '$episode$') + 'sub',
                number: episode.number,
                isFiller: episode.isFiller,
                title: episode.title,
                description: episode.description,
                image: episode.img,
                rating: episode.rating,
            }));
            return animeInfo;
        };
        this.fetchEpisodeSources = async (episodeId, episodeNumber, id) => {
            const { data } = await this.client.get(`${this.baseUrl}/sources?providerId=gogoanime&watchId=${episodeId}&episodeNumber=${episodeNumber}&id=${id}&subType=sub&server=gogocdn`);
            return data;
        };
    }
    /**
     * @deprecated
     */
    fetchEpisodeServers(episodeId) {
        throw new Error('Method not implemented.');
    }
}
// (async () => {
//   const anify = new Anify();
//   const anime = await anify.search('One piece');
//   const info = await anify.fetchAnimeInfo(anime.results[0].id, 'zoro');
//   console.log(info);
// })();
exports.default = Anify;
//# sourceMappingURL=anify.js.map