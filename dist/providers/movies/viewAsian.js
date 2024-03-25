"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const extractors_1 = require("../../extractors");
class ViewAsian extends models_1.MovieParser {
    constructor() {
        super(...arguments);
        this.name = 'ViewAsian';
        this.baseUrl = 'https://viewasian.co';
        this.logo = 'https://viewasian.co/images/logo.png';
        this.classPath = 'MOVIES.ViewAsian';
        this.supportedTypes = new Set([models_1.TvType.MOVIE, models_1.TvType.TVSERIES]);
        this.search = async (query, page = 1) => {
            const searchResult = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            try {
                const { data } = await this.client.get(`${this.baseUrl}/movie/search/${query.replace(/[\W_]+/g, '-')}?page=${page}`);
                const $ = (0, cheerio_1.load)(data);
                const navSelector = 'div#pagination > nav:nth-child(1) > ul:nth-child(1)';
                searchResult.hasNextPage =
                    $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;
                $('.movies-list-full > div.ml-item').each((i, el) => {
                    var _a;
                    const releaseDate = $(el).find('div.ml-item > div.mli-info > span:nth-child(1)').text();
                    searchResult.results.push({
                        id: (_a = $(el).find('a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1),
                        title: $(el).find('a').attr('title'),
                        url: `${this.baseUrl}${$(el).find('a').attr('href')}`,
                        image: $(el).find('a > img').attr('data-original'),
                        releaseDate: isNaN(parseInt(releaseDate)) ? undefined : releaseDate,
                        //   type:
                        //     $(el)
                        //       .find("div.film-detail > div.fd-infor > span.float-right")
                        //       .text() === "Movie"
                        //       ? TvType.MOVIE
                        //       : TvType.TVSERIES,
                    });
                });
                return searchResult;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchMediaInfo = async (mediaId) => {
            const realMediaId = mediaId;
            if (!mediaId.startsWith(this.baseUrl))
                mediaId = `${this.baseUrl}/watch/${mediaId.split('/').slice(1)}/watching.html`;
            const mediaInfo = {
                id: '',
                title: '',
            };
            try {
                const { data } = await this.client.get(mediaId);
                const $ = (0, cheerio_1.load)(data);
                mediaInfo.id = realMediaId;
                mediaInfo.title = $('.detail-mod h3').text();
                mediaInfo.banner = $('.detail-mod > dm-thumb > img').attr('src');
                mediaInfo.otherNames = $('.other-name a')
                    .map((i, el) => $(el).attr('title').trim())
                    .get();
                mediaInfo.description = $('.desc').text().trim();
                mediaInfo.genre = $('.mvic-info p:contains(Genre) > a')
                    .map((i, el) => $(el).text().split(',').join('').trim())
                    .get();
                mediaInfo.description = $('.desc').text().trim();
                //   mediaInfo.status = $('.mvic-info p:contains(Status)').text().replace('Status: ', '').trim();
                mediaInfo.director = $('.mvic-info p:contains(Director)').text().replace('Director: ', '').trim();
                mediaInfo.country = $('.mvic-info p:contains(Country) a').text().trim();
                mediaInfo.releaseDate = $('.mvic-info p:contains(Release)').text().replace('Release: ', '').trim();
                mediaInfo.episodes = [];
                $('ul#episodes-sv-1 li').each((i, el) => {
                    var _a;
                    (_a = mediaInfo.episodes) === null || _a === void 0 ? void 0 : _a.push({
                        id: $(el).find('a').attr('href').replace('?ep=', '$episode$'),
                        title: $(el).find('a').attr('title').trim(),
                        episode: $(el).find('a').attr('episode-data'),
                        url: `${this.baseUrl}${$(el).find('a').attr('href')}`,
                    });
                });
                return mediaInfo;
            }
            catch (err) {
                throw err;
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
            if (!episodeId.includes('$episode$'))
                throw new Error('Invalid episode id');
            episodeId = `${episodeId.replace('$episode$', '?ep=')}`;
            // return episodeId;
            try {
                if (!episodeId.startsWith(this.baseUrl))
                    episodeId = `${this.baseUrl}/${episodeId}`;
                const { data } = await this.client.get(episodeId);
                const $ = (0, cheerio_1.load)(data);
                let serverUrl = '';
                switch (server) {
                    // asianload is the same as the standard server
                    case models_1.StreamingServers.AsianLoad:
                        serverUrl = `https:${$('.anime:contains(Asianload)').attr('data-video')}`;
                        if (!serverUrl.includes('pladrac'))
                            throw new Error('Try another server');
                        break;
                    case models_1.StreamingServers.MixDrop:
                        serverUrl = $('.mixdrop').attr('data-video');
                        if (!serverUrl.includes('mixdrop'))
                            throw new Error('Try another server');
                        break;
                    case models_1.StreamingServers.StreamTape:
                        serverUrl = $('.streamtape').attr('data-video');
                        if (!serverUrl.includes('streamtape'))
                            throw new Error('Try another server');
                        break;
                    case models_1.StreamingServers.StreamSB:
                        serverUrl = $('.streamsb').attr('data-video');
                        if (!serverUrl.includes('stream'))
                            throw new Error('Try another server');
                        break;
                }
                return await this.fetchEpisodeSources(serverUrl, server);
            }
            catch (err) {
                throw err;
            }
        };
    }
    fetchEpisodeServers(episodeId, ...args) {
        throw new Error('Method not implemented.');
    }
}
exports.default = ViewAsian;
//# sourceMappingURL=viewAsian.js.map