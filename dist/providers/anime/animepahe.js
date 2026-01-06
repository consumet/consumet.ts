"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const utils_1 = require("../../utils");
const extractors_1 = require("../../extractors");
class AnimePahe extends models_1.AnimeParser {
    constructor() {
        super(...arguments);
        this.name = 'AnimePahe';
        this.baseUrl = 'https://animepahe.si';
        this.logo = 'https://animepahe.com/pikacon.ico';
        this.classPath = 'ANIME.AnimePahe';
        /**
         * Search for anime
         * @param query Search query string
         * @returns Promise<ISearch<IAnimeResult>>
         */
        this.search = async (query) => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/api?m=search&q=${encodeURIComponent(query)}`, {
                    headers: this.Headers(false),
                });
                const res = {
                    results: data.data.map((item) => ({
                        id: item.session,
                        title: item.title,
                        image: item.poster,
                        rating: item.score,
                        releaseDate: item.year,
                        type: item.type,
                    })),
                };
                return res;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * Fetch anime information
         * @param id Anime ID in format id/session
         * @param episodePage Episode page number (default: -1 for all episodes)
         * @returns Promise<IAnimeInfo>
         */
        this.fetchAnimeInfo = async (id, episodePage = -1) => {
            const animeInfo = {
                id: id,
                title: '',
            };
            try {
                const res = await this.client.get(`${this.baseUrl}/anime/${id}`, { headers: this.Headers(id) });
                const $ = (0, cheerio_1.load)(res.data);
                animeInfo.title = $('div.title-wrapper > h1 > span').first().text();
                animeInfo.image = $('div.anime-poster a').attr('href');
                animeInfo.cover = `https:${$('div.anime-cover').attr('data-src')}`;
                animeInfo.description = $('div.anime-summary').text().trim();
                animeInfo.genres = $('div.anime-genre ul li')
                    .map((i, el) => $(el).find('a').attr('title'))
                    .get();
                animeInfo.hasSub = true;
                animeInfo.externalLinks = [];
                $('p.external-links > a').each((i, el) => {
                    var _a, _b;
                    const url = (_a = $(el).attr('href')) === null || _a === void 0 ? void 0 : _a.trim();
                    (_b = animeInfo.externalLinks) === null || _b === void 0 ? void 0 : _b.push({
                        id: (url === null || url === void 0 ? void 0 : url.includes('?')) ? url === null || url === void 0 ? void 0 : url.split('?')[1].split('=')[1] : url === null || url === void 0 ? void 0 : url.split('/').pop(),
                        url: url,
                        sourceName: $(el).text().trim(),
                    });
                });
                switch ($('div.anime-info p:icontains("Status:") a').text().trim()) {
                    case 'Currently Airing':
                        animeInfo.status = models_1.MediaStatus.ONGOING;
                        break;
                    case 'Finished Airing':
                        animeInfo.status = models_1.MediaStatus.COMPLETED;
                        break;
                    default:
                        animeInfo.status = models_1.MediaStatus.UNKNOWN;
                }
                animeInfo.type = $('div.anime-info > p:contains("Type:") > a')
                    .text()
                    .trim()
                    .toUpperCase();
                animeInfo.releaseDate = $('div.anime-info > p:contains("Aired:")')
                    .text()
                    .split('to')[0]
                    .replace('Aired:', '')
                    .trim();
                animeInfo.studios = $('div.anime-info > p:contains("Studio:")')
                    .text()
                    .replace('Studio:', '')
                    .trim()
                    .split('\n');
                animeInfo.totalEpisodes = parseInt($('div.anime-info > p:contains("Episodes:")').text().replace('Episodes:', ''));
                animeInfo.recommendations = [];
                $('div.anime-recommendation .col-sm-6').each((i, el) => {
                    var _a, _b, _c;
                    (_a = animeInfo.recommendations) === null || _a === void 0 ? void 0 : _a.push({
                        id: (_b = $(el).find('.col-2 > a').attr('href')) === null || _b === void 0 ? void 0 : _b.split('/')[2],
                        title: $(el).find('.col-2 > a').attr('title'),
                        image: $(el).find('.col-2 > a > img').attr('src') || $(el).find('.col-2 > a > img').attr('data-src'),
                        url: `${this.baseUrl}/anime/${(_c = $(el).find('.col-2 > a').attr('href')) === null || _c === void 0 ? void 0 : _c.split('/')[2]}`,
                        releaseDate: $(el).find('div.col-9 > a').text().trim(),
                        status: $(el).find('div.col-9 > strong').text().trim(),
                    });
                });
                animeInfo.relations = [];
                $('div.anime-relation .col-sm-6').each((i, el) => {
                    var _a, _b, _c;
                    (_a = animeInfo.relations) === null || _a === void 0 ? void 0 : _a.push({
                        id: (_b = $(el).find('.col-2 > a').attr('href')) === null || _b === void 0 ? void 0 : _b.split('/')[2],
                        title: $(el).find('.col-2 > a').attr('title'),
                        image: $(el).find('.col-2 > a > img').attr('src') || $(el).find('.col-2 > a > img').attr('data-src'),
                        url: `${this.baseUrl}/anime/${(_c = $(el).find('.col-2 > a').attr('href')) === null || _c === void 0 ? void 0 : _c.split('/')[2]}`,
                        releaseDate: $(el).find('div.col-9 > a').text().trim(),
                        status: $(el).find('div.col-9 > strong').text().trim(),
                        relationType: $(el).find('h4 > span').text().trim(),
                    });
                });
                animeInfo.episodes = [];
                if (episodePage < 0) {
                    const { data: { last_page, data }, } = await this.client.get(`${this.baseUrl}/api?m=release&id=${id}&sort=episode_asc&page=1`, {
                        headers: this.Headers(id),
                    });
                    animeInfo.episodePages = last_page;
                    animeInfo.episodes.push(...data.map((item) => ({
                        id: `${id}/${item.session}`,
                        number: item.episode,
                        title: item.title,
                        image: item.snapshot,
                        duration: item.duration,
                        url: `${this.baseUrl}/play/${id}/${item.session}`,
                    })));
                    for (let i = 1; i < last_page; i++) {
                        animeInfo.episodes.push(...(await this.fetchEpisodes(id, i + 1)));
                    }
                }
                else {
                    animeInfo.episodes.push(...(await this.fetchEpisodes(id, episodePage)));
                }
                return animeInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * Fetch episode video sources
         * @param episodeId Episode ID
         * @returns Promise<ISource>
         */
        this.fetchEpisodeSources = async (episodeId) => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/play/${episodeId}`, {
                    headers: this.Headers(episodeId.split('/')[0]),
                });
                const $ = (0, cheerio_1.load)(data);
                const links = $('div#resolutionMenu > button').map((i, el) => ({
                    url: $(el).attr('data-src'),
                    quality: $(el).text(),
                    audio: $(el).attr('data-audio'),
                }));
                const downloads = $('div#pickDownload > a')
                    .map((i, el) => ({
                    url: $(el).attr('href'),
                    quality: $(el).text(),
                }))
                    .get();
                const iSource = {
                    headers: {
                        Referer: 'https://kwik.cx/',
                    },
                    sources: [],
                };
                // more link, more slow
                for (const link of links) {
                    const res = await new extractors_1.Kwik(this.proxyConfig).extract(new URL(link.url));
                    res[0].quality = link.quality;
                    res[0].isDub = link.audio === 'eng';
                    iSource.sources.push(res[0]);
                }
                iSource.download = [];
                for (const download of downloads) {
                    const res = await new extractors_1.Kwik(this.proxyConfig).getDirectDownloadLink(new URL(download.url));
                    iSource.download.push({
                        url: res,
                        quality: download.quality,
                    });
                }
                return iSource;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchEpisodes = async (session, page) => {
            const res = await this.client.get(`${this.baseUrl}/api?m=release&id=${session}&sort=episode_asc&page=${page}`, { headers: this.Headers(session) });
            const epData = res.data.data;
            return [
                ...epData.map((item) => ({
                    id: `${session}/${item.session}`,
                    number: item.episode,
                    title: item.title,
                    image: item.snapshot,
                    duration: item.duration,
                    url: `${this.baseUrl}/play/${session}/${item.session}`,
                })),
            ];
        };
        /**
         * Fetch episode servers (deprecated)
         * @deprecated AnimePahe doesn't support this method
         * @param episodeLink Episode link
         * @returns Promise<IEpisodeServer[]>
         */
        this.fetchEpisodeServers = (episodeLink) => {
            throw new Error('Method not implemented.');
        };
    }
    /**
     * @param page page number (optional)
     * @returns Promise<ISearch<IAnimeResult>>
     */
    async fetchRecentEpisodes(page = 1) {
        try {
            const { data } = await this.client.get(`${this.baseUrl}/api?m=airing&page=${page}`, {
                headers: this.Headers(false),
            });
            const res = {
                currentPage: data.current_page,
                totalResults: data.total,
                totalPages: data.last_page,
                results: data.data.map((item) => ({
                    id: item.anime_session,
                    title: item.anime_title,
                    episodeId: `${item.anime_session}/${item.session}`,
                    episodeImage: item.snapshot,
                    episodeNumber: item.episode,
                    url: `${this.baseUrl}/play/${item.anime_session}/${item.session}`,
                })),
            };
            return res;
        }
        catch (err) {
            throw new Error(err.message);
        }
    }
    Headers(sessionId) {
        return {
            authority: 'animepahe.si',
            accept: 'application/json, text/javascript, */*; q=0.01',
            'accept-language': 'en-US,en;q=0.9',
            cookie: '__ddg2_=;',
            dnt: '1',
            'sec-ch-ua': '"Not A(Brand";v="99", "Microsoft Edge";v="121", "Chromium";v="121"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'x-requested-with': 'XMLHttpRequest',
            referer: sessionId ? `${this.baseUrl}/anime/${sessionId}` : `${this.baseUrl}`,
            'user-agent': utils_1.USER_AGENT,
        };
    }
}
exports.default = AnimePahe;
//# sourceMappingURL=animepahe.js.map