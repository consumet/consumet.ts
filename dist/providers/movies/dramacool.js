"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const extractors_1 = require("../../extractors");
class DramaCool extends models_1.MovieParser {
    constructor() {
        super(...arguments);
        this.name = 'DramaCool';
        this.baseUrl = 'https://dramacool.bg';
        this.logo = 'https://play-lh.googleusercontent.com/IaCb2JXII0OV611MQ-wSA8v_SAs9XF6E3TMDiuxGGXo4wp9bI60GtDASIqdERSTO5XU';
        this.classPath = 'MOVIES.DramaCool';
        this.supportedTypes = new Set([models_1.TvType.MOVIE, models_1.TvType.TVSERIES]);
        /**
         * Search for dramas by query
         * @param query search query string
         * @param page page number (default 1)
         */
        this.search = async (query, page = 1) => {
            try {
                const sanitizedQuery = query.replace(/[\W_]+/g, '+');
                const { data } = await this.client.get(`${this.baseUrl}/search?type=drama&keyword=${sanitizedQuery}&page=${page}`);
                const $ = (0, cheerio_1.load)(data);
                const searchResult = {
                    currentPage: page,
                    totalPages: page,
                    hasNextPage: false,
                    results: [],
                };
                this.setPaginationInfo($, searchResult, page);
                $('div.block > div.tab-content > ul.list-episode-item > li').each((_, el) => {
                    const $el = $(el);
                    const href = $el.find('a').attr('href');
                    searchResult.results.push({
                        id: href === null || href === void 0 ? void 0 : href.split(`${this.baseUrl}/`)[1],
                        title: $el.find('a > h3').text(),
                        url: href,
                        image: $el.find('a > img').attr('data-original'),
                    });
                });
                return searchResult;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * Fetch detailed media information
         * @param mediaId media link or id
         */
        this.fetchMediaInfo = async (mediaId) => {
            var _a;
            try {
                const normalizedId = mediaId;
                const url = mediaId.startsWith(this.baseUrl) ? mediaId : `${this.baseUrl}/${mediaId}`;
                const { data } = await this.client.get(url);
                const $ = (0, cheerio_1.load)(data);
                const mediaInfo = {
                    id: normalizedId,
                    title: $('.info > h1:nth-child(1)').text(),
                };
                // Status
                const status = $('div.details div.info p:contains("Status:")').find('a').first().text().trim();
                switch (status) {
                    case 'Ongoing':
                        mediaInfo.status = models_1.MediaStatus.ONGOING;
                        break;
                    case 'Completed':
                        mediaInfo.status = models_1.MediaStatus.COMPLETED;
                        break;
                    default:
                        mediaInfo.status = models_1.MediaStatus.UNKNOWN;
                        break;
                }
                // Genres
                mediaInfo.genres = [];
                $('div.details div.info p:contains("Genre:")').each((_, element) => {
                    $(element)
                        .find('a')
                        .each((_, anchor) => {
                        var _a;
                        (_a = mediaInfo.genres) === null || _a === void 0 ? void 0 : _a.push($(anchor).text());
                    });
                });
                // Basic info
                mediaInfo.otherNames = $('.other_name > a')
                    .map((_, el) => $(el).text().trim())
                    .get();
                mediaInfo.image = $('div.details > div.img > img').attr('src');
                mediaInfo.description = $('div.details div.info p:not(:has(*))')
                    .map((_, el) => $(el).text().trim())
                    .get()
                    .join('\n\n')
                    .trim();
                // Extracted fields
                mediaInfo.releaseDate = this.extractFieldValue($, 'Released');
                mediaInfo.contentRating = this.extractFieldValue($, 'Content Rating');
                mediaInfo.airsOn = this.extractFieldValue($, 'Airs On');
                mediaInfo.director = this.extractFieldValue($, 'Director');
                const network = this.extractFieldValue($, 'Original Network');
                mediaInfo.originalNetwork = this.cleanUpText(network);
                // Trailer
                const trailerIframe = $('div.trailer').find('iframe').attr('src');
                if (trailerIframe) {
                    mediaInfo.trailer = {
                        id: (_a = trailerIframe.split('embed/')[1]) === null || _a === void 0 ? void 0 : _a.split('?')[0],
                        url: trailerIframe,
                    };
                }
                // Episodes
                mediaInfo.episodes = [];
                $('div.content-left > div.block-tab > div > div > ul > li').each((_, el) => {
                    var _a;
                    const $el = $(el);
                    const href = $el.find('a').attr('href');
                    (_a = mediaInfo.episodes) === null || _a === void 0 ? void 0 : _a.push({
                        id: href === null || href === void 0 ? void 0 : href.split(`${this.baseUrl}/`)[1],
                        title: $el.find('h3').text().replace(mediaInfo.title.toString(), '').trim(),
                        episode: parseFloat(href === null || href === void 0 ? void 0 : href.split('-episode-')[1]),
                        subType: $el.find('span.type').text(),
                        releaseDate: $el.find('span.time').text(),
                        url: href,
                    });
                });
                mediaInfo.episodes.reverse();
                return mediaInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * Fetch episode sources from a specific server
         * @param episodeId episode id or URL
         * @param server streaming server type
         */
        this.fetchEpisodeSources = async (episodeId, server = models_1.StreamingServers.AsianLoad) => {
            if (episodeId.startsWith('http')) {
                return this.extractFromServer(episodeId, server);
            }
            try {
                const servers = await this.fetchEpisodeServers(episodeId);
                const serverData = servers.find(s => s.name.toLowerCase() === server.toLowerCase());
                if (!serverData) {
                    throw new Error(`Server ${server} not found`);
                }
                return await this.fetchEpisodeSources(serverData.url, server);
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * Fetch recently added movies
         * @param page page number (default 1)
         */
        this.fetchRecentMovies = async (page = 1) => {
            return this.fetchListContent(`${this.baseUrl}/recently-added/movie?page=${page}`, page);
        };
        /**
         * Fetch recently added TV shows
         * @param page page number (default 1)
         */
        this.fetchRecentTvShows = async (page = 1) => {
            return this.fetchListContent(`${this.baseUrl}/recently-added/drama?page=${page}`, page, true);
        };
        /**
         * Fetch popular dramas
         * @param page page number (default 1)
         */
        this.fetchPopular = async (page = 1) => {
            return this.fetchListContent(`${this.baseUrl}/popular-drama?page=${page}`, page);
        };
        /**
         * Fetch spotlight/featured content
         */
        this.fetchSpotlight = async () => {
            try {
                const { data } = await this.client.get(this.baseUrl);
                const $ = (0, cheerio_1.load)(data);
                const results = { results: [] };
                $('div.ls-slide').each((_, el) => {
                    const $el = $(el);
                    const href = $el.find('a').attr('href');
                    results.results.push({
                        id: href === null || href === void 0 ? void 0 : href.slice(1),
                        title: $el.find('img').attr('title'),
                        url: `${this.baseUrl}${href}`,
                        cover: $el.find('img').attr('src'),
                    });
                });
                return results;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
    /**
     * Fetch available episode servers
     * @param episodeId episode link or id
     */
    async fetchEpisodeServers(episodeId) {
        try {
            const url = `${this.baseUrl}/${episodeId}`;
            const { data } = await this.client.get(url);
            const $ = (0, cheerio_1.load)(data);
            const standardServer = $('div.anime_muti_link > ul > li.standard').attr('data-video');
            const serverUrl = this.normalizeUrl(standardServer);
            const { data: serversData } = await this.client.get(serverUrl);
            const $$ = (0, cheerio_1.load)(serversData);
            const serverBaseUrl = new URL(serverUrl).origin;
            const episodeServers = [];
            $$('div#list-server-more ul.list-server-items li.linkserver').each((_, el) => {
                const $el = $$(el);
                let name = $el.attr('data-provider');
                const server = $el.attr('data-video');
                if (name.includes('serverwithtoken')) {
                    name = models_1.StreamingServers.AsianLoad;
                }
                if (server) {
                    episodeServers.push({
                        name: name,
                        url: server.startsWith('//')
                            ? server.replace('//', 'https://')
                            : server.startsWith('/')
                                ? `${serverBaseUrl}${server}`
                                : server,
                    });
                }
            });
            return episodeServers;
        }
        catch (err) {
            throw new Error(err.message);
        }
    }
    /**
     * Fetch list content with pagination
     * @param url URL to fetch
     * @param page current page number
     * @param includeTvShowData whether to include TV show episode data
     */
    async fetchListContent(url, page, includeTvShowData = false) {
        try {
            const { data } = await this.client.get(url);
            const $ = (0, cheerio_1.load)(data);
            const results = {
                currentPage: page,
                totalPages: page,
                hasNextPage: false,
                results: [],
            };
            $('ul.switch-block.list-episode-item li').each((_, el) => {
                const $el = $(el);
                const href = $el.find('a').attr('href');
                const result = {
                    id: href === null || href === void 0 ? void 0 : href.split(`${this.baseUrl}/`)[1],
                    title: $el.find('h3.title').text().trim(),
                    url: href,
                    image: $el.find('img').attr('data-original'),
                };
                if (includeTvShowData) {
                    const episodeText = $el.find('span.ep').text().trim();
                    result.episodeNumber = parseFloat(episodeText.split(' ')[1]);
                }
                results.results.push(result);
            });
            this.setPaginationInfo($, results, page);
            return results;
        }
        catch (err) {
            throw new Error(err.message);
        }
    }
    /**
     * Extract sources from a streaming server
     * @param episodeUrl episode URL
     * @param server streaming server type
     */
    async extractFromServer(episodeUrl, server) {
        const serverUrl = new URL(episodeUrl);
        switch (server) {
            case models_1.StreamingServers.MixDrop:
                return {
                    headers: { Referer: serverUrl.origin },
                    sources: await new extractors_1.MixDrop(this.proxyConfig, this.adapter).extract(serverUrl),
                };
            case models_1.StreamingServers.StreamTape:
                return {
                    headers: { Referer: serverUrl.origin },
                    sources: await new extractors_1.StreamTape(this.proxyConfig, this.adapter).extract(serverUrl),
                };
            case models_1.StreamingServers.StreamWish:
                return {
                    headers: { Referer: serverUrl.origin },
                    ...(await new extractors_1.StreamWish(this.proxyConfig, this.adapter).extract(serverUrl)),
                };
            default:
                throw new Error('Server not supported');
        }
    }
    /**
     * Set pagination information from navigation element
     * @param $ cheerio instance
     * @param results results object to update
     * @param currentPage current page number
     */
    setPaginationInfo($, results, currentPage) {
        const navElement = $(DramaCool.NAV_SELECTOR);
        results.hasNextPage = navElement.length > 0 && !navElement.children().last().hasClass('selected');
        const lastPageHref = navElement.children().last().find('a').attr('href');
        if (lastPageHref === null || lastPageHref === void 0 ? void 0 : lastPageHref.includes('page=')) {
            const maxPage = new URLSearchParams(lastPageHref).get('page');
            results.totalPages = maxPage && !isNaN(parseInt(maxPage)) ? parseInt(maxPage) : currentPage + 1;
        }
        else if (results.hasNextPage) {
            results.totalPages = currentPage + 1;
        }
    }
    /**
     * Extract field value from media info page
     * @param $ cheerio instance
     * @param fieldName field name to extract
     */
    extractFieldValue($, fieldName) {
        const text = $(`div.details div.info p:contains("${fieldName}:")`).text();
        return this.removeContainsFromString(text, fieldName);
    }
    /**
     * Normalize URL by adding https:// prefix if needed
     * @param url URL to normalize
     */
    normalizeUrl(url) {
        return url.startsWith('//') ? url.replace('//', 'https://') : url;
    }
    /**
     * Generate download link from episode URL
     * @param url episode URL
     */
    generateDownloadLink(url) {
        return url.replace(/^(https:\/\/[^\/]+)\/[^?]+(\?.+)$/, '$1/download$2');
    }
    /**
     * Remove field label from extracted text
     * @param str text to clean
     * @param contains field label to remove
     */
    removeContainsFromString(str, contains) {
        const lowerContains = contains.toLowerCase();
        return str.toLowerCase().replace(/\n/g, '').replace(`${lowerContains}:`, '').trim();
    }
    /**
     * Clean up semicolon-separated text
     * @param str text to clean
     */
    cleanUpText(str) {
        return str
            .split(';')
            .map(part => part.trim())
            .filter(part => part.length > 0)
            .join('; ');
    }
}
DramaCool.NAV_SELECTOR = 'ul.pagination';
exports.default = DramaCool;
//# sourceMappingURL=dramacool.js.map