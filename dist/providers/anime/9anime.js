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
const cheerio_1 = require("cheerio");
const axios_1 = __importDefault(require("axios"));
const ascii_url_encoder_1 = require("ascii-url-encoder");
const models_1 = require("../../models");
const utils_1 = require("../../utils");
/**
 * **Use at your own risk :)** 9anime devs keep changing the keys every week
 */
class NineAnime extends models_1.AnimeParser {
    constructor() {
        super(...arguments);
        this.name = '9Anime';
        this.baseUrl = 'https://9anime.to';
        this.logo = 'https://d1nxzqpcg2bym0.cloudfront.net/google_play/com.my.nineanime/87b2fe48-9c36-11eb-8292-21241b1c199b/128x128';
        this.classPath = 'ANIME.NineAnime';
        this.table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        this.cipherKey = '';
        this.decipherKey = '';
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const { data: { cipher, decipher }, } = yield axios_1.default.get('https://raw.githubusercontent.com/chenkaslowankiya/BruvFlow/main/keys.json');
            this.cipherKey = cipher;
            this.decipherKey = decipher;
        });
    }
    static create() {
        return __awaiter(this, void 0, void 0, function* () {
            const nineanime = new NineAnime();
            yield nineanime.init();
            return nineanime;
        });
    }
    search(query, page = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchResult = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            try {
                const res = yield axios_1.default.get(`${this.baseUrl.replace('.to', '.id')}/filter?keyword=${(0, ascii_url_encoder_1.encode)(query).replace(/%20/g, '+')}&vrf=${(0, ascii_url_encoder_1.encode)(this.ev(query))}&page=${page}`);
                const $ = (0, cheerio_1.load)(res.data);
                searchResult.hasNextPage =
                    $(`ul.pagination`).length > 0
                        ? $('ul.pagination > li').last().hasClass('disabled')
                            ? false
                            : true
                        : false;
                $('#list-items > div.item').each((i, el) => {
                    var _a;
                    const subs = $(el)
                        .find('div.ani > a > div.meta > div > div.left > span.ep-status')
                        .map((i, el) => {
                        if ($(el).hasClass('sub')) {
                            return models_1.SubOrSub.SUB;
                        }
                        else if ($(el).hasClass('dub')) {
                            return models_1.SubOrSub.DUB;
                        }
                    })
                        .get();
                    searchResult.results.push({
                        id: (_a = $(el).find('div > div.ani > a').attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[2],
                        title: $(el).find('div > div.info > div.b1 > a').text(),
                        url: `${this.baseUrl}${$(el).find('div > div.ani > a').attr('href')}`,
                        image: $(el).find('div > div.ani > a > img').attr('src'),
                        subOrSub: subs.includes(models_1.SubOrSub.SUB) && subs.includes(models_1.SubOrSub.DUB) ? models_1.SubOrSub.BOTH : subs[0],
                        type: $(el).find('div > div.ani > a > div.meta > div > div.right').text(),
                    });
                });
                return searchResult;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
    }
    fetchAnimeInfo(animeUrl, isDub = false) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            if (!animeUrl.startsWith(this.baseUrl.replace('.to', '.id')))
                animeUrl = `${this.baseUrl.replace('.to', '.id')}/watch/${animeUrl}`;
            const animeInfo = {
                id: '',
                title: '',
                url: animeUrl,
            };
            try {
                const res = yield axios_1.default.get(animeUrl);
                const $ = (0, cheerio_1.load)(res.data);
                animeInfo.id = new URL(animeUrl).pathname.split('/')[2];
                animeInfo.title = $('h1.title').text();
                animeInfo.jpTitle = $('h1.title').attr('data-jp');
                animeInfo.genres = Array.from($('div.meta:nth-child(1) > div:nth-child(5) > span > a').map((i, el) => $(el).text()));
                animeInfo.image = $('.binfo > div.poster > span > img').attr('src');
                animeInfo.description = (_a = $('.content').text()) === null || _a === void 0 ? void 0 : _a.trim();
                animeInfo.type = $('div.meta:nth-child(1) > div:nth-child(1) > span:nth-child(1) > a').text();
                animeInfo.studios = Array.from($('div.meta:nth-child(1) > div:nth-child(2) > span:nth-child(1) > a').map((i, el) => {
                    var _a, _b;
                    return {
                        id: (_a = $(el).attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[2],
                        title: (_b = $(el).text()) === null || _b === void 0 ? void 0 : _b.trim(),
                    };
                }));
                animeInfo.releaseDate = (_b = $('div.meta:nth-child(1) > div:nth-child(3) > span:nth-child(1)')
                    .text()
                    .trim()
                    .split('to')[0]) === null || _b === void 0 ? void 0 : _b.trim();
                switch ((_c = $('div.meta:nth-child(1) > div:nth-child(4) > span:nth-child(1)').text()) === null || _c === void 0 ? void 0 : _c.trim()) {
                    case 'Releasing':
                        animeInfo.status = models_1.MediaStatus.ONGOING;
                        break;
                    case 'Completed':
                        animeInfo.status = models_1.MediaStatus.COMPLETED;
                        break;
                    case 'Cancelled':
                        animeInfo.status = models_1.MediaStatus.CANCELLED;
                        break;
                    case 'Unknown':
                        animeInfo.status = models_1.MediaStatus.UNKNOWN;
                        break;
                    default:
                        animeInfo.status = models_1.MediaStatus.UNKNOWN;
                        break;
                }
                animeInfo.score = parseFloat((_d = $('.bmeta > div:nth-child(2) > div:nth-child(2) > span:nth-child(1)')) === null || _d === void 0 ? void 0 : _d.text().split('by')[0]);
                animeInfo.premiered = $('.bmeta > div:nth-child(2) > div:nth-child(3) > span:nth-child(1) > a:nth-child(1)').text();
                animeInfo.duration = $('.bmeta > div:nth-child(2) > div:nth-child(4) > span:nth-child(1)').text();
                animeInfo.views = parseInt($('.bmeta > div:nth-child(2) > div:nth-child(5) > span:nth-child(1)')
                    .text()
                    .split('by')
                    .join('')
                    .split(',')
                    .join('')
                    .trim());
                animeInfo.otherNames = $('.names')
                    .text()
                    .split('; ')
                    .map(name => name === null || name === void 0 ? void 0 : name.trim());
                const id = $('#watch-main').attr('data-id');
                const { data: { result }, } = yield axios_1.default.get(`${this.baseUrl.replace('.to', '.id')}/ajax/episode/list/${id}?vrf=${(0, ascii_url_encoder_1.encode)(this.ev(id))}`);
                const $$ = (0, cheerio_1.load)(result);
                animeInfo.totalEpisodes = $$('div.episodes > ul > li > a').length;
                animeInfo.episodes = [];
                (_e = animeInfo.episodes) === null || _e === void 0 ? void 0 : _e.push(...$$('div.episodes > ul > li > a').map((i, el) => {
                    return $$(el)
                        .map((i, el) => {
                        var _a, _b, _c;
                        const possibleIds = (_a = $$(el).attr('data-ids')) === null || _a === void 0 ? void 0 : _a.split(',');
                        const id = (_b = possibleIds[isDub ? 1 : 0]) !== null && _b !== void 0 ? _b : possibleIds[0];
                        const number = parseInt((_c = $$(el).attr('data-num')) === null || _c === void 0 ? void 0 : _c.toString());
                        const title = $$(el).find('span').text().length > 0 ? $$(el).find('span').text() : undefined;
                        const isFiller = $$(el).hasClass('filler');
                        return {
                            id: id,
                            number: number,
                            title: title,
                            isFiller: isFiller,
                            url: `${this.baseUrl.replace('.to', '.id')}/ajax/server/list/${id}?vrf=${this.ev(id)}`,
                        };
                    })
                        .get();
                }));
                return animeInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
    }
    fetchEpisodeSources(episodeId, server = models_1.StreamingServers.VizCloud) {
        return __awaiter(this, void 0, void 0, function* () {
            if (episodeId.startsWith('http')) {
                const serverUrl = new URL(episodeId);
                switch (server) {
                    case models_1.StreamingServers.StreamTape:
                        return {
                            headers: { Referer: serverUrl.href, 'User-Agent': utils_1.USER_AGENT },
                            sources: yield new utils_1.StreamTape().extract(serverUrl),
                        };
                    case models_1.StreamingServers.VizCloud:
                        return {
                            headers: { Referer: serverUrl.href, 'User-Agent': utils_1.USER_AGENT },
                            sources: yield new utils_1.VizCloud().extract(serverUrl, this.cipher, this.encrypt),
                        };
                    case models_1.StreamingServers.MyCloud:
                        return {
                            headers: { Referer: serverUrl.href, 'User-Agent': utils_1.USER_AGENT },
                            sources: yield new utils_1.VizCloud().extract(serverUrl, this.cipher, this.encrypt),
                        };
                }
            }
            try {
                const servers = yield this.fetchEpisodeServers(episodeId);
                let s = servers.find(s => s.name === server);
                switch (server) {
                    case models_1.StreamingServers.VizCloud:
                        s = servers.find(s => s.name === 'vidstream');
                        if (!s)
                            throw new Error('Vidstream server found');
                        break;
                    case models_1.StreamingServers.StreamTape:
                        s = servers.find(s => s.name === 'streamtape');
                        if (!s)
                            throw new Error('Streamtape server found');
                        break;
                    case models_1.StreamingServers.MyCloud:
                        s = servers.find(s => s.name === 'mycloud');
                        if (!s)
                            throw new Error('Mycloud server found');
                        break;
                    default:
                        throw new Error('Server not found');
                }
                const { data: { result: { url }, }, } = yield axios_1.default.get(s.url);
                const iframe = (0, ascii_url_encoder_1.decode)(this.dv(url));
                return yield this.fetchEpisodeSources(iframe, server);
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
    }
    fetchEpisodeServers(episodeId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!episodeId.startsWith(this.baseUrl.replace('.to', '.id')))
                episodeId = `${this.baseUrl.replace('.to', '.id')}/ajax/server/list/${episodeId}?vrf=${this.ev(episodeId)}`;
            const { data: { result }, } = yield axios_1.default.get(episodeId);
            const $ = (0, cheerio_1.load)(result);
            const servers = [];
            $('.type > ul > li').each((i, el) => {
                const serverId = $(el).attr('data-link-id');
                servers.push({
                    name: $(el).text().toLocaleLowerCase(),
                    url: `${this.baseUrl.replace('.to', '.id')}/ajax/server/${serverId}?vrf=${(0, ascii_url_encoder_1.encode)(this.ev(serverId))}`,
                });
            });
            return servers;
        });
    }
    ev(query) {
        return this.encrypt(this.cipher((0, ascii_url_encoder_1.encode)(query), this.cipherKey), this.table);
    }
    dv(query) {
        return this.cipher(this.decrypt(query), this.decipherKey);
    }
    cipher(query, key) {
        let u = 0;
        let v = 0;
        const arr = (0, utils_1.range)({ from: 0, to: 256 });
        for (let i = 0; i < arr.length; i++) {
            u = (u + arr[i] + key.charCodeAt(i % key.length)) % 256;
            v = arr[i];
            arr[i] = arr[u];
            arr[u] = v;
        }
        u = 0;
        let j = 0;
        let res = '';
        for (let i = 0; i < query.length; i++) {
            j = (j + 1) % 256;
            u = (u + arr[j]) % 256;
            v = arr[j];
            arr[j] = arr[u];
            arr[u] = v;
            res += String.fromCharCode(query.charCodeAt(i) ^ arr[(arr[j] + arr[u]) % 256]);
        }
        return res;
    }
    encrypt(query, key) {
        query.split('').forEach(char => {
            if (char.charCodeAt(0) > 255)
                throw new Error('Invalid character.');
        });
        let res = '';
        for (let i = 0; i < query.length; i += 3) {
            const arr = Array(4).fill(-1);
            arr[0] = query.charCodeAt(i) >> 2;
            arr[1] = (3 & query.charCodeAt(i)) << 4;
            if (query.length > i + 1) {
                arr[1] = arr[1] | (query.charCodeAt(i + 1) >> 4);
                arr[2] = (15 & query.charCodeAt(i + 1)) << 2;
            }
            if (query.length > i + 2) {
                arr[2] = arr[2] | (query.charCodeAt(i + 2) >> 6);
                arr[3] = 63 & query.charCodeAt(i + 2);
            }
            for (const j of arr) {
                if (j === -1)
                    res += '=';
                else if ((0, utils_1.range)({ from: 0, to: 64 }).includes(j))
                    res += key.charAt(j);
            }
        }
        return res;
    }
    decrypt(query) {
        var _a;
        const p = ((_a = query === null || query === void 0 ? void 0 : query.replace(/[\t\n\f\r]/g, '')) === null || _a === void 0 ? void 0 : _a.length) % 4 === 0 ? query === null || query === void 0 ? void 0 : query.replace(/[==|?|$]/g, '') : query;
        if ((p === null || p === void 0 ? void 0 : p.length) % 4 === 1 || /[^+/0-9A-Za-z]/gm.test(p))
            throw new Error('Invalid character.');
        let res = '';
        let i = 0;
        let e = 0;
        let n = 0;
        for (let j = 0; j < (p === null || p === void 0 ? void 0 : p.length); j++) {
            e = e << 6;
            i = this.table.indexOf(p[j]);
            e = e | i;
            n += 6;
            if (n === 24) {
                res += String.fromCharCode((16711680 & e) >> 16);
                res += String.fromCharCode((65280 & e) >> 8);
                res += String.fromCharCode(255 & e);
                n = 0;
                e = 0;
            }
        }
        if (12 === n)
            return res + String.fromCharCode(e >> 4);
        else if (18 === n) {
            e = e >> 2;
            res += String.fromCharCode((65280 & e) >> 8);
            res += String.fromCharCode(255 & e);
        }
        return res;
    }
}
exports.default = NineAnime;
//# sourceMappingURL=9anime.js.map