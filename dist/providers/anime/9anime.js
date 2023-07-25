"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const extractors_1 = require("../../extractors");
const utils_1 = require("../../utils");
/**
 * **Use at your own risk :)** 9anime devs keep changing the keys every week
 */
class NineAnime extends models_1.AnimeParser {
    constructor(nineAnimeResolver, proxyConfig, apiKey, adapter) {
        super(proxyConfig, adapter);
        this.name = '9Anime';
        this.nineAnimeResolver = '';
        this.apiKey = '';
        this.baseUrl = 'https://9anime.pl';
        this.logo = 'https://d1nxzqpcg2bym0.cloudfront.net/google_play/com.my.nineanime/87b2fe48-9c36-11eb-8292-21241b1c199b/128x128';
        this.classPath = 'ANIME.NineAnime';
        this.isWorking = false;
        this.nineAnimeResolver = nineAnimeResolver !== null && nineAnimeResolver !== void 0 ? nineAnimeResolver : this.nineAnimeResolver;
        this.apiKey = apiKey !== null && apiKey !== void 0 ? apiKey : this.apiKey;
    }
    async search(query, page = 1) {
        const searchResult = {
            currentPage: page,
            hasNextPage: false,
            results: [],
        };
        try {
            const vrf = await this.searchVrf(query);
            const res = await this.client.get(`${this.baseUrl}/filter?keyword=${encodeURIComponent(query).replace(/%20/g, '+')}&vrf=${encodeURIComponent(vrf)}&page=${page}`);
            const $ = (0, cheerio_1.load)(res.data);
            searchResult.hasNextPage =
                $(`ul.pagination`).length > 0
                    ? $('ul.pagination > li').last().hasClass('disabled')
                        ? false
                        : true
                    : false;
            $('#list-items > div.item').each((i, el) => {
                var _a;
                let type = undefined;
                switch ($(el).find('div > div.ani > a > div.meta > div > div.right').text().trim()) {
                    case 'MOVIE':
                        type = models_1.MediaFormat.MOVIE;
                        break;
                    case 'TV':
                        type = models_1.MediaFormat.TV;
                        break;
                    case 'OVA':
                        type = models_1.MediaFormat.OVA;
                        break;
                    case 'SPECIAL':
                        type = models_1.MediaFormat.SPECIAL;
                        break;
                    case 'ONA':
                        type = models_1.MediaFormat.ONA;
                        break;
                    case 'MUSIC':
                        type = models_1.MediaFormat.MUSIC;
                        break;
                }
                searchResult.results.push({
                    id: (_a = $(el).find('div > div.ani > a').attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[2],
                    title: $(el).find('div > div.info > div.b1 > a').text(),
                    url: `${this.baseUrl}${$(el).find('div > div.ani > a').attr('href')}`,
                    image: $(el).find('div > div.ani > a > img').attr('src'),
                    type: type,
                    hasSub: $(el).find('div > div.ani > a .meta .sub').length > 0,
                    hasDub: $(el).find('div > div.ani > a .meta .dub').length > 0,
                });
            });
            return searchResult;
        }
        catch (err) {
            throw new Error(err.message);
        }
    }
    async fetchAnimeInfo(animeUrl) {
        var _a, _b, _c, _d, _e;
        if (!animeUrl.startsWith(this.baseUrl))
            animeUrl = `${this.baseUrl}/watch/${animeUrl}`;
        const animeInfo = {
            id: '',
            title: '',
            url: animeUrl,
        };
        try {
            const res = await this.client.get(animeUrl);
            const $ = (0, cheerio_1.load)(res.data);
            animeInfo.id = new URL(`${this.baseUrl}/animeUrl`).pathname.split('/')[2];
            animeInfo.title = $('h1.title').text();
            animeInfo.jpTitle = $('h1.title').attr('data-jp');
            animeInfo.genres = Array.from($('div.meta:nth-child(1) > div:nth-child(5) > span > a').map((i, el) => $(el).text()));
            animeInfo.image = $('.binfo > div.poster > span > img').attr('src');
            animeInfo.description = (_a = $('.content').text()) === null || _a === void 0 ? void 0 : _a.trim();
            switch ($('div.meta:nth-child(1) > div:nth-child(1) > span:nth-child(1) > a').text()) {
                case 'MOVIE':
                    animeInfo.type = models_1.MediaFormat.MOVIE;
                    break;
                case 'TV':
                    animeInfo.type = models_1.MediaFormat.TV;
                    break;
                case 'OVA':
                    animeInfo.type = models_1.MediaFormat.OVA;
                    break;
                case 'SPECIAL':
                    animeInfo.type = models_1.MediaFormat.SPECIAL;
                    break;
                case 'ONA':
                    animeInfo.type = models_1.MediaFormat.ONA;
                    break;
                case 'MUSIC':
                    animeInfo.type = models_1.MediaFormat.MUSIC;
                    break;
            }
            animeInfo.studios = Array.from($('div.meta:nth-child(1) > div:nth-child(2) > span:nth-child(1) > a').map((i, el) => { var _a; return (_a = $(el).text()) === null || _a === void 0 ? void 0 : _a.trim(); }));
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
            animeInfo.hasSub = $('div#w-info > .binfo > .info > .meta .sub').length == 1;
            animeInfo.hasDub = $('div#w-info > .binfo > .info > .meta .dub').length == 1;
            const id = $('#watch-main').attr('data-id');
            const vrf = await this.ev(id);
            const { data: { result }, } = await this.client.get(`${this.baseUrl}/ajax/episode/list/${id}?vrf=${encodeURIComponent(vrf)}`);
            const $$ = (0, cheerio_1.load)(result);
            animeInfo.totalEpisodes = $$('div.episodes > ul > li > a').length;
            animeInfo.episodes = [];
            const episodes = [];
            $$('div.episodes > ul > li > a').map((i, el) => {
                $$(el)
                    .map((i, el) => {
                    var _a, _b;
                    const possibleIds = (_a = $$(el).attr('data-ids')) === null || _a === void 0 ? void 0 : _a.split(',');
                    const number = parseInt((_b = $$(el).attr('data-num')) === null || _b === void 0 ? void 0 : _b.toString());
                    const title = $$(el).find('span').text().length > 0 ? $$(el).find('span').text() : undefined;
                    const isFiller = $$(el).hasClass('filler');
                    episodes.push({
                        id: possibleIds[0],
                        dubId: possibleIds[1],
                        number: number,
                        title: title,
                        isFiller: isFiller,
                    });
                })
                    .get();
            });
            (_e = animeInfo.episodes) === null || _e === void 0 ? void 0 : _e.push(...episodes);
            return animeInfo;
        }
        catch (err) {
            console.log(err);
            throw new Error(err.message);
        }
    }
    async fetchEpisodeSources(episodeId, server = models_1.StreamingServers.VizCloud) {
        var _a, _b, _c, _d, _e, _f;
        if (episodeId.startsWith('http')) {
            const serverUrl = new URL(episodeId);
            switch (server) {
                case models_1.StreamingServers.StreamTape:
                    return {
                        headers: { Referer: serverUrl.href, 'User-Agent': utils_1.USER_AGENT },
                        sources: await new extractors_1.StreamTape().extract(serverUrl),
                    };
                case models_1.StreamingServers.VizCloud:
                case models_1.StreamingServers.VidCloud:
                    return {
                        headers: { Referer: serverUrl.href, 'User-Agent': utils_1.USER_AGENT },
                        sources: await new extractors_1.VizCloud().extract(serverUrl, this.nineAnimeResolver, this.apiKey),
                    };
                case models_1.StreamingServers.MyCloud:
                    return {
                        headers: { Referer: serverUrl.href, 'User-Agent': utils_1.USER_AGENT },
                        sources: await new extractors_1.VizCloud().extract(serverUrl, this.nineAnimeResolver, this.apiKey),
                    };
                case models_1.StreamingServers.Filemoon:
                    return {
                        headers: { Referer: serverUrl.href, 'User-Agent': utils_1.USER_AGENT },
                        sources: await new extractors_1.Filemoon().extract(serverUrl),
                    };
                default:
                    throw new Error('Server not supported');
            }
        }
        try {
            const servers = await this.fetchEpisodeServers(episodeId);
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
                case models_1.StreamingServers.Filemoon:
                    s = servers.find(s => s.name === 'filemoon');
                    if (!s)
                        throw new Error('Filemoon server found');
                    break;
                default:
                    throw new Error('Server not found');
            }
            const serverVrf = (await this.client.get(`${this.nineAnimeResolver}/vrf?query=${encodeURIComponent(s.url)}&apikey=${this.apiKey}`)).data.url;
            const serverSource = (await this.client.get(`${this.baseUrl}/ajax/server/${s.url}?vrf=${encodeURIComponent(serverVrf)}`)).data;
            const embedURL = (await this.client.get(`${this.nineAnimeResolver}/decrypt?query=${encodeURIComponent(serverSource.result.url)}&apikey=${this.apiKey}`)).data.url;
            if (embedURL.startsWith('http')) {
                const response = await this.fetchEpisodeSources(embedURL, server);
                response.embedURL = embedURL;
                response.intro = {
                    start: (_c = (_b = (_a = serverSource === null || serverSource === void 0 ? void 0 : serverSource.result) === null || _a === void 0 ? void 0 : _a.skip_data) === null || _b === void 0 ? void 0 : _b.intro_begin) !== null && _c !== void 0 ? _c : 0,
                    end: (_f = (_e = (_d = serverSource === null || serverSource === void 0 ? void 0 : serverSource.result) === null || _d === void 0 ? void 0 : _d.skip_data) === null || _e === void 0 ? void 0 : _e.intro_end) !== null && _f !== void 0 ? _f : 0,
                };
                return response;
            }
            else {
                throw new Error('Server did not respond correctly');
            }
        }
        catch (err) {
            throw new Error(err.message);
        }
    }
    async fetchEpisodeServers(episodeId) {
        if (!episodeId.startsWith(this.baseUrl))
            episodeId = `${this.baseUrl}/ajax/server/list/${episodeId}?vrf=${encodeURIComponent(await this.ev(episodeId))}`;
        const { data: { result }, } = await this.client.get(episodeId);
        const $ = (0, cheerio_1.load)(result);
        const servers = [];
        $('.type > ul > li').each((i, el) => {
            const serverId = $(el).attr('data-link-id');
            servers.push({
                name: $(el).text().toLocaleLowerCase(),
                url: `${serverId}`,
            });
        });
        return servers;
    }
    async ev(query, raw = false) {
        const { data } = await this.client.get(`${this.nineAnimeResolver}/vrf?query=${encodeURIComponent(query)}&apikey=${this.apiKey}`);
        if (raw) {
            return data;
        }
        else {
            return data.url;
        }
    }
    async searchVrf(query, raw = false) {
        const { data } = await this.client.get(`${this.nineAnimeResolver}/9anime-search?query=${encodeURIComponent(query)}&apikey=${this.apiKey}`);
        if (raw) {
            return data;
        }
        else {
            return data.url;
        }
    }
    async decrypt(query, raw = false) {
        const { data } = await this.client.get(`${this.nineAnimeResolver}/decrypt?query=${encodeURIComponent(query)}&apikey=${this.apiKey}`);
        if (raw) {
            return data;
        }
        else {
            return data.url;
        }
    }
    async vizcloud(query) {
        const { data } = await this.client.get(`${this.nineAnimeResolver}/vizcloud?query=${encodeURIComponent(query)}&apikey=${this.apiKey}`);
        return data;
    }
    async customRequest(query, action) {
        const { data } = await this.client.get(`${this.nineAnimeResolver}/${action}?query=${encodeURIComponent(query)}&apikey=${this.apiKey}`);
        return data;
    }
}
// (async () => {
//   // const nineAnime = new NineAnime();
//   // const searchResults = await nineAnime.search('attack on titan');
//   // const animeInfo = await nineAnime.fetchAnimeInfo('shadowverse-flame.rljqn');
//   // @ts-ignore
//   // const episodeSources = await nineAnime.fetchEpisodeSources("ab68", "decrypt");
//   // console.log(await nineAnime.vizcloud("LNPEK8Q0QPXW"));
//   // console.log(await nineAnime.decrypt("ab6/", true));
//   // console.log(await nineAnime.customRequest("LNPEK8Q0QPXW", "9anime-search"));
// })();
exports.default = NineAnime;
//# sourceMappingURL=9anime.js.map