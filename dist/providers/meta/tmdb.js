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
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../../models");
class Tmdb extends models_1.MovieParser {
    constructor(provider) {
        super();
        this.name = 'Tmbd';
        this.baseUrl = 'https://www.themoviedb.org/';
        this.logo = 'https://img.flixhq.to/xxrz/400x400/100/ab/5f/ab5f0e1996cc5b71919e10e910ad593e/ab5f0e1996cc5b71919e10e910ad593e.png';
        this.classPath = 'MOVIES.FlixHQ';
        this.supportedTypes = new Set([models_1.TvType.MOVIE, models_1.TvType.TVSERIES, models_1.TvType.ANIME]);
        this.search = (query, page = 1) => __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
        this.fetchMediaInfo = (mediaId) => __awaiter(this, void 0, void 0, function* () {
            throw new Error('Not implemented');
        });
        /**
         * @param id media id (anime or movie/tv)
         * @param args optional arguments
         */
        this.fetchEpisodeSources = (id, ...args) => __awaiter(this, void 0, void 0, function* () {
            return this.provider.fetchEpisodeSources(id, ...args);
        });
        /**
         * @param episodeId episode id
         * @param args optional arguments
         **/
        this.fetchEpisodeServers = (episodeId, ...args) => __awaiter(this, void 0, void 0, function* () {
            return this.provider.fetchEpisodeServers(episodeId, ...args);
        });
        this.provider = provider;
    }
}
//# sourceMappingURL=tmdb.js.map