"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
class Anix extends models_1.AnimeParser {
    constructor() {
        super(...arguments);
        this.name = 'Anix';
        this.baseUrl = 'https://anix.sh';
        this.logo = 'https://anix.sh/img/logo.png';
        this.classPath = 'ANIME.Anix';
        this.requestedWith = 'XMLHttpRequest';
        /**
         * @param page page number (optional)
         * @param type type of media. (optional) (default `1`) `1`: Japanese with subtitles, `2`: english/dub with no subtitles, `3`: chinese with english subtitles
         */
        this.fetchRecentEpisodes = async (page = 1) => {
            try {
                const res = await this.client.get(`${this.baseUrl}/filter?status[]=${models_1.MediaStatus.ONGOING}&status[]=${models_1.MediaStatus.COMPLETED}&sort=recently_updated&page=${page}`);
                const $ = (0, cheerio_1.load)(res.data);
                const recentEpisodes = [];
                $('.basic.ani.content-item .piece').each((i, el) => {
                    const poster = $(el).find('a.poster');
                    const url = $(poster).attr('href');
                    const episodeNum = parseFloat($(el).find('.sub').text());
                    const type = $(el).find('.type.dot').text();
                    let finalType = models_1.MediaFormat.TV;
                    switch (type) {
                        case 'ONA':
                            finalType = models_1.MediaFormat.ONA;
                            break;
                        case 'Movie':
                            finalType = models_1.MediaFormat.MOVIE;
                            break;
                        case 'OVA':
                            finalType = models_1.MediaFormat.OVA;
                            break;
                        case 'Special':
                            finalType = models_1.MediaFormat.SPECIAL;
                            break;
                        case 'Music':
                            finalType = models_1.MediaFormat.MUSIC;
                            break;
                        case 'PV':
                            finalType = models_1.MediaFormat.PV;
                            break;
                        case 'TV Special':
                            finalType = models_1.MediaFormat.TV_SPECIAL;
                    }
                    recentEpisodes.push({
                        id: url === null || url === void 0 ? void 0 : url.split('/')[2],
                        episodeId: `ep-${episodeNum}`,
                        episodeNumber: episodeNum,
                        title: $(el).find('.d-title').text(),
                        englishTitle: $(el).find('.d-title').attr('data-en'),
                        image: $(poster).find('img').attr('src'),
                        url: `${this.baseUrl.trim()}${url === null || url === void 0 ? void 0 : url.trim()}`,
                        type: finalType,
                    });
                });
                const hasNextPage = !$('.pagination li').last().hasClass('active');
                return {
                    currentPage: page,
                    hasNextPage: hasNextPage,
                    results: recentEpisodes,
                };
            }
            catch (err) {
                throw new Error('Something went wrong. Please try again later.');
            }
        };
        /**
         * @param query Search query
         */
        this.search = async (query, page = 1) => {
            try {
                const res = await this.client.get(`${this.baseUrl}/filter?keyword=${query}&page=${page}`);
                const $ = (0, cheerio_1.load)(res.data);
                let hasNextPage = $('.pagination').length > 0;
                if (hasNextPage) {
                    hasNextPage = !$('.pagination li').last().hasClass('active');
                }
                const searchResult = {
                    currentPage: page,
                    hasNextPage: hasNextPage,
                    results: [],
                };
                $('.basic.ani.content-item .piece').each((i, el) => {
                    const poster = $(el).find('a.poster');
                    const url = $(poster).attr('href');
                    const type = $(el).find('.type.dot').text();
                    let finalType = models_1.MediaFormat.TV;
                    switch (type) {
                        case 'ONA':
                            finalType = models_1.MediaFormat.ONA;
                            break;
                        case 'Movie':
                            finalType = models_1.MediaFormat.MOVIE;
                            break;
                        case 'OVA':
                            finalType = models_1.MediaFormat.OVA;
                            break;
                        case 'Special':
                            finalType = models_1.MediaFormat.SPECIAL;
                            break;
                        case 'Music':
                            finalType = models_1.MediaFormat.MUSIC;
                            break;
                        case 'PV':
                            finalType = models_1.MediaFormat.PV;
                            break;
                        case 'TV Special':
                            finalType = models_1.MediaFormat.TV_SPECIAL;
                    }
                    searchResult.results.push({
                        id: url === null || url === void 0 ? void 0 : url.split('/')[2],
                        title: $(el).find('.d-title').text(),
                        englishTitle: $(el).find('.d-title').attr('data-en'),
                        image: $(poster).find('img').attr('src'),
                        url: `${this.baseUrl.trim()}${url === null || url === void 0 ? void 0 : url.trim()}`,
                        type: finalType,
                    });
                });
                return searchResult;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * @param id Anime id
         * @param page Page number
         */
        this.fetchAnimeInfo = async (id) => {
            var _a, _b, _c, _d;
            const url = `${this.baseUrl}/anime/${id}/ep-1`;
            try {
                const res = await this.client.get(url);
                const $ = (0, cheerio_1.load)(res.data);
                const animeInfo = {
                    id: id,
                    title: (_a = $('.ani-data .maindata .ani-name.d-title')) === null || _a === void 0 ? void 0 : _a.text().trim(),
                    englishTitle: (_c = (_b = $('.ani-data .maindata .ani-name.d-title')) === null || _b === void 0 ? void 0 : _b.attr('data-en')) === null || _c === void 0 ? void 0 : _c.trim(),
                    url: `${this.baseUrl}/anime/${id}`,
                    image: (_d = $('.ani-data .poster img')) === null || _d === void 0 ? void 0 : _d.attr('src'),
                    description: $('.ani-data .maindata .description .cts-block div').text().trim(),
                    episodes: [],
                };
                $('.episodes .ep-range').each((i, el) => {
                    $(el)
                        .find('div')
                        .each((i, el) => {
                        var _a, _b, _c;
                        (_a = animeInfo.episodes) === null || _a === void 0 ? void 0 : _a.push({
                            id: (_b = $(el).find('a').attr('href')) === null || _b === void 0 ? void 0 : _b.split('/')[3],
                            number: parseFloat($(el).find(`a`).text()),
                            url: `${this.baseUrl}${(_c = $(el).find(`a`).attr('href')) === null || _c === void 0 ? void 0 : _c.trim()}`,
                        });
                    });
                });
                const metaData = { status: '', type: '' };
                $('.metadata .limiter div').each((i, el) => {
                    var _a;
                    const text = $(el).text().trim();
                    if (text.includes('Genre: ')) {
                        $(el)
                            .find('span a')
                            .each((i, el) => {
                            if (animeInfo.genres == undefined) {
                                animeInfo.genres = [];
                            }
                            animeInfo.genres.push($(el).attr('title'));
                        });
                    }
                    else if (text.includes('Status: ')) {
                        metaData.status = text.replace('Status: ', '');
                    }
                    else if (text.includes('Type: ')) {
                        metaData.type = text.replace('Type: ', '');
                    }
                    else if (text.includes('Episodes: ')) {
                        animeInfo.totalEpisodes = (_a = parseFloat(text.replace('Episodes: ', ''))) !== null && _a !== void 0 ? _a : undefined;
                    }
                    else if (text.includes('Country: ')) {
                        animeInfo.countryOfOrigin = text.replace('Country: ', '');
                    }
                });
                animeInfo.status = models_1.MediaStatus.UNKNOWN;
                switch (metaData.status) {
                    case 'Ongoing':
                        animeInfo.status = models_1.MediaStatus.ONGOING;
                        break;
                    case 'Completed':
                        animeInfo.status = models_1.MediaStatus.COMPLETED;
                        break;
                }
                animeInfo.type = models_1.MediaFormat.TV;
                switch (metaData.type) {
                    case 'ONA':
                        animeInfo.type = models_1.MediaFormat.ONA;
                        break;
                    case 'Movie':
                        animeInfo.type = models_1.MediaFormat.MOVIE;
                        break;
                    case 'OVA':
                        animeInfo.type = models_1.MediaFormat.OVA;
                        break;
                    case 'Special':
                        animeInfo.type = models_1.MediaFormat.SPECIAL;
                        break;
                    case 'Music':
                        animeInfo.type = models_1.MediaFormat.MUSIC;
                        break;
                    case 'PV':
                        animeInfo.type = models_1.MediaFormat.PV;
                        break;
                    case 'TV Special':
                        animeInfo.type = models_1.MediaFormat.TV_SPECIAL;
                }
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
        this.fetchEpisodeSources = async (episodeId) => {
            throw new Error('Method not implemented.');
        };
        /**
         *
         * @param episodeId Episode id
         */
        this.fetchEpisodeServers = (episodeId) => {
            throw new Error('Method not implemented.');
        };
    }
}
exports.default = Anix;
//# sourceMappingURL=anix.js.map