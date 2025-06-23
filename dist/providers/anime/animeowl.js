"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const utils_1 = require("../../utils");
class AnimeOwl extends models_1.AnimeParser {
    constructor(customBaseURL) {
        super(...arguments);
        this.name = 'AnimeOwl';
        this.baseUrl = 'https://animeowl.me';
        this.apiUrl = 'https://animeowl.me/api';
        this.logo = 'https://animeowl.me/images/favicon-96x96.png';
        this.classPath = 'ANIME.AnimeOwl';
        /**
         * @param query Search query
         * @param page Page number (optional)
         */
        this.search = async (query, page = 1) => {
            if (0 >= page) {
                page = 1;
            }
            const { data } = await this.client.post(`${this.apiUrl}/advance-search`, {
                clicked: false,
                limit: 24,
                page: page - 1,
                pageCount: 1,
                value: query,
                selected: {
                    type: [],
                    genre: [],
                    year: [],
                    country: [],
                    season: [],
                    status: [],
                    sort: [],
                    language: [],
                },
                results: [],
                lang22: 3,
                sortt: 4,
            });
            const res = {
                currentPage: page,
                hasNextPage: page < Math.ceil(data.total / 24),
                totalPages: Math.ceil(data.total / 24),
                results: [],
            };
            res.results = data.results.map((item) => ({
                id: `${item.anime_slug}$${item.anime_id}`,
                title: item.en_name || item.anime_name,
                url: `${this.baseUrl}/anime/${item.anime_slug}`,
                image: `${this.baseUrl}${item.image}` ||
                    `${this.baseUrl}${item.thumbnail}` ||
                    `${this.baseUrl}${item.webp}`,
                japaneseTitle: item.jp_name,
                sub: parseInt(item.total_episodes) || 0,
                dub: parseInt(item.total_dub_episodes) || 0,
                episodes: parseInt(item.total_episodes) || 0,
            }));
            return res;
        };
        /**
         * @param id Anime id
         */
        this.fetchAnimeInfo = async (id) => {
            var _a, _b;
            const info = {
                id: id,
                title: '',
            };
            try {
                const { data } = await this.client.get(`${this.baseUrl}/anime/${id.split('$')[0]}`);
                const $ = (0, cheerio_1.load)(data);
                info.title = $('h1.anime-name').text();
                info.japaneseTitle = $('h2.anime-romaji').text();
                info.image = `${this.baseUrl}${$('div.cover-img-container >img').attr('src')}`;
                info.description = $('div.anime-desc')
                    .text()
                    .replace(/\s*\n\s*/g, ' ')
                    .trim();
                // Movie, TV, OVA, ONA, Special, Music
                info.type = $('div.type > a').text().toUpperCase();
                info.url = `${this.baseUrl}/anime/${id.split('$')[0]}`;
                // info.recommendations = await this.scrapeCard($);
                const hasSub = $('div#anime-cover-sub-content > div.nav-container > ul#episode-list > li.nav-item').length > 0;
                const hasDub = $('div#anime-cover-dub-content > div.nav-container > ul#episode-list > li.nav-item').length > 0;
                if (hasSub) {
                    info.subOrDub = models_1.SubOrSub.SUB;
                    info.hasSub = hasSub;
                }
                if (hasDub) {
                    info.subOrDub = models_1.SubOrSub.DUB;
                    info.hasDub = hasDub;
                }
                if (hasSub && hasDub) {
                    info.subOrDub = models_1.SubOrSub.BOTH;
                }
                info.genres = [];
                $('div.genre')
                    .find('a')
                    .each(function () {
                    var _a;
                    const genre = $(this).text().trim();
                    if (genre != undefined)
                        (_a = info.genres) === null || _a === void 0 ? void 0 : _a.push(genre);
                });
                switch ($('div.status > span').text().trim()) {
                    case 'Finished Airing':
                        info.status = models_1.MediaStatus.COMPLETED;
                        break;
                    case 'Currently Airing':
                        info.status = models_1.MediaStatus.ONGOING;
                        break;
                    case 'Not yet aired':
                        info.status = models_1.MediaStatus.NOT_YET_AIRED;
                        break;
                    default:
                        info.status = models_1.MediaStatus.UNKNOWN;
                        break;
                }
                info.season = $('div.premiered')
                    .text()
                    .replace(/\s*\n\s*/g, ' ')
                    .replace('Premiered: ', '')
                    .trim();
                let totalSubEpisodes = parseInt($('div#anime-cover-sub-content > div.nav-container > ul#episode-list > li.nav-item')
                    .last()
                    .text()
                    .split('-')[1]
                    .trim());
                let totalDubEpisodes = parseInt((_b = (_a = $('div#anime-cover-dub-content > div.nav-container > ul#episode-list > li.nav-item')
                    .last()
                    .text()
                    .split('-')[1]) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : '0');
                info.totalEpisodes = totalSubEpisodes > totalDubEpisodes ? totalSubEpisodes : totalDubEpisodes;
                info.episodes = [];
                const subEpisodes = this.parseEpisodes($, '#anime-cover-sub-content .episode-node', models_1.SubOrSub.SUB);
                const dubEpisodes = this.parseEpisodes($, '#anime-cover-dub-content .episode-node', models_1.SubOrSub.DUB);
                const groupedMap = new Map();
                //passing the anime id with episode id for get request in fetchEpisodeServers
                for (const sub of subEpisodes) {
                    groupedMap.set(sub.title, {
                        id: `${id.split('$')[0]}$${sub.id}`,
                        title: sub.title,
                        number: sub.number,
                        url: sub.url,
                        isSubbed: true,
                        isDubbed: false,
                    });
                }
                for (const dub of dubEpisodes) {
                    if (groupedMap.has(dub.title)) {
                        const entry = groupedMap.get(dub.title);
                        entry.id = `${entry.id}&${dub.id}`; //combining the sub and dub episode ids
                        entry.isDubbed = true;
                    }
                    else {
                        groupedMap.set(dub.title, {
                            id: `${id.split('$')[0]}$${dub.id}`,
                            title: dub.title,
                            number: dub.number,
                            url: dub.url,
                            isSubbed: false,
                            isDubbed: true,
                        });
                    }
                }
                info.episodes = Array.from(groupedMap.values());
                return info;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         *
         * @param episodeId Episode id
         * @param server server type (default `VidCloud`) (optional)
         * @param subOrDub sub or dub (default `SubOrSub.SUB`) (optional)
         */
        this.fetchEpisodeSources = async (episodeId, server = models_1.StreamingServers.Luffy, subOrDub = models_1.SubOrSub.SUB) => {
            if (episodeId.startsWith('http')) {
                const serverUrl = new URL(episodeId);
                switch (server) {
                    case models_1.StreamingServers.Luffy:
                        return {
                            headers: { Referer: serverUrl.href },
                            sources: await new utils_1.Luffy().extract(serverUrl),
                        };
                    default:
                        return {
                            headers: { Referer: serverUrl.href },
                            sources: await new utils_1.Luffy().extract(serverUrl),
                        };
                }
            }
            try {
                const servers = await this.fetchEpisodeServers(episodeId, subOrDub);
                const i = servers.findIndex(s => s.name.toLowerCase() === server.toLowerCase());
                if (i === -1) {
                    throw new Error(`Server ${server} not found`);
                }
                const serverUrl = new URL(servers[i].url);
                const sources = await this.fetchEpisodeSources(serverUrl.href, server, subOrDub);
                return sources;
            }
            catch (err) {
                throw err;
            }
        };
        /**
         * @param url string
         */
        this.scrapeCardPage = async (url, headers) => {
            var _a;
            try {
                const res = {
                    currentPage: 0,
                    hasNextPage: false,
                    totalPages: 0,
                    results: [],
                };
                const { data } = await this.client.get(url, headers);
                const $ = (0, cheerio_1.load)(data);
                const pagination = $('ul.pagination');
                res.currentPage = parseInt((_a = pagination.find('li.page-item.active')) === null || _a === void 0 ? void 0 : _a.text()) || 1;
                const nextPage = pagination.find('li:has(a[aria-label="Next page"])');
                res.hasNextPage = !nextPage.hasClass('disabled');
                let lastPageText = 0;
                pagination.find('li.page-item a').each((_, el) => {
                    const text = parseInt($(el).text().trim());
                    if (!isNaN(text)) {
                        lastPageText = Math.max(lastPageText, text);
                    }
                });
                res.totalPages = lastPageText || res.currentPage;
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
                $('#anime-list .recent-anime.anime-vertical').each((i, ele) => {
                    var _a, _b, _c, _d, _e, _f, _g;
                    const card = $(ele);
                    const atag = card.find('a.post-thumb');
                    const id = (_a = atag.attr('href')) === null || _a === void 0 ? void 0 : _a.split(`${this.baseUrl}/anime/`)[1];
                    const type = card.find('.anime-type span').text().trim();
                    results.push({
                        id: id,
                        title: (_b = card.find('img')) === null || _b === void 0 ? void 0 : _b.attr('alt'),
                        url: `${atag.attr('href')}`,
                        image: ((_c = card.find('img')) === null || _c === void 0 ? void 0 : _c.attr('data-src')) || ((_d = card.find('img')) === null || _d === void 0 ? void 0 : _d.attr('src')),
                        type: type,
                        sub: parseInt((_e = card.find('.misc-info .anime-duration span')) === null || _e === void 0 ? void 0 : _e.eq(0).text()) || 0,
                        dub: parseInt((_f = card.find('.misc-info .anime-duration span')) === null || _f === void 0 ? void 0 : _f.eq(1).text()) || 0,
                        episodes: parseInt((_g = card.find('.misc-info .anime-duration span')) === null || _g === void 0 ? void 0 : _g.eq(0).text()) || 0,
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
            var _a, _b, _c;
            const subEpisodeId = episodeId.split('$')[1].split('&')[0];
            const dubEpisodeId = episodeId.split('&')[1];
            const id = episodeId.split('$')[0];
            const { data } = await this.client.get(`${this.baseUrl}/anime/${id}`);
            const $ = (0, cheerio_1.load)(data);
            const subEpisode = this.parseEpisodes($, '#anime-cover-sub-content .episode-node', models_1.SubOrSub.SUB).filter(item => item.id === subEpisodeId);
            const dubEpisode = this.parseEpisodes($, '#anime-cover-dub-content .episode-node', models_1.SubOrSub.DUB).filter(item => item.id === dubEpisodeId);
            let directLink = '';
            if (subOrDub === models_1.SubOrSub.SUB) {
                const { data: intermediary } = await this.client.get(subEpisode[0].url);
                const $ = (0, cheerio_1.load)(intermediary);
                directLink = (_a = $('button#hot-anime-tab')) === null || _a === void 0 ? void 0 : _a.attr('data-source');
            }
            if (subOrDub === models_1.SubOrSub.DUB) {
                const { data: intermediary } = await this.client.get(dubEpisode[0].url);
                const $ = (0, cheerio_1.load)(intermediary);
                directLink = (_b = $('button#hot-anime-tab')) === null || _b === void 0 ? void 0 : _b.attr('data-source');
            }
            const { data: server } = await this.client.get(`${this.baseUrl}${directLink}`);
            const servers = [];
            (_c = server['luffy']) === null || _c === void 0 ? void 0 : _c.map((item) => {
                servers.push({
                    name: 'luffy',
                    url: `${this.baseUrl}${directLink}`,
                });
            });
            return servers;
        };
        this.parseEpisodes = ($, selector, subOrDub) => {
            return $(selector)
                .map((idx, el) => {
                var _a, _b, _c;
                const $el = $(el);
                const title = (_a = $el.attr('title')) !== null && _a !== void 0 ? _a : '';
                const id = (_b = $el.attr('id')) !== null && _b !== void 0 ? _b : '';
                const url = ((_c = $el.attr('href')) === null || _c === void 0 ? void 0 : _c.startsWith('http')) ? $el.attr('href') : $el.prop('href');
                const episodeNumber = Number(title);
                // Skip if the episode number is a float
                if (!Number.isInteger(episodeNumber)) {
                    return null;
                }
                return {
                    id: id,
                    number: parseInt(title),
                    title: `Ep-${title}`,
                    url: url || '',
                    isSubbed: subOrDub === models_1.SubOrSub.SUB,
                    isDubbed: subOrDub === models_1.SubOrSub.DUB,
                };
            })
                .get()
                .filter(Boolean);
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
     * @param page number
     */
    fetchTopAiring(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/trending?page=${page}`);
    }
    /**
     * @param page number
     */
    fetchRecentlyUpdated(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/recent-episode/sub?page=${page}`);
    }
    /**
     * @param page number
     */
    fetchMovie(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/type/movie?page=${page}`);
    }
    /**
     * @param page number
     */
    fetchTV(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/type/tv?page=${page}`);
    }
    /**
     * @param page number
     */
    fetchOVA(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/type/ova?page=${page}`);
    }
    /**
     * @param page number
     */
    fetchONA(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/type/ona?page=${page}`);
    }
    /**
     * @param page number
     */
    fetchSpecial(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/type/special?page=${page}`);
    }
    async fetchGenres() {
        try {
            const res = [];
            const { data } = await this.client.get(`${this.baseUrl}/home`);
            const $ = (0, cheerio_1.load)(data);
            $('.nav-genre > .sidebar-grid a').each((i, el) => {
                res.push($(el).text().trim().toLowerCase());
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
        return this.scrapeCardPage(`${this.baseUrl}/genre/${genre}?page=${page}`);
    }
    async fetchSpotlight() {
        try {
            const res = { results: [] };
            const { data } = await this.client.get(`${this.baseUrl}/home`);
            const $ = (0, cheerio_1.load)(data);
            $('.carousel-inner > .carousel-item').each((i, el) => {
                var _a, _b, _c;
                const card = $(el);
                const titleElement = card.find('.slide-title');
                const id = (_a = card.find('a.anime-play').attr('href')) === null || _a === void 0 ? void 0 : _a.split(`${this.baseUrl}/anime/`)[1];
                const img = card.find('img.film-poster-img');
                res.results.push({
                    id: id,
                    title: titleElement.text().trim(),
                    banner: (_c = (_b = card
                        .find('.main-bg')) === null || _b === void 0 ? void 0 : _b.css('background')) === null || _c === void 0 ? void 0 : _c.replace(/url\(["']?(.+?)["']?\)/, '$1').trim(),
                    url: `${this.baseUrl}/anime/${id}`,
                    type: card.find('.anime-type span').text().trim(),
                    duration: card.find('.anime-duration span').first().text().trim(),
                    episodes: parseInt(card.find('.anime-duration.bg-purple span').text()) || 0,
                    description: card
                        .find('.anime-desc')
                        .text()
                        .replace(/\s*\n\s*/g, ' ')
                        .trim(),
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
            const encodedQuery = encodeURIComponent(query);
            const { data } = await this.client.get(`${this.apiUrl}/live-search/${encodedQuery}`);
            const res = {
                results: [],
            };
            data.map((item) => {
                res.results.push({
                    image: `${this.baseUrl}${item.thumbnail}` || `${this.baseUrl}${item.webp}`,
                    id: `${item.slug}$${item.id}`,
                    title: item.en_name,
                    japaneseTitle: item.anime_name,
                    releaseDate: item.year_name,
                    url: `${this.baseUrl}/anime/${item.slug}`,
                });
            });
            return res;
        }
        catch (error) {
            throw new Error('Something went wrong. Please try again later.');
        }
    }
}
(async () => {
    const animeowl = new AnimeOwl();
    const search = await animeowl.fetchSpotlight();
    const info = await animeowl.fetchAnimeInfo(search.results[0].id);
    // const sources = await animeowl.fetchEpisodeSources(info.episodes![0].id,StreamingServers.Luffy, SubOrSub.DUB);
    // console.log(info);
})();
exports.default = AnimeOwl;
//# sourceMappingURL=animeowl.js.map