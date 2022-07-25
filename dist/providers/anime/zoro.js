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
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const utils_1 = require("../../utils");
class Zoro extends models_1.AnimeParser {
    constructor() {
        super(...arguments);
        this.name = 'Zoro.to';
        this.baseUrl = 'https://zoro.to';
        this.logo = 'https://is3-ssl.mzstatic.com/image/thumb/Purple112/v4/7e/91/00/7e9100ee-2b62-0942-4cdc-e9b93252ce1c/source/512x512bb.jpg';
        this.classPath = 'ANIME.Zoro';
        /**
         * @param query Search query
         * @param page Page number (optional)
         */
        this.search = (query, page = 1) => __awaiter(this, void 0, void 0, function* () {
            const res = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            try {
                const { data } = yield axios_1.default.get(`${this.baseUrl}/search?keyword=${decodeURIComponent(query)}&page=${page}`);
                const $ = (0, cheerio_1.load)(data);
                res.hasNextPage =
                    $('.pagination > li').length > 0
                        ? $('.pagination > li').last().hasClass('active')
                            ? false
                            : true
                        : false;
                $('.film_list-wrap > div.flw-item').each((i, el) => {
                    var _a;
                    const id = (_a = $(el)
                        .find('div:nth-child(1) > a.film-poster-ahref')
                        .attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[1].split('?')[0];
                    const title = $(el).find('div:nth-child(2) > h3:nth-child(1) > a:nth-child(1)').text();
                    // Movie, TV, OVA, ONA, Special, Music
                    const type = $(el).find('div:nth-child(2) > div:nth-child(2) > span:nth-child(1)').text();
                    const image = $(el).find('div:nth-child(1) > img.film-poster-img').attr('data-src');
                    const url = this.baseUrl + $(el).find('div:nth-child(1) > a').last().attr('href');
                    res.results.push({
                        id: id,
                        title: title,
                        type: type,
                        image: image,
                        url: url,
                    });
                });
                return res;
            }
            catch (err) {
                throw new Error(err);
            }
        });
        /**
         * @param id Anime id
         */
        this.fetchAnimeInfo = (id) => __awaiter(this, void 0, void 0, function* () {
            const info = {
                id: id,
                title: '',
            };
            try {
                const { data } = yield axios_1.default.get(`${this.baseUrl}/watch/${id}`);
                const $ = (0, cheerio_1.load)(data);
                info.title = $('h2.film-name > a.text-white').text();
                info.image = $('img.film-poster-img').attr('src');
                info.description = $('div.film-description').text().trim();
                // Movie, TV, OVA, ONA, Special, Music
                info.type = $('span.item').last().prev().prev().text();
                info.url = `${this.baseUrl}/${id}`;
                const episodesAjax = yield axios_1.default.get(`${this.baseUrl}/ajax/v2/episode/list/${id.split('-').pop()}`, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        Referer: `${this.baseUrl}/watch/${id}`,
                    },
                });
                const $$ = (0, cheerio_1.load)(episodesAjax.data.html);
                info.totalEpisodes = $$('div.detail-infor-content > div > a').length;
                info.episodes = [];
                $$('div.detail-infor-content > div > a').each((i, el) => {
                    var _a, _b, _c;
                    const episodeId = (_b = (_a = $$(el).attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[2]) === null || _b === void 0 ? void 0 : _b.replace('?ep=', '$episode$');
                    const number = parseInt($$(el).attr('data-number'));
                    const title = $$(el).attr('title');
                    const url = this.baseUrl + $$(el).attr('href');
                    const isFiller = $$(el).hasClass('ssl-item-filler');
                    (_c = info.episodes) === null || _c === void 0 ? void 0 : _c.push({
                        id: episodeId,
                        number: number,
                        title: title,
                        isFiller: isFiller,
                        url: url,
                    });
                });
                return info;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        /**
         *
         * @param episodeId Episode id
         */
        this.fetchEpisodeSources = (episodeId, server = models_1.StreamingServers.VidCloud) => __awaiter(this, void 0, void 0, function* () {
            if (episodeId.startsWith('http')) {
                const serverUrl = new URL(episodeId);
                switch (server) {
                    case models_1.StreamingServers.VidCloud:
                        return Object.assign({ headers: { Referer: serverUrl.href } }, (yield new utils_1.VidCloud().extract(serverUrl, true)));
                }
            }
            if (!episodeId.includes('$episode$'))
                throw new Error('Invalid episode id');
            episodeId = `${this.baseUrl}/watch/${episodeId.replace('$episode$', '?ep=')}`;
            try {
                const { data } = yield axios_1.default.get(`${this.baseUrl}/ajax/v2/episode/servers?episodeId=${episodeId.split('?ep=')[1]}`, {
                    headers: {
                        Referer: episodeId,
                    },
                });
                const $ = (0, cheerio_1.load)(data.html);
                /**
                 * vidtreaming -> 4
                 * vidcloud -> 1
                 * streamsb -> 5
                 * streamtape -> 3
                 */
                let serverId = '';
                switch (server) {
                    case models_1.StreamingServers.VidCloud:
                        serverId = $('div.ps_-block.ps_-block-sub.servers-sub > div.ps__-list > div')
                            .map((i, el) => ($(el).attr('data-server-id') == '1' ? $(el) : null))
                            .get()[0]
                            .attr('data-id');
                        if (!serverId)
                            throw new Error('VidCloud not found');
                        break;
                }
                const { data: { link }, } = yield axios_1.default.get(`${this.baseUrl}/ajax/v2/episode/sources?id=${serverId}`);
                return yield this.fetchEpisodeSources(link, server);
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        /**
         * @deprecated
         * @param episodeId Episode id
         */
        this.fetchEpisodeServers = (episodeId) => {
            throw new Error('Method not implemented.');
        };
    }
}
exports.default = Zoro;
//# sourceMappingURL=zoro.js.map