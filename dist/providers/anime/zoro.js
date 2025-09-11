"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const utils_1 = require("../../utils");
const utils_2 = require("../../utils");
class Zoro extends models_1.AnimeParser {
    constructor(customBaseURL) {
        super(...arguments);
        this.name = 'Zoro';
        this.baseUrl = 'https://hianime.to';
        this.logo = 'https://is3-ssl.mzstatic.com/image/thumb/Purple112/v4/7e/91/00/7e9100ee-2b62-0942-4cdc-e9b93252ce1c/source/512x512bb.jpg';
        this.classPath = 'ANIME.Zoro';
        /**
         * @param id Anime id
         */
        this.fetchAnimeInfo = async (id) => {
            const info = {
                id: id,
                title: '',
            };
            try {
                const { data } = await this.client.get(`${this.baseUrl}/watch/${id}`);
                const $ = (0, cheerio_1.load)(data);
                const { mal_id, anilist_id } = JSON.parse($('#syncData').text());
                info.malID = Number(mal_id);
                info.alID = Number(anilist_id);
                info.title = $('h2.film-name > a.text-white').text();
                info.japaneseTitle = $('div.anisc-info div:nth-child(2) span.name').text();
                info.image = $('img.film-poster-img').attr('src');
                info.description = $('div.film-description').text().trim();
                // Movie, TV, OVA, ONA, Special, Music
                info.type = $('span.item').last().prev().prev().text().toUpperCase();
                info.url = `${this.baseUrl}/${id}`;
                info.recommendations = await this.scrapeCard($);
                info.relatedAnime = [];
                $('#main-sidebar section:nth-child(1) div.anif-block-ul li').each((i, ele) => {
                    var _a, _b, _c, _d, _e, _f, _g;
                    const card = $(ele);
                    const aTag = card.find('.film-name a');
                    const id = (_a = aTag.attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[1].split('?')[0];
                    info.relatedAnime.push({
                        id: id,
                        title: aTag.text(),
                        url: `${this.baseUrl}${aTag.attr('href')}`,
                        image: (_b = card.find('img')) === null || _b === void 0 ? void 0 : _b.attr('data-src'),
                        japaneseTitle: aTag.attr('data-jname'),
                        type: (_d = (_c = card.find('.tick').contents().last()) === null || _c === void 0 ? void 0 : _c.text()) === null || _d === void 0 ? void 0 : _d.trim(),
                        sub: parseInt((_e = card.find('.tick-item.tick-sub')) === null || _e === void 0 ? void 0 : _e.text()) || 0,
                        dub: parseInt((_f = card.find('.tick-item.tick-dub')) === null || _f === void 0 ? void 0 : _f.text()) || 0,
                        episodes: parseInt((_g = card.find('.tick-item.tick-eps')) === null || _g === void 0 ? void 0 : _g.text()) || 0,
                    });
                });
                const hasSub = $('div.film-stats div.tick div.tick-item.tick-sub').length > 0;
                const hasDub = $('div.film-stats div.tick div.tick-item.tick-dub').length > 0;
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
                // ZORO - PAGE INFO
                const zInfo = await this.client.get(info.url);
                const $$$ = (0, cheerio_1.load)(zInfo.data);
                info.genres = [];
                $$$('.item.item-list')
                    .find('a')
                    .each(function () {
                    var _a;
                    const genre = $(this).text().trim();
                    if (genre != undefined)
                        (_a = info.genres) === null || _a === void 0 ? void 0 : _a.push(genre);
                });
                switch ($$$('.item.item-title').find("span.item-head:contains('Status')").next('span.name').text().trim()) {
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
                info.season = $$$('.item.item-title')
                    .find("span.item-head:contains('Premiered')")
                    .next('span.name')
                    .text()
                    .trim();
                if (info.japaneseTitle == '' || info.japaneseTitle == undefined) {
                    info.japaneseTitle = $$$('.item.item-title')
                        .find("span.item-head:contains('Japanese')")
                        .next('span.name')
                        .text()
                        .trim();
                }
                const episodesAjax = await this.client.get(`${this.baseUrl}/ajax/v2/episode/list/${id.split('-').pop()}`, {
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
                    const isSubbed = number <= (parseInt($('div.film-stats div.tick div.tick-item.tick-sub').text().trim()) || 0);
                    const isDubbed = number <= (parseInt($('div.film-stats div.tick div.tick-item.tick-dub').text().trim()) || 0);
                    (_c = info.episodes) === null || _c === void 0 ? void 0 : _c.push({
                        id: episodeId,
                        number: number,
                        title: title,
                        isFiller: isFiller,
                        isSubbed: isSubbed,
                        isDubbed: isDubbed,
                        url: url,
                    });
                });
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
        this.fetchEpisodeSources = async (episodeId, server = models_1.StreamingServers.VidCloud, subOrDub = models_1.SubOrSub.SUB) => {
            if (episodeId.startsWith('http')) {
                const serverUrl = new URL(episodeId);
                switch (server) {
                    case models_1.StreamingServers.VidStreaming:
                    case models_1.StreamingServers.VidCloud:
                        return {
                            headers: { Referer: serverUrl.href },
                            ...(await new utils_1.MegaCloud().extract(serverUrl, this.baseUrl)),
                        };
                    case models_1.StreamingServers.StreamSB:
                        return {
                            headers: {
                                Referer: serverUrl.href,
                                watchsb: 'streamsb',
                                'User-Agent': utils_2.USER_AGENT,
                            },
                            sources: await new utils_1.StreamSB(this.proxyConfig, this.adapter).extract(serverUrl, true),
                        };
                    case models_1.StreamingServers.StreamTape:
                        return {
                            headers: { Referer: serverUrl.href, 'User-Agent': utils_2.USER_AGENT },
                            sources: await new utils_1.StreamTape(this.proxyConfig, this.adapter).extract(serverUrl),
                        };
                    default:
                    case models_1.StreamingServers.VidCloud:
                        return {
                            headers: { Referer: serverUrl.href },
                            ...(await new utils_1.MegaCloud().extract(serverUrl, this.baseUrl)),
                        };
                }
            }
            if (!episodeId.includes('$episode$'))
                throw new Error('Invalid episode id');
            // keeping this for future use
            // Fallback to using sub if no info found in case of compatibility
            // TODO: add both options later
            // subOrDub = episodeId.split('$')?.pop() === 'dub' ? 'dub' : 'sub';
            episodeId = `${this.baseUrl}/watch/${episodeId
                .replace('$episode$', '?ep=')
                .replace(/\$auto|\$sub|\$dub/gi, '')}`;
            try {
                const { data } = await this.client.get(`${this.baseUrl}/ajax/v2/episode/servers?episodeId=${episodeId.split('?ep=')[1]}`);
                const $ = (0, cheerio_1.load)(data.html);
                /**
                 * vidtreaming -> 4
                 * rapidcloud  -> 1
                 * streamsb -> 5
                 * streamtape -> 3
                 */
                let serverId = '';
                try {
                    switch (server) {
                        case models_1.StreamingServers.VidCloud:
                            serverId = this.retrieveServerId($, 1, subOrDub);
                            // zoro's vidcloud server is rapidcloud
                            if (!serverId)
                                throw new Error('RapidCloud not found');
                            break;
                        case models_1.StreamingServers.VidStreaming:
                            serverId = this.retrieveServerId($, 4, subOrDub);
                            // zoro's vidcloud server is rapidcloud
                            if (!serverId)
                                throw new Error('vidtreaming not found');
                            break;
                        case models_1.StreamingServers.StreamSB:
                            serverId = this.retrieveServerId($, 5, subOrDub);
                            if (!serverId)
                                throw new Error('StreamSB not found');
                            break;
                        case models_1.StreamingServers.StreamTape:
                            serverId = this.retrieveServerId($, 3, subOrDub);
                            if (!serverId)
                                throw new Error('StreamTape not found');
                            break;
                    }
                }
                catch (err) {
                    throw new Error("Couldn't find server. Try another server");
                }
                const { data: { link }, } = await this.client.get(`${this.baseUrl}/ajax/v2/episode/sources?id=${serverId}`);
                return await this.fetchEpisodeSources(link, server, models_1.SubOrSub.SUB);
            }
            catch (err) {
                throw err;
            }
        };
        this.verifyLoginState = async (connectSid) => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/ajax/login-state`, {
                    headers: {
                        Cookie: `connect.sid=${connectSid}`,
                    },
                });
                return data.is_login;
            }
            catch (err) {
                return false;
            }
        };
        this.retrieveServerId = ($, index, subOrDub) => {
            const rawOrSubOrDub = (raw) => $(`.ps_-block.ps_-block-sub.servers-${raw ? 'raw' : subOrDub} > .ps__-list .server-item`)
                .map((i, el) => ($(el).attr('data-server-id') == `${index}` ? $(el) : null))
                .get()[0]
                .attr('data-id');
            try {
                // Attempt to get the subOrDub ID
                return rawOrSubOrDub(false);
            }
            catch (error) {
                // If an error is thrown, attempt to get the raw ID (The raw is the newest episode uploaded to zoro)
                return rawOrSubOrDub(true);
            }
        };
        /**
         * @param url string
         */
        this.scrapeCardPage = async (url, headers) => {
            var _a, _b, _c;
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
                res.currentPage = parseInt((_a = pagination.find('.page-item.active')) === null || _a === void 0 ? void 0 : _a.text());
                const nextPage = (_b = pagination.find('a[title=Next]')) === null || _b === void 0 ? void 0 : _b.attr('href');
                if (nextPage != undefined && nextPage != '') {
                    res.hasNextPage = true;
                }
                const totalPages = (_c = pagination.find('a[title=Last]').attr('href')) === null || _c === void 0 ? void 0 : _c.split('=').pop();
                if (totalPages === undefined || totalPages === '') {
                    res.totalPages = res.currentPage;
                }
                else {
                    res.totalPages = parseInt(totalPages);
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
                $('.flw-item').each((i, ele) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                    const card = $(ele);
                    const atag = card.find('.film-name a');
                    const id = (_a = atag.attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[1].split('?')[0];
                    const watchList = card.find('.dropdown-menu .added').text().trim();
                    const type = (_c = (_b = card
                        .find('.fdi-item')) === null || _b === void 0 ? void 0 : _b.first()) === null || _c === void 0 ? void 0 : _c.text().replace(' (? eps)', '').replace(/\s\(\d+ eps\)/g, '');
                    results.push({
                        id: id,
                        title: atag.text(),
                        url: `${this.baseUrl}${atag.attr('href')}`,
                        image: (_d = card.find('img')) === null || _d === void 0 ? void 0 : _d.attr('data-src'),
                        duration: (_e = card.find('.fdi-duration')) === null || _e === void 0 ? void 0 : _e.text(),
                        watchList: watchList || models_1.WatchListType.NONE,
                        japaneseTitle: atag.attr('data-jname'),
                        type: type,
                        nsfw: ((_f = card.find('.tick-rate')) === null || _f === void 0 ? void 0 : _f.text()) === '18+' ? true : false,
                        sub: parseInt((_g = card.find('.tick-item.tick-sub')) === null || _g === void 0 ? void 0 : _g.text()) || 0,
                        dub: parseInt((_h = card.find('.tick-item.tick-dub')) === null || _h === void 0 ? void 0 : _h.text()) || 0,
                        episodes: parseInt((_j = card.find('.tick-item.tick-eps')) === null || _j === void 0 ? void 0 : _j.text()) || 0,
                    });
                });
                return results;
            }
            catch (err) {
                throw new Error('Something went wrong. Please try again later.');
            }
        };
        /**
         * @deprecated
         * @param episodeId Episode id
         */
        this.fetchEpisodeServers = (episodeId) => {
            throw new Error('Method not implemented.');
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
        return this.scrapeCardPage(`${this.baseUrl}/search?keyword=${decodeURIComponent(query)}&page=${page}`);
    }
    /**
     * Fetch advanced anime search results with various filters.
     *
     * @param page Page number (default: 1)
     * @param type One of (Optional): movie, tv, ova, ona, special, music
     * @param status One of (Optional): finished_airing, currently_airing, not_yet_aired
     * @param rated One of (Optional): g, pg, pg_13, r, r_plus, rx
     * @param score Number from 1 to 10 (Optional)
     * @param season One of (Optional): spring, summer, fall, winter
     * @param language One of (Optional): sub, dub, sub_dub
     * @param startDate Start date object { year, month, day } (Optional)
     * @param endDate End date object { year, month, day } (Optional)
     * @param sort One of (Optional): recently_added, recently_updated, score, name_az, released_date, most_watched
     * @param genres Array of genres (Optional): action, adventure, cars, comedy, dementia, demons, mystery, drama, ecchi, fantasy, game, historical, horror, kids, magic, martial_arts, mecha, music, parody, samurai, romance, school, sci_fi, shoujo, shoujo_ai, shounen, shounen_ai, space, sports, super_power, vampire, harem, military, slice_of_life, supernatural, police, psychological, thriller, seinen, isekai, josei
     * @returns A Promise resolving to the search results.
     */
    fetchAdvancedSearch(page = 1, type, status, rated, score, season, language, startDate, endDate, sort, genres) {
        if (page <= 0)
            page = 1;
        const mappings = {
            type: { movie: 1, tv: 2, ova: 3, ona: 4, special: 5, music: 6 },
            status: { finished_airing: 1, currently_airing: 2, not_yet_aired: 3 },
            rated: { g: 1, pg: 2, pg_13: 3, r: 4, r_plus: 5, rx: 6 },
            season: { spring: 1, summer: 2, fall: 3, winter: 4 },
            language: { sub: 1, dub: 2, sub_dub: 3 },
            genre: {
                action: 1,
                adventure: 2,
                cars: 3,
                comedy: 4,
                dementia: 5,
                demons: 6,
                mystery: 7,
                drama: 8,
                ecchi: 9,
                fantasy: 10,
                game: 11,
                historical: 13,
                horror: 14,
                kids: 15,
                magic: 16,
                martial_arts: 17,
                mecha: 18,
                music: 19,
                parody: 20,
                samurai: 21,
                romance: 22,
                school: 23,
                sci_fi: 24,
                shoujo: 25,
                shoujo_ai: 26,
                shounen: 27,
                shounen_ai: 28,
                space: 29,
                sports: 30,
                super_power: 31,
                vampire: 32,
                harem: 35,
                military: 38,
                slice_of_life: 36,
                supernatural: 37,
                police: 39,
                psychological: 40,
                thriller: 41,
                seinen: 42,
                isekai: 44,
                josei: 43,
            },
        };
        const params = new URLSearchParams({ page: page.toString() });
        const addParam = (key, value) => {
            var _a;
            if (value)
                params.append(key, (((_a = mappings[key]) === null || _a === void 0 ? void 0 : _a[value]) || value).toString());
        };
        addParam('type', type);
        addParam('status', status);
        addParam('rated', rated);
        if (score)
            params.append('score', score.toString());
        addParam('season', season);
        addParam('language', language);
        if (startDate) {
            params.append('sy', startDate.year.toString());
            params.append('sm', startDate.month.toString());
            params.append('sd', startDate.day.toString());
        }
        if (endDate) {
            params.append('ey', endDate.year.toString());
            params.append('em', endDate.month.toString());
            params.append('ed', endDate.day.toString());
        }
        if (sort)
            params.append('sort', sort);
        if (genres === null || genres === void 0 ? void 0 : genres.length) {
            const genreIds = genres.map(genre => (mappings.genre[genre] || genre).toString()).join('%2C');
            params.append('genres', genreIds);
        }
        return this.scrapeCardPage(`${this.baseUrl}/filter?${params.toString()}`);
    }
    /**
     * @param page number
     */
    fetchTopAiring(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/top-airing?page=${page}`);
    }
    /**
     * @param page number
     */
    fetchMostPopular(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/most-popular?page=${page}`);
    }
    /**
     * @param page number
     */
    fetchMostFavorite(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/most-favorite?page=${page}`);
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
    fetchRecentlyUpdated(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/recently-updated?page=${page}`);
    }
    /**
     * @param page number
     */
    fetchRecentlyAdded(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/recently-added?page=${page}`);
    }
    /**
     * @param page number
     */
    fetchTopUpcoming(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/top-upcoming?page=${page}`);
    }
    /**
     * @param studio Studio id, e.g. "toei-animation"
     * @param page page number (optional) `default 1`
     */
    fetchStudio(studio, page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/producer/${studio}?page=${page}`);
    }
    /**
     * @param page number
     */
    fetchSubbedAnime(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/subbed-anime?page=${page}`);
    }
    /**
     * @param page number
     */
    fetchDubbedAnime(page = 1) {
        if (0 >= page) {
            page = 1;
        }
        return this.scrapeCardPage(`${this.baseUrl}/dubbed-anime?page=${page}`);
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
            const { data } = await this.client.get(`${this.baseUrl}/home`);
            const $ = (0, cheerio_1.load)(data);
            const sideBar = $('#main-sidebar');
            sideBar.find('ul.sb-genre-list li a').each((i, ele) => {
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
        return this.scrapeCardPage(`${this.baseUrl}/genre/${genre}?page=${page}`);
    }
    /**
     * Fetches the schedule for a given date.
     * @param date The date in format 'YYYY-MM-DD'. Defaults to the current date.
     * @returns A promise that resolves to an object containing the search results.
     */
    async fetchSchedule(date = new Date().toISOString().slice(0, 10)) {
        try {
            const res = {
                results: [],
            };
            const { data: { html }, } = await this.client.get(`${this.baseUrl}/ajax/schedule/list?tzOffset=360&date=${date}`);
            const $ = (0, cheerio_1.load)(html);
            $('li').each((i, ele) => {
                var _a;
                const card = $(ele);
                const title = card.find('.film-name');
                const id = (_a = card.find('a.tsl-link').attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[1].split('?')[0];
                const airingTime = card.find('div.time').text().replace('\n', '').trim();
                const airingEpisode = card.find('div.film-detail div.fd-play button').text().replace('\n', '').trim();
                res.results.push({
                    id: id,
                    title: title.text(),
                    japaneseTitle: title.attr('data-jname'),
                    url: `${this.baseUrl}/${id}`,
                    airingEpisode: airingEpisode,
                    airingTime: airingTime,
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
            const { data } = await this.client.get(`${this.baseUrl}/home`);
            const $ = (0, cheerio_1.load)(data);
            $('#slider div.swiper-wrapper div.swiper-slide').each((i, el) => {
                var _a, _b, _c;
                const card = $(el);
                const titleElement = card.find('div.desi-head-title');
                const id = ((_b = (_a = card
                    .find('div.desi-buttons .btn-secondary')
                    .attr('href')) === null || _a === void 0 ? void 0 : _a.match(/\/([^/]+)$/)) === null || _b === void 0 ? void 0 : _b[1]) || null;
                const img = card.find('img.film-poster-img');
                res.results.push({
                    id: id,
                    title: titleElement.text(),
                    japaneseTitle: titleElement.attr('data-jname'),
                    banner: img.attr('data-src') || img.attr('src') || null,
                    rank: parseInt((_c = card.find('.desi-sub-text').text().match(/(\d+)/g)) === null || _c === void 0 ? void 0 : _c[0]),
                    url: `${this.baseUrl}/${id}`,
                    type: card.find('div.sc-detail .scd-item:nth-child(1)').text().trim(),
                    duration: card.find('div.sc-detail > div:nth-child(2)').text().trim(),
                    releaseDate: card.find('div.sc-detail > div:nth-child(3)').text().trim(),
                    quality: card.find('div.sc-detail > div:nth-child(4)').text().trim(),
                    sub: parseInt(card.find('div.sc-detail div.tick-sub').text().trim()) || 0,
                    dub: parseInt(card.find('div.sc-detail div.tick-dub').text().trim()) || 0,
                    episodes: parseInt(card.find('div.sc-detail div.tick-eps').text()) || 0,
                    description: card.find('div.desi-description').text().trim(),
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
            const { data } = await this.client.get(`${this.baseUrl}/ajax/search/suggest?keyword=${encodedQuery}`);
            const $ = (0, cheerio_1.load)(data.html);
            const res = {
                results: [],
            };
            $('.nav-item').each((i, el) => {
                var _a;
                const card = $(el);
                if (!card.hasClass('nav-bottom')) {
                    const image = card.find('.film-poster img').attr('data-src');
                    const title = card.find('.film-name');
                    const id = (_a = card.attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[1].split('?')[0];
                    const duration = card.find('.film-infor span').last().text().trim();
                    const releaseDate = card.find('.film-infor span:nth-child(1)').text().trim();
                    const type = card.find('.film-infor').find('span, i').remove().end().text().trim();
                    res.results.push({
                        image: image,
                        id: id,
                        title: title.text(),
                        japaneseTitle: title.attr('data-jname'),
                        aliasTitle: card.find('.alias-name').text(),
                        releaseDate: releaseDate,
                        type: type,
                        duration: duration,
                        url: `${this.baseUrl}/${id}`,
                    });
                }
            });
            return res;
        }
        catch (error) {
            throw new Error('Something went wrong. Please try again later.');
        }
    }
    /**
     * Fetches the list of episodes that the user is currently watching.
     * @param connectSid The session ID of the user. Note: This can be obtained from the browser cookies (needs to be signed in)
     * @returns A promise that resolves to an array of anime episodes.
     */
    async fetchContinueWatching(connectSid) {
        try {
            if (!(await this.verifyLoginState(connectSid))) {
                throw new Error('Invalid session ID');
            }
            const res = [];
            const { data } = await this.client.get(`${this.baseUrl}/user/continue-watching`, {
                headers: {
                    Cookie: `connect.sid=${connectSid}`,
                },
            });
            const $ = (0, cheerio_1.load)(data);
            $('.flw-item').each((i, ele) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                const card = $(ele);
                const atag = card.find('.film-name a');
                const id = (_b = (_a = atag.attr('href')) === null || _a === void 0 ? void 0 : _a.replace('/watch/', '')) === null || _b === void 0 ? void 0 : _b.replace('?ep=', '$episode$');
                const timeText = (_e = (_d = (_c = card.find('.fdb-time')) === null || _c === void 0 ? void 0 : _c.text()) === null || _d === void 0 ? void 0 : _d.split('/')) !== null && _e !== void 0 ? _e : [];
                const duration = (_g = (_f = timeText.pop()) === null || _f === void 0 ? void 0 : _f.trim()) !== null && _g !== void 0 ? _g : '';
                const watchedTime = timeText.length > 0 ? timeText[0].trim() : '';
                res.push({
                    id: id,
                    title: atag.text(),
                    number: parseInt(card.find('.fdb-type').text().replace('EP', '').trim()),
                    duration: duration,
                    watchedTime: watchedTime,
                    url: `${this.baseUrl}${atag.attr('href')}`,
                    image: (_h = card.find('img')) === null || _h === void 0 ? void 0 : _h.attr('data-src'),
                    japaneseTitle: atag.attr('data-jname'),
                    nsfw: ((_j = card.find('.tick-rate')) === null || _j === void 0 ? void 0 : _j.text()) === '18+' ? true : false,
                    sub: parseInt((_k = card.find('.tick-item.tick-sub')) === null || _k === void 0 ? void 0 : _k.text()) || 0,
                    dub: parseInt((_l = card.find('.tick-item.tick-dub')) === null || _l === void 0 ? void 0 : _l.text()) || 0,
                    episodes: parseInt((_m = card.find('.tick-item.tick-eps')) === null || _m === void 0 ? void 0 : _m.text()) || 0,
                });
            });
            return res;
        }
        catch (err) {
            throw new Error(err.message);
        }
    }
    async fetchWatchList(connectSid, page = 1, sortListType) {
        if (!(await this.verifyLoginState(connectSid))) {
            throw new Error('Invalid session ID');
        }
        if (0 >= page) {
            page = 1;
        }
        let type = 0;
        switch (sortListType) {
            case models_1.WatchListType.WATCHING:
                type = 1;
            case models_1.WatchListType.ONHOLD:
                type = 2;
            case models_1.WatchListType.PLAN_TO_WATCH:
                type = 3;
            case models_1.WatchListType.DROPPED:
                type = 4;
            case models_1.WatchListType.COMPLETED:
                type = 5;
        }
        return this.scrapeCardPage(`${this.baseUrl}/user/watch-list?page=${page}${type != 0 ? '&type=' + type : ''}`, {
            headers: { Cookie: `connect.sid=${connectSid}` },
        });
    }
}
// (async () => {
//   const zoro = new Zoro();
//   const anime = await zoro.search('Dandadan');
//   const info = await zoro.fetchAnimeInfo(anime.results[0].id);
//   const sources = await zoro.fetchEpisodeSources(
//     info.episodes![0].id,
//     StreamingServers.VidCloud,
//     SubOrSub.DUB
//   );
//   console.log(sources);
// })();
exports.default = Zoro;
//# sourceMappingURL=zoro.js.map