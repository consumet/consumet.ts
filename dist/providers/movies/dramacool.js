"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const extractors_1 = require("../../extractors");
class DramaCool extends models_1.MovieParser {
    constructor() {
        super(...arguments);
        this.name = 'DramaCool';
        this.baseUrl = 'https://dramacool.com.pa';
        this.logo = 'https://play-lh.googleusercontent.com/IaCb2JXII0OV611MQ-wSA8v_SAs9XF6E3TMDiuxGGXo4wp9bI60GtDASIqdERSTO5XU';
        this.classPath = 'MOVIES.DramaCool';
        this.supportedTypes = new Set([models_1.TvType.MOVIE, models_1.TvType.TVSERIES]);
        this.search = async (query, page = 1) => {
            try {
                const searchResult = {
                    currentPage: page,
                    totalPages: page,
                    hasNextPage: false,
                    results: [],
                };
                const { data } = await this.client.get(`${this.baseUrl}/search?keyword=${query.replace(/[\W_]+/g, '-')}&page=${page}`);
                const $ = (0, cheerio_1.load)(data);
                const navSelector = 'ul.pagination';
                searchResult.hasNextPage =
                    $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('selected') : false;
                const lastPage = $(navSelector).children().last().find('a').attr('href');
                if (lastPage != undefined && lastPage != "" && lastPage.includes("page=")) {
                    const maxPage = new URLSearchParams(lastPage).get("page");
                    if (maxPage != null && !isNaN(parseInt(maxPage)))
                        searchResult.totalPages = parseInt(maxPage);
                    else if (searchResult.hasNextPage)
                        searchResult.totalPages = page + 1;
                }
                else if (searchResult.hasNextPage)
                    searchResult.totalPages = page + 1;
                $('div.block > div.tab-content > ul.list-episode-item > li').each((i, el) => {
                    var _a;
                    searchResult.results.push({
                        id: (_a = $(el).find('a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1),
                        title: $(el).find('a > h3').text(),
                        url: `${this.baseUrl}${$(el).find('a').attr('href')}`,
                        image: $(el).find('a > img').attr('data-original'),
                    });
                });
                return searchResult;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchMediaInfo = async (mediaId) => {
            try {
                const realMediaId = mediaId;
                if (!mediaId.startsWith(this.baseUrl))
                    mediaId = `${this.baseUrl}/${mediaId}`;
                const mediaInfo = {
                    id: '',
                    title: '',
                };
                const { data } = await this.client.get(mediaId);
                const $ = (0, cheerio_1.load)(data);
                mediaInfo.id = realMediaId;
                const duration = $('div.details div.info p:contains("Duration:")').first().text().trim();
                if (duration != "")
                    mediaInfo.duration = duration.replace("Duration:", "").trim();
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
                mediaInfo.genres = [];
                const genres = $('div.details div.info p:contains("Genre:")');
                genres.each((_index, element) => {
                    $(element).find('a').each((_, anchorElement) => {
                        var _a;
                        (_a = mediaInfo.genres) === null || _a === void 0 ? void 0 : _a.push($(anchorElement).text());
                    });
                });
                mediaInfo.title = $('.info > h1:nth-child(1)').text();
                mediaInfo.otherNames = $('.other_name > a')
                    .map((i, el) => $(el).text().trim())
                    .get();
                mediaInfo.image = $('div.details > div.img > img').attr('src');
                mediaInfo.description = $('div.details div.info p:nth-child(6)').text();
                mediaInfo.releaseDate = this.removeContainsFromString($('div.details div.info p:contains("Released:")').text(), 'Released');
                mediaInfo.episodes = [];
                $('div.content-left > div.block-tab > div > div > ul > li').each((i, el) => {
                    var _a, _b, _c;
                    (_a = mediaInfo.episodes) === null || _a === void 0 ? void 0 : _a.push({
                        id: (_b = $(el).find('a').attr('href')) === null || _b === void 0 ? void 0 : _b.split('.html')[0].slice(1),
                        title: $(el).find('h3').text().replace(mediaInfo.title.toString(), '').trim(),
                        episode: parseFloat((_c = $(el).find('a').attr('href')) === null || _c === void 0 ? void 0 : _c.split('-episode-')[1].split('.html')[0].split('-').join('.')),
                        subType: $(el).find('span.type').text(),
                        releaseDate: $(el).find('span.time').text(),
                        url: `${this.baseUrl}${$(el).find('a').attr('href')}`,
                    });
                });
                mediaInfo.episodes.reverse();
                return mediaInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchEpisodeSources = async (episodeId, server = models_1.StreamingServers.AsianLoad) => {
            if (episodeId.startsWith('http')) {
                const serverUrl = new URL(episodeId);
                switch (server) {
                    case models_1.StreamingServers.AsianLoad:
                        return Object.assign({}, (await new extractors_1.AsianLoad(this.proxyConfig, this.adapter).extract(serverUrl)));
                    case models_1.StreamingServers.MixDrop:
                        return {
                            sources: await new extractors_1.MixDrop(this.proxyConfig, this.adapter).extract(serverUrl),
                        };
                    case models_1.StreamingServers.StreamTape:
                        return {
                            sources: await new extractors_1.StreamTape(this.proxyConfig, this.adapter).extract(serverUrl),
                        };
                    case models_1.StreamingServers.StreamSB:
                        return {
                            sources: await new extractors_1.StreamSB(this.proxyConfig, this.adapter).extract(serverUrl),
                        };
                    default:
                        throw new Error('Server not supported');
                }
            }
            try {
                if (!episodeId.includes('.html'))
                    episodeId = `${this.baseUrl}/${episodeId}.html`;
                const servers = await this.fetchEpisodeServers(episodeId);
                const i = servers.findIndex(s => s.name.toLowerCase() === server.toLowerCase());
                if (i === -1) {
                    throw new Error(`Server ${server} not found`);
                }
                const serverUrl = new URL(servers.filter(s => s.name.toLowerCase() === server.toLowerCase())[0].url);
                return await this.fetchEpisodeSources(serverUrl.href, server);
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.removeContainsFromString = (str, contains) => {
            contains = contains.toLowerCase();
            return str.toLowerCase().replace(/\n/g, '').replace(`${contains}:`, '').trim();
        };
    }
    async fetchEpisodeServers(episodeId, ...args) {
        try {
            const episodeServers = [];
            if (!episodeId.includes('.html'))
                episodeId = `${this.baseUrl}/${episodeId}.html`;
            const { data } = await this.client.get(episodeId);
            const $ = (0, cheerio_1.load)(data);
            $('div.anime_muti_link > ul > li').map(async (i, ele) => {
                const url = $(ele).attr('data-video');
                let name = $(ele).attr('class').replace('selected', '').trim();
                if (name.includes('Standard')) {
                    name = models_1.StreamingServers.AsianLoad;
                }
                episodeServers.push({
                    name: name,
                    url: url.startsWith('//') ? url === null || url === void 0 ? void 0 : url.replace('//', 'https://') : url,
                });
            });
            return episodeServers;
        }
        catch (err) {
            throw new Error(err.message);
        }
    }
}
exports.default = DramaCool;
//# sourceMappingURL=dramacool.js.map