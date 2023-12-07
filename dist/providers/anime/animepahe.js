"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const extractors_1 = require("../../extractors");
class AnimePahe extends models_1.AnimeParser {
    constructor() {
        super(...arguments);
        this.name = 'AnimePahe';
        this.baseUrl = 'https://animepahe.com';
        this.logo = 'https://animepahe.com/pikacon.ico';
        this.classPath = 'ANIME.AnimePahe';
        // private readonly sgProxy = 'https://cors.consumet.stream';
        /**
         * @param query Search query
         */
        this.search = async (query) => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/api?m=search&q=${encodeURIComponent(query)}`);
                const res = {
                    results: data.data.map((item) => ({
                        id: `${item.id}/${item.session}`,
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
         * @param id id format id/session
         * @param episodePage Episode page number (optional) default: -1 to get all episodes. number of episode pages can be found in the anime info object
         */
        this.fetchAnimeInfo = async (id, episodePage = -1) => {
            const animeInfo = {
                id: id,
                title: '',
            };
            try {
                const res = await this.client.get(`${this.baseUrl}/anime/${id.split('/')[1]}?anime_id=${id.split('/')[0]}`);
                const $ = (0, cheerio_1.load)(res.data);
                animeInfo.title = $('div.title-wrapper > h1 > span').first().text();
                animeInfo.image = $('div.anime-poster a').attr('href');
                animeInfo.cover = `https:${$('div.anime-cover').attr('data-src')}`;
                animeInfo.description = $('div.anime-summary').text();
                animeInfo.genres = $('div.anime-genre ul li')
                    .map((i, el) => $(el).find('a').attr('title'))
                    .get();
                switch ($('div.col-sm-4.anime-info p:icontains("Status:") a').text().trim()) {
                    case 'Currently Airing':
                        animeInfo.status = models_1.MediaStatus.ONGOING;
                        break;
                    case 'Finished Airing':
                        animeInfo.status = models_1.MediaStatus.COMPLETED;
                        break;
                    default:
                        animeInfo.status = models_1.MediaStatus.UNKNOWN;
                }
                animeInfo.type = $('div.col-sm-4.anime-info > p:nth-child(2) > a')
                    .text()
                    .trim()
                    .toUpperCase();
                animeInfo.releaseDate = $('div.col-sm-4.anime-info > p:nth-child(5)')
                    .text()
                    .split('to')[0]
                    .replace('Aired:', '')
                    .trim();
                animeInfo.aired = $('div.col-sm-4.anime-info > p:nth-child(5)')
                    .text()
                    .replace('Aired:', '')
                    .trim()
                    .replace('\n', ' ');
                animeInfo.studios = $('div.col-sm-4.anime-info > p:nth-child(7)')
                    .text()
                    .replace('Studio:', '')
                    .trim()
                    .split('\n');
                animeInfo.totalEpisodes = parseInt($('div.col-sm-4.anime-info > p:nth-child(3)').text().replace('Episodes:', ''));
                animeInfo.episodes = [];
                if (episodePage < 0) {
                    const { data: { last_page, data }, } = await this.client.get(`${this.baseUrl}/api?m=release&id=${id.split('/')[1]}&sort=episode_asc&page=1`);
                    animeInfo.episodePages = last_page;
                    animeInfo.episodes.push(...data.map((item) => ({
                        id: `${id.split('/')[1]}/${item.session}`,
                        number: item.episode,
                        title: item.title,
                        image: item.snapshot,
                        duration: item.duration,
                        url: `${this.baseUrl}/play/${id.split('/')[1]}/${item.session}`,
                    })));
                    for (let i = 1; i < last_page; i++) {
                        animeInfo.episodes.push(...(await this.fetchEpisodes(id.split('/')[1], i + 1)));
                    }
                }
                else {
                    animeInfo.episodes.push(...(await this.fetchEpisodes(id.split('/')[1], episodePage)));
                }
                return animeInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         *
         * @param episodeId episode id
         */
        this.fetchEpisodeSources = async (episodeId) => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/play/${episodeId}`, {
                    headers: {
                        Referer: `${this.baseUrl}`,
                    },
                });
                const $ = (0, cheerio_1.load)(data);
                const links = $('div#resolutionMenu > button').map((i, el) => ({
                    url: $(el).attr('data-src'),
                    quality: $(el).text(),
                    audio: $(el).attr('data-audio'),
                }));
                const iSource = {
                    headers: {
                        Referer: 'https://kwik.cx/',
                    },
                    sources: [],
                };
                for (const link of links) {
                    const res = await new extractors_1.Kwik(this.proxyConfig).extract(new URL(link.url));
                    res[0].quality = link.quality;
                    res[0].isDub = link.audio === 'eng';
                    iSource.sources.push(res[0]);
                }
                return iSource;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchEpisodes = async (session, page) => {
            const res = await this.client.get(`${this.baseUrl}/api?m=release&id=${session}&sort=episode_asc&page=${page}`);
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
         * @deprecated
         * @attention AnimePahe doesn't support this method
         */
        this.fetchEpisodeServers = (episodeLink) => {
            throw new Error('Method not implemented.');
        };
    }
}
exports.default = AnimePahe;
// (async () => {
//   const animepahe = new AnimePahe();
//
//   const anime = await animepahe.search('Classroom of the elite');
//   const info = await animepahe.fetchAnimeInfo(anime.results[0].id);
//   const sources = await animepahe.fetchEpisodeSources(info.episodes![0].id);
//   console.log(sources);
// })();
//# sourceMappingURL=animepahe.js.map