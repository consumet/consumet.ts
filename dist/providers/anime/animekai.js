"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const utils_1 = require("../../utils");
const { getAnimeKaiToken } = require('../../utils/getAnimeKaiToken');
class AnimeKai extends models_1.AnimeParser {
    constructor(customBaseURL) {
        super(...arguments);
        this.name = 'AnimeKai';
        this.baseUrl = 'https://animekai.to';
        this.logo = 'https://animekai.to/assets/uploads/37585a39fe8c8d8fafaa2c7bfbf5374ecac859ea6a0288a6da2c61f5.png';
        this.classPath = 'ANIME.AnimeKai';
        this.megaUp = new utils_1.MegaUp();
        /**
         * @param id Anime id
         */
        this.fetchAnimeInfo = async (id) => {
            const info = {
                id,
                title: '',
                japaneseTitle: '',
                image: '',
                description: '',
                type: '',
                url: '',
                status: models_1.MediaStatus.UNKNOWN,
                season: '',
                hasSub: false,
                hasDub: false,
                subOrDub: undefined,
                genres: [],
                recommendations: [],
                relations: [],
                episodes: [],
                totalEpisodes: 0,
            };
        
            try {
                const { data } = await this.client.get(`${this.baseUrl}/watch/${id}`, { headers: this.Headers() });
                const $ = cheerio_1.load(data);
        
                // Basic info
                info.title = $('.entity-scroll > .title').text().trim();
                info.japaneseTitle = $('.entity-scroll > .title').attr('data-jp')?.trim() ?? '';
                info.image = $('div.poster > div > img').attr('src') ?? '';
                info.description = $('.entity-scroll > .desc').text().trim();
                info.type = $('.entity-scroll > .info').children().last().text().toUpperCase();
                info.url = `${this.baseUrl}/watch/${id}`;
        
                // Status
                const statusText = $('.entity-scroll > .detail').find("div:contains('Status') > span").text().trim();
                info.status = {
                    'Completed': models_1.MediaStatus.COMPLETED,
                    'Releasing': models_1.MediaStatus.ONGOING,
                    'Not yet aired': models_1.MediaStatus.NOT_YET_AIRED
                }[statusText] ?? models_1.MediaStatus.UNKNOWN;
        
                // Season
                info.season = $('.entity-scroll > .detail').find("div:contains('Premiered') > span").text().trim();
        
                // Sub/Dub info
                const hasSub = $('.entity-scroll > .info > span.sub').length > 0;
                const hasDub = $('.entity-scroll > .info > span.dub').length > 0;
                info.hasSub = hasSub;
                info.hasDub = hasDub;
                info.subOrDub = hasSub && hasDub
                    ? models_1.SubOrSub.BOTH
                    : hasSub
                        ? models_1.SubOrSub.SUB
                        : hasDub
                            ? models_1.SubOrSub.DUB
                            : undefined;
        
                // Genres
                $('.entity-scroll > .detail').find('div:contains("Genres")').each((i, el) => {
                    const genre = $(el).text().replace('Genres:', '').trim();
                    if (genre) info.genres.push(...genre.split(',').map(g => g.trim()));
                });
        
                // Recommendations
                $('section.sidebar-section:not(#related-anime) .aitem-col .aitem').each((i, el) => {
                    const aTag = $(el);
                    const recId = aTag.attr('href')?.replace('/watch/', '');
                    info.recommendations.push({
                        id: recId,
                        title: aTag.find('.title').text().trim(),
                        url: `${this.baseUrl}${aTag.attr('href')}`,
                        image: aTag.attr('style')?.match(/url\(['"]?(.*?)['"]?\)/)?.[1] ?? '',
                        japaneseTitle: aTag.find('.title').attr('data-jp')?.trim(),
                        type: aTag.find('.info').children().last().text().trim(),
                        sub: parseInt(aTag.find('.info span.sub').text()) || 0,
                        dub: parseInt(aTag.find('.info span.dub').text()) || 0,
                        episodes: parseInt(aTag.find('.info').children().eq(-2).text().trim()) || 0,
                    });
                });
        
                // Relations
                $('section#related-anime .tab-body .aitem-col').each((i, el) => {
                    const card = $(el);
                    const aTag = card.find('a.aitem');
                    const relId = aTag.attr('href')?.replace('/watch/', '');
                    info.relations.push({
                        id: relId,
                        title: aTag.find('.title').text().trim(),
                        url: `${this.baseUrl}${aTag.attr('href')}`,
                        image: aTag.attr('style')?.match(/url\(['"]?(.*?)['"]?\)/)?.[1] ?? '',
                        japaneseTitle: aTag.find('.title').attr('data-jp')?.trim(),
                        type: card.find('.info').children().eq(-2).text().trim(),
                        sub: parseInt(card.find('.info span.sub').text()) || 0,
                        dub: parseInt(card.find('.info span.dub').text()) || 0,
                        relationType: card.find('.info').children().last().text().trim(),
                        episodes: parseInt(card.find('.info').children().eq(-3).text()) || 0,
                    });
                });
        
                // Episodes (AJAX)
                const ani_id = $('.rate-box#anime-rating').attr('data-id');
                if (!ani_id) throw new Error('ani_id not found on page');
        
                await this.megaUp.kaicodexReady;
        
                const token = await getAnimeKaiToken(id);
        
                const episodesAjax = await this.client.get(
                    `${this.baseUrl}/ajax/episodes/list?ani_id=${ani_id}&_=${token}`, 
                    {
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            Referer: `${this.baseUrl}/watch/${id}`,
                            ...this.Headers(),
                        },
                    }
                );
        
                if (!episodesAjax.data || episodesAjax.data.status !== 200 || !episodesAjax.data.result) {
                    throw new Error(`Episodes AJAX returned invalid data`);
                }
        
                const $$ = cheerio_1.load(episodesAjax.data.result);
                info.totalEpisodes = $$('div.eplist > ul > li').length;

                $$('div.eplist > ul > li > a').each((i, el) => {
                    const number = parseInt($$(el).attr('num') ?? '0');
                    info.episodes.push({
                        id: `${info.id}$ep=${number}$token=${$$(el).attr('token')}`,
                        number,
                        title: $$(el).children('span').text().trim(),
                        isFiller: $$(el).hasClass('filler'),
                        isSubbed: number <= (parseInt($('.entity-scroll > .info > span.sub').text().trim()) || 0),
                        isDubbed: number <= (parseInt($('.entity-scroll > .info > span.dub').text().trim()) || 0),
                        url: `${this.baseUrl}/watch/${info.id}${$$(el).attr('href')}ep=${number}`,
                    });
                });

                return info;

            } catch (err) {
                throw new Error(`fetchAnimeInfo failed: ${err.message}`);
            }
        };
        /**
         *
         * @param episodeId Episode id
         * @param server server type (default `VidCloud`) (optional)
         * @param subOrDub sub or dub (default `SubOrSub.SUB`) (optional)
         */
        this.fetchEpisodeSources = async (episodeId, server = models_1.StreamingServers.MegaUp, subOrDub = models_1.SubOrSub.SUB) => {
            var _a, _b;
            if (episodeId.startsWith('http')) {
                const serverUrl = new URL(episodeId);
                switch (server) {
                    case models_1.StreamingServers.MegaUp:
                        return {
                            headers: { Referer: serverUrl.href },
                            ...(await new utils_1.MegaUp(this.proxyConfig, this.adapter).extract(serverUrl)),
                            download: serverUrl.href.replace(/\/e\//, '/download/'),
                        };
                    default:
                        return {
                            headers: { Referer: serverUrl.href },
                            ...(await new utils_1.MegaUp(this.proxyConfig, this.adapter).extract(serverUrl)),
                            download: serverUrl.href.replace(/\/e\//, '/download/'),
                        };
                }
            }
            try {
                const servers = await this.fetchEpisodeServers(episodeId, subOrDub);
                const i = servers.findIndex(s => s.name.toLowerCase().includes(server)); //for now only megaup is available, hence directly using it
                if (i === -1) {
                    throw new Error(`Server ${server} not found`);
                }
                const serverUrl = new URL(servers[i].url);
                const sources = await this.fetchEpisodeSources(serverUrl.href, server, subOrDub);
                sources.intro = (_a = servers[i]) === null || _a === void 0 ? void 0 : _a.intro;
                sources.outro = (_b = servers[i]) === null || _b === void 0 ? void 0 : _b.outro;
                return sources;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * @param url string
         */
        this.scrapeCardPage = async (url) => {
            var _a, _b;
            try {
                const res = {
                    currentPage: 0,
                    hasNextPage: false,
                    totalPages: 0,
                    results: [],
                };
                const { data } = await this.client.get(url, {
                    headers: this.Headers(),
                });
                const $ = (0, cheerio_1.load)(data);
                const pagination = $('ul.pagination');
                res.currentPage = parseInt(pagination.find('.page-item.active span.page-link').text().trim()) || 0;
                const nextPage = (_a = pagination
                    .find('.page-item.active')
                    .next()
                    .find('a.page-link')
                    .attr('href')) === null || _a === void 0 ? void 0 : _a.split('page=')[1];
                if (nextPage != undefined && nextPage != '') {
                    res.hasNextPage = true;
                }
                const totalPages = (_b = pagination.find('.page-item:last-child a.page-link').attr('href')) === null || _b === void 0 ? void 0 : _b.split('page=')[1];
                if (totalPages === undefined || totalPages === '') {
                    res.totalPages = res.currentPage;
                }
                else {
                    res.totalPages = parseInt(totalPages) || 0;
                }
                res.results = await this.scrapeCard($);
                if (res.results.length === 0) {
                    res.currentPage = 0;
                    res.hasNextPage = false;
                    res.totalPages = 0;
                }
                return res;
            }
            catch (err) {
                throw new Error('Something went wrong. Please try again later.');
            }
        };
        /**
         * @param $ cheerio instance
         */
        this.scrapeCard = async ($) => {
            try {
                const results = [];
                $('.aitem').each((i, ele) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                    const card = $(ele);
                    const atag = card.find('div.inner > a');
                    const id = (_a = atag.attr('href')) === null || _a === void 0 ? void 0 : _a.replace('/watch/', '');
                    const type = (_b = card.find('.info').children().last()) === null || _b === void 0 ? void 0 : _b.text().trim();
                    results.push({
                        id: id,
                        title: atag.text().trim(),
                        url: `${this.baseUrl}${atag.attr('href')}`,
                        image: (_d = (_c = card.find('img')) === null || _c === void 0 ? void 0 : _c.attr('data-src')) !== null && _d !== void 0 ? _d : (_e = card.find('img')) === null || _e === void 0 ? void 0 : _e.attr('src'),
                        //   duration: card.find('.fdi-duration')?.text(),
                        japaneseTitle: (_g = (_f = card.find('a.title')) === null || _f === void 0 ? void 0 : _f.attr('data-jp')) === null || _g === void 0 ? void 0 : _g.trim(),
                        type: type,
                        //   nsfw: card.find('.tick-rate')?.text() === '18+' ? true : false,
                        sub: parseInt((_h = card.find('.info span.sub')) === null || _h === void 0 ? void 0 : _h.text()) || 0,
                        dub: parseInt((_j = card.find('.info span.dub')) === null || _j === void 0 ? void 0 : _j.text()) || 0,
                        episodes: parseInt((_k = card.find('.info').children().eq(-2).text().trim()) !== null && _k !== void 0 ? _k : (_l = card.find('.info span.sub')) === null || _l === void 0 ? void 0 : _l.text()) || 0, //if no direct episode count, then just use sub count
                    });
                });
                return results;
            }
            catch (err) {
                throw new Error('Something went wrong. Please try again later.');
            }
        };
        /**
         * @param episodeId Episode id
         * @param subOrDub sub or dub (default `sub`) (optional)
         */
        this.fetchEpisodeServers = async (episodeId, subOrDub = models_1.SubOrSub.SUB) => {
            if (!episodeId.startsWith(this.baseUrl + '/ajax'))
                episodeId = `${this.baseUrl}/ajax/links/list?token=${episodeId.split('$token=')[1]}&_=${this.megaUp.GenerateToken(episodeId.split('$token=')[1])}`;
            try {
                const { data } = await this.client.get(episodeId, { headers: this.Headers() });
                const $ = (0, cheerio_1.load)(data.result);
                const servers = [];
                const serverItems = $(`.server-items.lang-group[data-id="${subOrDub}"] .server`);
                await Promise.all(serverItems.map(async (i, server) => {
                    const id = $(server).attr('data-lid');
                    const { data } = await this.client.get(`${this.baseUrl}/ajax/links/view?id=${id}&_=${this.megaUp.GenerateToken(id)}`, { headers: this.Headers() });
                    const decodedData = JSON.parse(this.megaUp.DecodeIframeData(data.result));
                    servers.push({
                        name: `MegaUp ${$(server).text().trim()}`.toLowerCase(), //megaup is the only server for now
                        url: decodedData.url,
                        intro: {
                            start: decodedData === null || decodedData === void 0 ? void 0 : decodedData.skip.intro[0],
                            end: decodedData === null || decodedData === void 0 ? void 0 : decodedData.skip.intro[1],
                        },
                        outro: {
                            start: decodedData === null || decodedData === void 0 ? void 0 : decodedData.skip.outro[0],
                            end: decodedData === null || decodedData === void 0 ? void 0 : decodedData.skip.outro[1],
                        },
                    });
                }));
                return servers;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        if (customBaseURL) {
            if (customBaseURL.startsWith('http://') || customBaseURL.startsWith('https://')) {
                this.baseUrl = customBaseURL;
            }
            else {
                this.baseUrl = `http://${customBaseURL}`;
            }
        }
        else {
            this.baseUrl = this.baseUrl;
        }
    }
    /**
     * @param query Search query
     * @param page Page number (optional)
     */
    search(query, page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/browser?keyword=${query.replace(/[\W_]+/g, '+')}&page=${page}`);
    }
    /**
     * @param page number
     */
    fetchLatestCompleted(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/completed?page=${page}`);
    }
    /**
     * @param page number
     */
    fetchRecentlyAdded(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/recent?page=${page}`);
    }
    /**
     * @param page number
     */
    fetchRecentlyUpdated(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/updates?page=${page}`);
    }
    /**
     * @param page number
     */
    fetchNewReleases(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/new-releases?page=${page}`);
    }
    /**
     * @param page number
     */
    fetchMovie(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/movie?page=${page}`);
    }
    /**
     * @param page number
     */
    fetchTV(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/tv?page=${page}`);
    }
    /**
     * @param page number
     */
    fetchOVA(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/ova?page=${page}`);
    }
    /**
     * @param page number
     */
    fetchONA(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/ona?page=${page}`);
    }
    /**
     * @param page number
     */
    fetchSpecial(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/special?page=${page}`);
    }
    async fetchGenres() {
        try {
            const res = [];
            const { data } = await this.client.get(`${this.baseUrl}/home`, { headers: this.Headers() });
            const $ = (0, cheerio_1.load)(data);
            const sideBar = $('#menu');
            sideBar.find('ul.c4 li a').each((i, ele) => {
                const genres = $(ele);
                res.push(genres.text().toLowerCase());
            });
            return res;
        }
        catch (err) {
            throw new Error('Something went wrong. Please try again later.');
        }
    }
    /**
     * @param page number
     */
    genreSearch(genre, page = 1) {
        if (genre == '') {
            throw new Error('genre is empty');
        }
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/genres/${genre}?page=${page}`);
    }
    /**
     * Fetches the schedule for a given date.
     * @param date The date in format 'YYYY-MM-DD'. Defaults to the current date.
     * @returns A promise that resolves to an object containing the search results.
     */
    async fetchSchedule(date = new Date().toISOString().split('T')[0]) {
        try {
            const res = {
                results: [],
            };
            const { data } = await this.client.get(`${this.baseUrl}/ajax/schedule/items?tz=5.5&time=${Math.floor(new Date(`${date}T00:00:00Z`).getTime() / 1000)}`, { headers: this.Headers() });
            const $ = (0, cheerio_1.load)(data.result);
            $('ul.collapsed li').each((i, ele) => {
                var _a;
                const card = $(ele);
                const titleElement = card.find('span.title');
                const episodeText = card.find('span').last().text().trim();
                res.results.push({
                    id: (_a = card.find('a').attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[2], // Extract anime ID
                    title: titleElement.text().trim(),
                    japaneseTitle: titleElement.attr('data-jp'),
                    airingTime: card.find('span.time').text().trim(),
                    airingEpisode: episodeText.replace('EP ', ''), // Extract episode number
                });
            });
            return res;
        }
        catch (err) {
            throw new Error('Something went wrong. Please try again later.');
        }
    }
    async fetchSpotlight() {
        try {
            const res = { results: [] };
            const { data } = await this.client.get(`${this.baseUrl}/home`, { headers: this.Headers() });
            const $ = (0, cheerio_1.load)(data);
            $('div.swiper-wrapper > div.swiper-slide').each((i, el) => {
                var _a, _b;
                const card = $(el);
                const titleElement = card.find('div.detail > p.title');
                const id = (_a = card.find('div.swiper-ctrl > a.btn').attr('href')) === null || _a === void 0 ? void 0 : _a.replace('/watch/', '');
                const img = card.attr('style');
                res.results.push({
                    id: id,
                    title: titleElement.text(),
                    japaneseTitle: titleElement.attr('data-jp'),
                    banner: ((_b = img === null || img === void 0 ? void 0 : img.match(/background-image:\s*url\(["']?(.+?)["']?\)/)) === null || _b === void 0 ? void 0 : _b[1]) || null,
                    url: `${this.baseUrl}/watch/${id}`,
                    type: card.find('div.detail > div.info').children().eq(-2).text().trim(),
                    genres: card
                        .find('div.detail > div.info')
                        .children()
                        .last()
                        .text()
                        .trim()
                        .split(',')
                        .map(genre => genre.trim()),
                    releaseDate: card
                        .find('div.detail > div.mics >div:contains("Release")')
                        .children('span')
                        .text()
                        .trim(),
                    quality: card.find('div.detail > div.mics >div:contains("Quality")').children('span').text().trim(),
                    sub: parseInt(card.find('div.detail > div.info > span.sub').text().trim()) || 0,
                    dub: parseInt(card.find('div.detail > div.info > span.dub').text().trim()) || 0,
                    description: card.find('div.detail > p.desc').text().trim(),
                });
            });
            return res;
        }
        catch (error) {
            throw new Error('Something went wrong. Please try again later.');
        }
    }
    async fetchSearchSuggestions(query) {
        try {
            const { data } = await this.client.get(`${this.baseUrl}/ajax/anime/search?keyword=${query.replace(/[\W_]+/g, '+')}`, { headers: this.Headers() });
            const $ = (0, cheerio_1.load)(data.result.html);
            const res = {
                results: [],
            };
            $('a.aitem').each((i, el) => {
                var _a, _b, _c, _d, _e;
                const card = $(el);
                const image = card.find('.poster img').attr('src');
                const titleElement = card.find('.title');
                const title = titleElement.text().trim();
                const japaneseTitle = titleElement.attr('data-jp');
                const id = (_a = card.attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[2];
                const year = card.find('.info').children().eq(-2).text().trim();
                const type = card.find('.info').children().eq(-3).text().trim();
                const sub = parseInt((_b = card.find('.info span.sub')) === null || _b === void 0 ? void 0 : _b.text()) || 0;
                const dub = parseInt((_c = card.find('.info span.dub')) === null || _c === void 0 ? void 0 : _c.text()) || 0;
                const episodes = parseInt((_d = card.find('.info').children().eq(-4).text().trim()) !== null && _d !== void 0 ? _d : (_e = card.find('.info span.sub')) === null || _e === void 0 ? void 0 : _e.text()) || 0;
                res.results.push({
                    id: id,
                    title: title,
                    url: `${this.baseUrl}/watch/${id}`,
                    image: image,
                    japaneseTitle: japaneseTitle || null,
                    type: type,
                    year: year,
                    sub: sub,
                    dub: dub,
                    episodes: episodes,
                });
            });
            return res;
        }
        catch (error) {
            throw new Error('Something went wrong. Please try again later.');
        }
    }
    Headers() {
        return {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0',
            Accept: 'text/html, */*; q=0.01',
            'Accept-Language': 'en-US,en;q=0.5',
            'Sec-GPC': '1',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            Priority: 'u=0',
            Pragma: 'no-cache',
            'Cache-Control': 'no-cache',
            Referer: `${this.baseUrl}/`,
            Cookie: 'usertype=guest; session=hxYne0BNXguMc8zK1FHqQKXPmmoANzBBOuNPM64a; cf_clearance=WfGWV1bKGAaNySbh.yzCyuobBOtjg0ncfPwMhtsvsrs-1737611098-1.2.1.1-zWHcaytuokjFTKbCAxnSPDc_BWAeubpf9TAAVfuJ2vZuyYXByqZBXAZDl_VILwkO5NOLck8N0C4uQr4yGLbXRcZ_7jfWUvfPGayTADQLuh.SH.7bvhC7DmxrMGZ8SW.hGKEQzRJf8N7h6ZZ27GMyqOfz1zfrOiu9W30DhEtW2N7FAXUPrdolyKjCsP1AK3DqsDtYOiiPNLnu47l.zxK80XogfBRQkiGecCBaeDOJHenjn._Zgykkr.F_2bj2C3AS3A5mCpZSlWK5lqhV6jQSQLF9wKWitHye39V.6NoE3RE',
        };
    }
}
//(async () => {
//  const animekai = new AnimeKai();
//  const anime = await animekai.search('dandadan');
//  const info = await animekai.fetchAnimeInfo('solo-leveling-season-2-arise-from-the-shadow-x7rq');
//  console.log(info.episodes);
//  const sources = await animekai.fetchEpisodeSources(info?.episodes![0].id!);
//  console.log(sources);
//})();
exports.default = AnimeKai;
//# sourceMappingURL=animekai.js.map
