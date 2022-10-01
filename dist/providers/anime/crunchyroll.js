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
class Crunchyroll extends models_1.AnimeParser {
    constructor() {
        super(...arguments);
        this.name = 'Crunchyroll';
        this.baseUrl = 'https://kamyroll.herokuapp.com';
        this.logo = 'https://user-images.githubusercontent.com/65111632/95666535-4f6dba80-0ba6-11eb-8583-e3a2074590e9.png';
        this.classPath = 'ANIME.Crunchyroll';
        this.localeHeader = { locale: 'en-US' };
        this.channelHeader = { channel: 'channel_id' };
        this.user_agent = 'Kamyroll/3.17.0 Android/7.1.2 okhttp/4.9.1';
        this.headers = () => __awaiter(this, void 0, void 0, function* () {
            const { data } = yield (0, axios_1.default)({
                method: 'post',
                url: `${this.baseUrl}/auth/v1/token`,
                data: {
                    refresh_token: 'IV+FtTI+SYR0d5CQy2KOc6Q06S6aEVPIjZdWA6mmO7nDWrMr04cGjSkk4o6urP/6yDmE4yzccSX/rP/OIgDgK4ildzNf2G/pPS9Ze1XbEyJAEUyN+oKT7Gs1PhVTFdz/vYXvxp/oZmLWQGoGgSQLwgoRqnJddWjqk0ageUbgT1FwLazdL3iYYKdNN98BqGFbs/baeqqa8aFre5SzF/4G62y201uLnsElgd07OAh1bnJOy8PTNHpGqEBxxbo1VENqtYilG9ZKY18nEz8vLPQBbin/IIEjKITjSa+LvSDQt/0AaxCkhClNDUX2uUZ8q7fKuSDisJtEyIFDXtuZGFhaaA==',
                    grant_type: 'refresh_token',
                    scope: 'offline_access',
                },
                headers: {
                    'user-agent': this.user_agent,
                    authorization: 'Basic vrvluizpdr2eby+RjSKM17dOLacExxq1HAERdxQDO6+2pHvFHTKKnByPD7b6kZVe1dJXifb6SG5NWMz49ABgJA=',
                },
            });
            return {
                headers: {
                    Authorization: `${data.tokenType} ${data.accessToken}`,
                },
            };
        });
        /**
         * @param query Search query
         */
        this.search = (query) => __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios_1.default.get(`${this.baseUrl}/content/v1/search`, Object.assign({ params: { channelHeader: this.channelHeader, localeHeader: this.localeHeader, query: query, limit: 20 } }, (yield this.headers())));
            console.log(data);
            throw new Error('Method not implemented.');
        });
        /**
         * @param id Anime id
         */
        this.fetchAnimeInfo = (id) => __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
        /**
         *
         * @param episodeId Episode id
         */
        this.fetchEpisodeSources = (episodeId) => __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
        /**
         *
         * @param episodeId Episode id
         */
        this.fetchEpisodeServers = (episodeId) => {
            throw new Error('Method not implemented.');
        };
    }
}
// (async () => {
//   const anime = new Crunchyroll();
//   await anime.search('naruto');
// })();
exports.default = Crunchyroll;
//# sourceMappingURL=crunchyroll.js.map