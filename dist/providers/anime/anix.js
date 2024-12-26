"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const extractors_1 = require("../../extractors");
class Anix extends models_1.AnimeParser {
    constructor(customBaseURL, proxy, adapter) {
        super(proxy, adapter);
        this.name = 'Anix';
        this.baseUrl = 'https://anix.sh';
        this.logo = 'https://anix.sh/img/logo.png';
        this.classPath = 'ANIME.Anix';
        this.MediaCategory = {
            MOVIE: 1,
            TV: 2,
            OVA: 3,
            SPECIAL: 4,
            ONA: 5,
            MUSIC: 6,
            TV_SPECIAL: 7,
            UNCATEGORIZED: 0,
        };
        this.MediaRegion = {
            ANIME: 'country[]=1&country[]=2&country[]=3&country[]=4&country[]=6',
            DONGHUA: 'country[]=5',
            SUB: 'language[]=sub',
            DUB: 'language[]=dub',
        };
        this.defaultSort = `&type[]=${this.MediaCategory.MOVIE}&type[]=${this.MediaCategory.TV}&type[]=${this.MediaCategory.ONA}&type[]=${this.MediaCategory.OVA}&type[]=${this.MediaCategory.SPECIAL}&type[]=${this.MediaCategory.TV_SPECIAL}&type[]=${this.MediaCategory.UNCATEGORIZED}&status[]=${models_1.MediaStatus.ONGOING}&status[]=${models_1.MediaStatus.COMPLETED}`;
        this.requestedWith = 'XMLHttpRequest';
        /**
         * @param page page number (optional)
         */
        this.fetchRecentEpisodes = async (page = 1, type) => {
            try {
                let url = `${this.baseUrl}/filter?${this.defaultSort}&sort=recently_updated&page=${page}`;
                if (type == 1) {
                    url += `&${this.MediaRegion.ANIME}`;
                }
                else if (type == 2) {
                    url += `&${this.MediaRegion.DONGHUA}`;
                }
                else if (type == 3) {
                    url += `&${this.MediaRegion.SUB}`;
                }
                else if (type == 4) {
                    url += `&${this.MediaRegion.DUB}`;
                }
                const res = await this.client.get(url);
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
                            break;
                        case 'Comic':
                            finalType = models_1.MediaFormat.COMIC;
                            break;
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
         * @param page Page number (optional)
         */
        this.search = async (query, page = 1) => {
            try {
                const res = await this.client.get(`${this.baseUrl}/filter?keyword=${query}&page=${page}&type[]=${this.MediaCategory.MOVIE}&type[]=${this.MediaCategory.TV}&type[]=${this.MediaCategory.ONA}&type[]=${this.MediaCategory.OVA}&type[]=${this.MediaCategory.SPECIAL}&type[]=${this.MediaCategory.TV_SPECIAL}&type[]=${this.MediaCategory.MUSIC}&type[]=${this.MediaCategory.UNCATEGORIZED}`);
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
                            break;
                        case 'Comic':
                            finalType = models_1.MediaFormat.COMIC;
                            break;
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
                        break;
                    case 'Comic':
                        animeInfo.type = models_1.MediaFormat.COMIC;
                        break;
                }
                return animeInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchRandomAnimeInfo = async () => {
            var _a, _b, _c, _d, _e;
            const url = `${this.baseUrl}/random`;
            try {
                const res = await this.client.get(url);
                const $ = (0, cheerio_1.load)(res.data);
                const id = (_a = $('.content .tmp_alias')) === null || _a === void 0 ? void 0 : _a.attr('value');
                const animeInfo = {
                    id: id,
                    title: (_b = $('.ani-data .maindata .ani-name.d-title')) === null || _b === void 0 ? void 0 : _b.text().trim(),
                    englishTitle: (_d = (_c = $('.ani-data .maindata .ani-name.d-title')) === null || _c === void 0 ? void 0 : _c.attr('data-en')) === null || _d === void 0 ? void 0 : _d.trim(),
                    url: `${this.baseUrl}/anime/${id}`,
                    image: (_e = $('.ani-data .poster img')) === null || _e === void 0 ? void 0 : _e.attr('src'),
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
                        break;
                    case 'Comic':
                        animeInfo.type = models_1.MediaFormat.COMIC;
                        break;
                }
                return animeInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         *
         * @param id Anime id
         * @param episodeId Episode id
         * @param server Streaming server(optional)
         * @param type Type (optional) (options: `sub`, `dub`, `raw`)
         */
        this.fetchEpisodeSources = async (id, episodeId, server = models_1.StreamingServers.BuiltIn, type = '') => {
            const url = `${this.baseUrl}/anime/${id}/${episodeId}`;
            const uri = new URL(url);
            const res = await this.client.get(url);
            const $ = (0, cheerio_1.load)(res.data);
            const servers = new Map();
            $($('.ani-server-type-pad')[0])
                .find('.server')
                .each((i, el) => {
                servers.set($(el).text().trim(), $(el).attr('data-video'));
            });
            switch (server) {
                case models_1.StreamingServers.VidHide:
                    if (servers.get('Vidhide') !== undefined) {
                        const streamUri = new URL(servers.get('Vidhide'));
                        return {
                            headers: {
                                Referer: streamUri.origin,
                            },
                            sources: await new extractors_1.VidHide(this.proxyConfig, this.adapter).extract(streamUri),
                        };
                    }
                case models_1.StreamingServers.Mp4Upload:
                    if (servers.get('Mp4upload') !== undefined) {
                        const streamUri = new URL(servers.get('Mp4upload'));
                        return {
                            headers: {
                                Referer: streamUri.origin,
                            },
                            sources: await new extractors_1.Mp4Upload(this.proxyConfig, this.adapter).extract(streamUri),
                        };
                    }
                    throw new Error('Mp4Upload server not found');
                case models_1.StreamingServers.StreamWish:
                    if (servers.get('Streamwish') != undefined) {
                        const streamUri = new URL(servers.get('Streamwish'));
                        return {
                            headers: {
                                Referer: uri.origin,
                            },
                            ...(await new extractors_1.StreamWish(this.proxyConfig, this.adapter).extract(streamUri)),
                        };
                    }
                    throw new Error('StreamWish server not found');
                default:
                    const episodeSources = {
                        sources: [],
                    };
                    try {
                        let defaultUrl = '';
                        $('script:contains("loadIframePlayer")').each((i, el) => {
                            const scriptContent = $(el).text();
                            // Regular expression to capture the JSON inside loadIframePlayer
                            const jsonRegex = /loadIframePlayer\(\s*(['"`])(\[[\s\S]*?\])\1/;
                            const match = jsonRegex.exec(scriptContent);
                            if (match && match[0]) {
                                const extractedJson = match[0]
                                    .replace('loadIframePlayer(', '')
                                    .replace("'", '')
                                    .replace("'", '');
                                const data = JSON.parse(extractedJson);
                                if (data == undefined || data.length <= 0) {
                                    throw new Error('BuiltIn server not found');
                                }
                                if (type != '') {
                                    for (const item of data) {
                                        if (item.type.toUpperCase() == type.toUpperCase()) {
                                            defaultUrl = item.url;
                                            break;
                                        }
                                    }
                                }
                                else {
                                    defaultUrl = data[0].url;
                                }
                                if (defaultUrl != '')
                                    episodeSources.sources.push({
                                        url: defaultUrl,
                                        quality: `default`,
                                        isM3U8: defaultUrl.includes('.m3u8'),
                                    });
                            }
                            else {
                                throw new Error('BuiltIn server not found');
                            }
                        });
                        if (defaultUrl != '' && !defaultUrl.includes('.mp4')) {
                            const options = {
                                headers: {
                                    Referer: url,
                                },
                            };
                            const m3u8Content = await this.client.get(defaultUrl, options);
                            if (m3u8Content.data.includes('EXTM3U')) {
                                const videoList = m3u8Content.data.split('#EXT-X-STREAM-INF:');
                                for (const video of videoList !== null && videoList !== void 0 ? videoList : []) {
                                    if (video.includes('BANDWIDTH')) {
                                        const url = video.split('\n')[1];
                                        const quality = video.split('RESOLUTION=')[1].split('\n')[0].split('x')[1];
                                        const path = defaultUrl.replace(/\/[^/]*\.m3u8$/, '/');
                                        episodeSources.sources.push({
                                            url: path + url,
                                            quality: `${quality.split(',')[0]}p`,
                                            isM3U8: true,
                                        });
                                    }
                                }
                            }
                        }
                    }
                    catch (err) {
                        throw new Error(err.message);
                    }
                    return {
                        headers: {
                            Referer: uri.origin,
                        },
                        ...episodeSources,
                    };
            }
        };
        /**
         *
         * @param id Anime id
         * @param episodeId Episode id
         */
        this.fetchEpisodeServers = async (id, episodeId) => {
            const url = `${this.baseUrl}/anime/${id}/${episodeId}`;
            const res = await this.client.get(url);
            const $ = (0, cheerio_1.load)(res.data);
            const servers = [];
            $($('.ani-server-type-pad')[0])
                .find('.server')
                .each((i, el) => {
                servers.push({
                    name: $(el).text().trim(),
                    url: $(el).attr('data-video'),
                });
            });
            return servers;
        };
        /**
         *
         * @param id Anime id
         * @param episodeId Episode id
         * @param type Type (optional) (options: `sub`, `dub`, `raw`)
         */
        this.fetchEpisodeServerType = async (id, episodeId, type) => {
            const url = `${this.baseUrl}/anime/${id}/${episodeId}`;
            const res = await this.client.get(url);
            const $ = (0, cheerio_1.load)(res.data);
            const subs = [];
            const dubs = [];
            const raw = [];
            $('.ani-server-type-pad').each((index, element) => {
                $(element)
                    .find('.server')
                    .each((i, el) => {
                    const serverData = {
                        name: $(el).text().trim(),
                        url: $(el).attr('data-video'),
                    };
                    const dataType = $(el).attr('data-typesv').split('-')[0];
                    if (dataType === 'SUB') {
                        subs.push(serverData);
                    }
                    else if (dataType === 'DUB') {
                        dubs.push(serverData);
                    }
                    else if (dataType === 'RAW') {
                        raw.push(serverData);
                    }
                });
            });
            if (!type) {
                return { sub: subs, dub: dubs, raw: raw };
            }
            // Utilizando un string para seleccionar el tipo
            if (type.toUpperCase() === 'SUB') {
                return subs;
            }
            else if (type.toUpperCase() === 'DUB') {
                return dubs;
            }
            else if (type.toUpperCase() === 'RAW') {
                return raw;
            }
            else {
                throw new Error('Invalid server type');
            }
        };
        this.baseUrl = customBaseURL
            ? customBaseURL.startsWith('http://') || customBaseURL.startsWith('https://')
                ? customBaseURL
                : `http://${customBaseURL}`
            : this.baseUrl;
    }
}
exports.default = Anix;
//# sourceMappingURL=anix.js.map