"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../../models");
/**
 * Work in progress
 */
class Tmdb extends models_1.MovieParser {
    constructor(provider) {
        super();
        this.name = 'Tmbd';
        this.baseUrl = 'https://www.themoviedb.org/';
        this.logo = 'https://img.flixhq.to/xxrz/400x400/100/ab/5f/ab5f0e1996cc5b71919e10e910ad593e/ab5f0e1996cc5b71919e10e910ad593e.png';
        this.classPath = 'MOVIES.Tmbd';
        this.supportedTypes = new Set([models_1.TvType.MOVIE, models_1.TvType.TVSERIES, models_1.TvType.ANIME]);
        this.search = async (query, page = 1) => {
            throw new Error('Method not implemented.');
        };
        this.fetchMediaInfo = async (mediaId) => {
            throw new Error('Not implemented');
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
        this.provider = provider;
    }
}
//# sourceMappingURL=tmdb.js.map