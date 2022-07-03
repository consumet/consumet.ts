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
/**
 * @deprecated
 * working on it...
 */
class NineAnime extends models_1.AnimeParser {
    constructor() {
        super(...arguments);
        this.name = '9Anime';
        this.baseUrl = 'https://9anime.to';
        this.logo = 'https://d1nxzqpcg2bym0.cloudfront.net/google_play/com.my.nineanime/87b2fe48-9c36-11eb-8292-21241b1c199b/128x128';
        this.classPath = 'ANIME.NineAnime';
        this.isWorking = false;
        this.base64 = 'c/aUAorINHBLxWTy3uRiPt8J+vjsOheFG1E0q2X9CYwDZlnmd4Kb5M6gSVzfk7pQ';
    }
    search(query, page = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchResult = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            // MAKE VRF
            try {
                console.log(`query: ${query}, vrf: ${(0, ascii_url_encoder_1.encode)(this.getVrf(query))}`);
                const res = yield axios_1.default.get(`${this.baseUrl}/search?keyword=${query}&vrf=iH2V6sFT0eKhzLoOKqxQ%2B&page=${page}`);
                const $ = (0, cheerio_1.load)(res.data);
                searchResult.hasNextPage =
                    $(`div.anime-pagination > div.ap_-nav`).children().length > 0
                        ? $('div.anime-pagination > div > div.ap__-btn.ap__-btn-next > a')
                            ? $('div.anime-pagination > div > div.ap__-btn.ap__-btn-next > a').hasClass('disabled')
                                ? false
                                : true
                            : false
                        : false;
                $('.anime-list > li').each((i, el) => {
                    var _a, _b;
                    const taglist = $(el)
                        .find('a:nth-child(1) > div:nth-child(3) > span')
                        .map((i, el) => $(el).text())
                        .toArray();
                    if (!taglist.includes('dub'))
                        taglist.unshift('sub');
                    searchResult.results.push({
                        id: (_a = $(el).find('a:nth-child(1)').attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[2],
                        title: $(el).find('a:nth-child(2)').text(),
                        url: `${this.baseUrl}${$(el).find('a:nth-child(2)').attr('href')}`,
                        image: $(el).find('a:nth-child(1) > img').attr('src'),
                        subOrDub: taglist.includes('sub') ? models_1.SubOrSub.SUB : models_1.SubOrSub.DUB,
                        taglist: taglist,
                        status: (_b = $(el).find('a:nth-child(1) > div:nth-child(2)').text().split('Ep')[1]) === null || _b === void 0 ? void 0 : _b.trim(),
                    });
                });
                return searchResult;
            }
            catch (err) {
                console.error(err);
                throw new Error(err.message);
            }
        });
    }
    fetchAnimeInfo(animeUrl) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            if (!animeUrl.startsWith(this.baseUrl))
                animeUrl = `${this.baseUrl}/watch/${animeUrl}`;
            const animeInfo = {
                id: '',
                title: '',
                url: animeUrl,
                genres: [],
                episodes: [],
            };
            try {
                const res = yield axios_1.default.get(animeUrl);
                const $ = (0, cheerio_1.load)(res.data);
                animeInfo.id = new URL(animeUrl).pathname.split('/')[2];
                animeInfo.title = $('h2.film-name').text();
                animeInfo.japaneseTitle = $('h2.film-name').attr('data-jname');
                animeInfo.genres = Array.from($('.col1 > div:nth-child(5) > div:nth-child(2) > a').map((i, el) => $(el).text()));
                animeInfo.image = $('.anime-poster > div:nth-child(1) > img.film-poster-img').attr('src');
                animeInfo.description = (_a = $('.film-description').text()) === null || _a === void 0 ? void 0 : _a.trim();
                animeInfo.type = $('.col1 > div:nth-child(1) > div:nth-child(2) > a:nth-child(1)').text();
                animeInfo.studios = Array.from($('.col1 > div:nth-child(2) > div:nth-child(2)').map((i, el) => {
                    var _a, _b;
                    return {
                        id: (_a = $(el).find('a').attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[2],
                        title: (_b = $(el).text()) === null || _b === void 0 ? void 0 : _b.trim(),
                    };
                }));
                animeInfo.releaseDate = (_b = $('.col1 > div:nth-child(3) > div:nth-child(2) > span:nth-child(1)')
                    .text()
                    .trim()
                    .split('to')[0]) === null || _b === void 0 ? void 0 : _b.trim();
                animeInfo.status = models_1.MediaStatus.UNKNOWN;
                switch ((_c = $('.col1 > div:nth-child(4) > div:nth-child(2) > span:nth-child(1)').text()) === null || _c === void 0 ? void 0 : _c.trim()) {
                    case 'Airing':
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
                animeInfo.score = parseFloat($('.col2 > div:nth-child(1) > div:nth-child(2) > span:nth-child(1)').text());
                animeInfo.premiered = $('.col2 > div:nth-child(2) > div:nth-child(2) > span:nth-child(1)').text();
                animeInfo.duration = $('.col2 > div:nth-child(3) > div:nth-child(2) > span:nth-child(1)').text();
                animeInfo.quality = $('.col2 > div:nth-child(4) > div:nth-child(2) > span:nth-child(1)').text();
                animeInfo.views = parseInt($('.col2 > div:nth-child(5) > div:nth-child(2) > span:nth-child(1)')
                    .text()
                    .split(',')
                    .join(''));
                animeInfo.otherNames = $('.alias')
                    .text()
                    .split(',')
                    .map((name) => name === null || name === void 0 ? void 0 : name.trim());
                animeInfo.totalEpisodes = parseInt((_d = $('li.ep-page-item').last().text().split('-')[1]) === null || _d === void 0 ? void 0 : _d.trim());
                (_e = animeInfo.episodes) === null || _e === void 0 ? void 0 : _e.push(...Array.from($('section.block_area:nth-child(3) > div:nth-child(2) > div.episodes-ul').map((i, el) => {
                    return $(el)
                        .find('a')
                        .map((i, el) => {
                        var _a, _b, _c;
                        return {
                            id: (_a = $(el).attr('data-id')) === null || _a === void 0 ? void 0 : _a.toString(),
                            number: parseInt((_b = $(el).attr('data-number')) === null || _b === void 0 ? void 0 : _b.toString()),
                            title: (_c = $(el).attr('title')) === null || _c === void 0 ? void 0 : _c.toString(),
                            url: `${this.baseUrl}${$(el).attr('href')}`,
                        };
                    })
                        .toArray();
                })));
                return animeInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
    }
    fetchEpisodeSources(episodeLink) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    fetchEpisodeServers(episodeLink) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    getVrf(query) {
        const vrf = this.cypher((0, ascii_url_encoder_1.encode)(query) + '0000000')
            .substring(0, 6)
            .substring(0, 4)
            .split('')
            .reverse()
            .join('');
        return vrf + this.cypher(this.cypherK(vrf, (0, ascii_url_encoder_1.encode)(query))).replace(/=/g, '');
    }
    cypher(query) {
        if (query.length >= 256)
            throw new Error('Query too long');
        let res = '';
        for (let i = 0; i < query.length; i += 3) {
            const arr = Array(4).fill(-1);
            arr[0] = query.charCodeAt(i) >> 2;
            arr[1] = (query.charCodeAt(i) & 3) << 4;
            if (i + 1 < query.length) {
                arr[1] |= query.charCodeAt(i + 1) >> 4;
                arr[2] = (query.charCodeAt(i + 1) & 15) << 2;
            }
            if (i + 2 < query.length) {
                arr[2] |= query.charCodeAt(i + 2) >> 6;
                arr[3] = query.charCodeAt(i + 2) & 63;
            }
            for (let j = 0; j < 4; j++) {
                if (arr[j] === -1)
                    res += '=';
                else
                    res += this.base64.charAt(arr[j]);
            }
        }
        return res;
    }
    // todo
    cypherV2(query) {
        let res = '';
        for (const i of this.base64) {
            const s = (parseInt(i.padEnd(6, '0')) >>> 0).toString(2).padStart(6, '0');
            if (s.length < 6) {
                res += s;
            }
            else {
                res += (parseInt(i) >>> 0).toString(2);
            }
        }
        return res;
    }
    cypherK(res, query) {
        const arr = Array(256).fill(-1);
        let result = '';
        let i = 0;
        let t = 0;
        for (let j = 0; j < 256; j++) {
            i = (i + arr[j] + res.charCodeAt(j % res.length)) % 256;
            t = arr[j];
            arr[j] = arr[i];
            arr[i] = t;
        }
        i = 0;
        let a = 0;
        for (let k = 0; k < query.length; k++) {
            a = (a + a) % 256;
            i = (i + arr[a]) % 256;
            t = arr[a];
            arr[a] = arr[i];
            arr[i] = t;
            result += String.fromCharCode(query.charCodeAt(k) ^ arr[(arr[i] + arr[a]) % 256]);
        }
        return result;
    }
}
exports.default = NineAnime;
//# sourceMappingURL=9anime.js.map