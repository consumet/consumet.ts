"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
class AnimeUnity extends models_1.AnimeParser {
    constructor() {
        super(...arguments);
        this.name = 'AnimeUnity';
        this.baseUrl = 'https://www.animeunity.to';
        this.logo = 'https://www.animeunity.to/favicon-32x32.png';
        this.classPath = 'ANIME.AnimeUnity';
        /**
         * @param query Search query
         */
        this.search = async (query) => {
            try {
                const res = await this.client.get(`${this.baseUrl}/archivio?title=${query}`);
                const $ = (0, cheerio_1.load)(res.data);
                if (!$)
                    return { results: [] };
                const items = JSON.parse('' + $('archivio').attr('records') + '');
                const searchResult = {
                    hasNextPage: false,
                    results: [],
                };
                for (const i in items) {
                    searchResult.results.push({
                        id: `${items[i].id}-${items[i].slug}`,
                        title: items[i].title ?? items[i].title_eng,
                        url: `${this.baseUrl}/anime/${items[i].id}-${items[i].slug}`,
                        image: items[i].imageurl,
                        cover: items[i].imageurl_cover,
                        rating: parseFloat(items[i].score),
                        releaseDate: items[i].date,
                        subOrDub: `${items[i].dub ? models_1.SubOrSub.DUB : models_1.SubOrSub.SUB}`,
                    });
                }
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
        this.fetchAnimeInfo = async (id, page = 1) => {
            const url = `${this.baseUrl}/anime/${id}`;
            const episodesPerPage = 120;
            const lastPageEpisode = page * episodesPerPage;
            const firstPageEpisode = lastPageEpisode - 119;
            const url2 = `${this.baseUrl}/info_api/${id}/1?start_range=${firstPageEpisode}&end_range=${lastPageEpisode}`;
            try {
                const res = await this.client.get(url);
                const $ = (0, cheerio_1.load)(res.data);
                const totalEpisodes = parseInt($('video-player')?.attr('episodes_count') ?? '0');
                const totalPages = Math.round(totalEpisodes / 120) + 1;
                if (page < 1 || page > totalPages)
                    throw new Error(`Argument 'page' for ${id} must be between 1 and ${totalPages}! (You passed ${page})`);
                const animeInfo = {
                    currentPage: page,
                    hasNextPage: totalPages > page,
                    totalPages: totalPages,
                    id: id,
                    title: $('h1.title')?.text().trim(),
                    url: url,
                    alID: $('.banner')?.attr('style')?.split('/')?.pop()?.split('-')[0],
                    genres: $('.info-wrapper.pt-3.pb-3 small')
                        ?.map((_, element) => {
                        return $(element).text().replace(',', '').trim();
                    })
                        .toArray() ?? undefined,
                    totalEpisodes: totalEpisodes,
                    image: $('img.cover')?.attr('src'),
                    cover: $('.banner')?.attr('src') ?? $('.banner')?.attr('style')?.replace('background: url(', ''),
                    description: $('.description').text().trim(),
                    episodes: [],
                };
                const res2 = await this.client.get(url2);
                const items = res2.data.episodes;
                for (const i in items) {
                    animeInfo.episodes?.push({
                        id: `${id}/${items[i].id}`,
                        number: parseInt(items[i].number),
                        url: `${url}/${items[i].id}`,
                    });
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
            try {
                const res = await this.client.get(`${this.baseUrl}/anime/${episodeId}`);
                const $ = (0, cheerio_1.load)(res.data);
                const episodeSources = {
                    sources: [],
                };
                const streamUrl = $('video-player').attr('embed_url');
                if (streamUrl) {
                    const res = await this.client.get(streamUrl);
                    const $ = (0, cheerio_1.load)(res.data);
                    const domain = $('script:contains("window.video")')
                        .text()
                        ?.match(/url: '(.*)'/)[1];
                    const token = $('script:contains("window.video")')
                        .text()
                        ?.match(/token': '(.*)'/)[1];
                    const expires = $('script:contains("window.video")')
                        .text()
                        ?.match(/expires': '(.*)'/)[1];
                    const defaultUrl = `${domain}${domain.includes('?') ? '&' : '?'}token=${token}&referer=&expires=${expires}&h=1`;
                    const m3u8Content = await this.client.get(defaultUrl);
                    if (m3u8Content.data.includes('EXTM3U')) {
                        const videoList = m3u8Content.data.split('#EXT-X-STREAM-INF:');
                        for (const video of videoList ?? []) {
                            if (video.includes('BANDWIDTH')) {
                                const url = video.split('\n')[1];
                                const quality = video.split('RESOLUTION=')[1].split('\n')[0].split('x')[1];
                                episodeSources.sources.push({
                                    url: url,
                                    quality: `${quality}p`,
                                    isM3U8: true,
                                });
                            }
                        }
                    }
                    episodeSources.sources.push({
                        url: defaultUrl,
                        quality: `default`,
                        isM3U8: true,
                    });
                    episodeSources.download = $('script:contains("window.downloadUrl ")')
                        .text()
                        ?.match(/downloadUrl = '(.*)'/)[1]
                        ?.toString();
                }
                return episodeSources;
            }
            catch (err) {
                throw new Error(err.message);
            }
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
exports.default = AnimeUnity;
//# sourceMappingURL=animeunity.js.map