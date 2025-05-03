"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const extractors_1 = require("../../extractors");
class MultiMovies extends models_1.MovieParser {
    constructor(customBaseURL) {
        super(...arguments);
        this.name = 'MultiMovies';
        this.baseUrl = 'https://multimovies.guru';
        this.logo = 'https://multimovies.guru/wp-content/uploads/2024/01/cropped-CompressJPEG.online_512x512_image.png';
        this.classPath = 'MOVIES.MultiMovies';
        this.supportedTypes = new Set([models_1.TvType.MOVIE, models_1.TvType.TVSERIES]);
        /**
         *
         * @param query search query string
         * @param page page number (default 1) (optional)
         */
        this.search = async (query, page = 1) => {
            const searchResult = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            try {
                let url;
                if (page === 1) {
                    url = `${this.baseUrl}/?s=${query.replace(/[\W_]+/g, '+')}`;
                }
                else {
                    url = `${this.baseUrl}/page/${page}/?s=${query.replace(/[\W_]+/g, '+')}`;
                }
                const { data } = await this.client.get(url);
                const $ = (0, cheerio_1.load)(data);
                const navSelector = 'div.pagination';
                searchResult.hasNextPage = $(navSelector).find('#nextpagination').length > 0;
                const articles = $('.search-page .result-item article').toArray();
                await Promise.all(articles.map(async (el) => {
                    var _a, _b, _c, _d, _e;
                    const seasonSet = new Set();
                    const href = (_b = (_a = $(el)
                        .find('.thumbnail a')
                        .attr('href')) === null || _a === void 0 ? void 0 : _a.replace(/^https?:\/\/[^/]+\//, '').replace(/^\/|\/$/g, '')) !== null && _b !== void 0 ? _b : '';
                    const episodesInfo = await this.fetchMediaInfo(href);
                    const episodes = (episodesInfo === null || episodesInfo === void 0 ? void 0 : episodesInfo.episodes) || [];
                    for (const episode of episodes) {
                        if (episode.season != null) {
                            seasonSet.add(episode.season);
                        }
                    }
                    searchResult.results.push({
                        id: href,
                        title: $(el).find('.details .title a').text().trim(),
                        url: (_c = $(el).find('.thumbnail a').attr('href')) !== null && _c !== void 0 ? _c : '',
                        image: (_d = $(el).find('.thumbnail img').attr('src')) !== null && _d !== void 0 ? _d : '',
                        rating: parseFloat($(el).find('.meta .rating').text().replace('IMDb ', '')) || 0,
                        releaseDate: $(el).find('.meta .year').text().trim(),
                        seasons: seasonSet.size,
                        description: $(el).find('.contenido p').text().trim(),
                        type: ((_e = $(el).find('.thumbnail a').attr('href')) === null || _e === void 0 ? void 0 : _e.includes('/movies/'))
                            ? models_1.TvType.MOVIE
                            : models_1.TvType.TVSERIES,
                    });
                }));
                return searchResult;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         *
         * @param mediaId media link or id
         */
        this.fetchMediaInfo = async (mediaId) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            if (!mediaId.startsWith(this.baseUrl)) {
                mediaId = `${this.baseUrl}/${mediaId}`;
            }
            const movieInfo = {
                id: mediaId.replace(/^https?:\/\/[^/]+\//, '').replace(/^\/|\/$/g, ''),
                title: '',
                url: mediaId,
            };
            try {
                const { data } = await this.client.get(mediaId);
                const $ = (0, cheerio_1.load)(data);
                const recommendationsArray = [];
                $('div#single_relacionados  article').each((i, el) => {
                    var _a, _b, _c, _d;
                    recommendationsArray.push({
                        id: (_a = $(el)
                            .find('a')
                            .attr('href')) === null || _a === void 0 ? void 0 : _a.replace(/^https?:\/\/[^/]+\//, '').replace(/^\/|\/$/g, ''),
                        title: $(el).find('a img').attr('alt'),
                        image: (_b = $(el).find('a img').attr('data-src')) !== null && _b !== void 0 ? _b : $(el).find('a img').attr('src'),
                        type: ((_c = $(el).find('.thumbnail a').attr('href')) === null || _c === void 0 ? void 0 : _c.includes('/movies/'))
                            ? models_1.TvType.TVSERIES
                            : (_d = models_1.TvType.MOVIE) !== null && _d !== void 0 ? _d : null,
                    });
                });
                movieInfo.cover = (_b = (_a = $('div#info .galeria').first().find('.g-item a').attr('href')) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : '';
                movieInfo.title = $('.sheader > .data > h1').text();
                movieInfo.image =
                    (_c = $('.sheader > .poster > img').attr('src')) !== null && _c !== void 0 ? _c : $('.sheader > .poster > img').attr('data-src');
                movieInfo.description = $('div#info div[itemprop="description"] p').text();
                movieInfo.type = movieInfo.id.split('/')[0] === 'tvshows' ? models_1.TvType.TVSERIES : models_1.TvType.MOVIE;
                movieInfo.releaseDate = $('.sheader > .data > .extra > span.date').text().trim();
                movieInfo.trailer = {
                    id: (_f = (_e = (_d = $('div#trailer .embed  iframe').attr('data-litespeed-src')) === null || _d === void 0 ? void 0 : _d.split('embed/')[1]) === null || _e === void 0 ? void 0 : _e.split('?')[0]) !== null && _f !== void 0 ? _f : (_h = (_g = $('div#trailer .embed  iframe').attr('src')) === null || _g === void 0 ? void 0 : _g.split('embed/')[1]) === null || _h === void 0 ? void 0 : _h.split('?')[0],
                    url: (_j = $('div#trailer .embed iframe').attr('data-litespeed-src')) !== null && _j !== void 0 ? _j : $('div#trailer .embed iframe').attr('src'),
                };
                movieInfo.genres = $('.sgeneros a')
                    .map((i, el) => $(el).text())
                    .get()
                    .map(v => v.trim());
                movieInfo.characters = [];
                $('div#cast .persons .person').each((i, el) => {
                    var _a;
                    const url = $(el).find('.img > a').attr('href');
                    const image = (_a = $(el).find('.img > a > img').attr('data-src')) !== null && _a !== void 0 ? _a : $(el).find('.img > a > img').attr('src');
                    const name = $(el).find('.data > .name > a').text();
                    const character = $(el).find('.data > .caracter').text();
                    movieInfo.characters.push({
                        url,
                        image,
                        name,
                        character,
                    });
                });
                movieInfo.country = $('.sheader > .data > .extra > span.country').text();
                movieInfo.duration = $('.sheader > .data > .extra > span.runtime').text();
                movieInfo.rating = parseFloat($('.starstruck-rating span.dt_rating_vgs[itemprop="ratingValue"]').text());
                movieInfo.recommendations = recommendationsArray;
                if (movieInfo.type === models_1.TvType.TVSERIES) {
                    movieInfo.episodes = [];
                    $('#seasons .se-c').each((i, el) => {
                        const seasonNumber = parseInt($(el).find('.se-t').text().trim());
                        $(el)
                            .find('.episodios li')
                            .each((j, ep) => {
                            var _a, _b, _c, _d, _e, _f, _g;
                            const episode = {
                                id: (_a = $(ep)
                                    .find('.episodiotitle a')
                                    .attr('href')) === null || _a === void 0 ? void 0 : _a.replace(/^https?:\/\/[^/]+\//, '').replace(/^\/|\/$/g, ''),
                                season: seasonNumber,
                                number: parseInt($(ep).find('.numerando').text().trim().split('-')[1]),
                                title: $(ep).find('.episodiotitle a').text().trim(),
                                url: (_c = (_b = $(ep).find('.episodiotitle a').attr('href')) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : '',
                                releaseDate: String(new Date($(ep).find('.episodiotitle .date').text().trim()).getFullYear()),
                                image: (_e = (_d = $(ep).find('.imagen img').attr('data-src')) === null || _d === void 0 ? void 0 : _d.trim()) !== null && _e !== void 0 ? _e : (_f = $(ep).find('.imagen img').attr('src')) === null || _f === void 0 ? void 0 : _f.trim(),
                            };
                            (_g = movieInfo.episodes) === null || _g === void 0 ? void 0 : _g.push(episode);
                        });
                    });
                }
                else {
                    movieInfo.episodes = [
                        {
                            id: movieInfo.id,
                            title: movieInfo.title,
                            url: movieInfo.url,
                            image: movieInfo.cover || movieInfo.image,
                        },
                    ];
                }
                return movieInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         *
         * @param episodeId episode id
         * @param media media id
         * @param server server type (default `StreamWish`) (optional)
         */
        this.fetchEpisodeSources = async (episodeId, mediaId, //just placeholder for compatibility with tmdb
        server = models_1.StreamingServers.StreamWish, fileId) => {
            if (episodeId.startsWith('http')) {
                const serverUrl = new URL(episodeId);
                switch (server) {
                    case models_1.StreamingServers.MixDrop:
                        return {
                            headers: { Referer: serverUrl.href },
                            sources: await new extractors_1.MixDrop(this.proxyConfig, this.adapter).extract(serverUrl),
                            download: fileId ? `https://gdmirrorbot.nl/file/${fileId}` : '',
                        };
                    case models_1.StreamingServers.StreamWish:
                        return {
                            headers: { Referer: serverUrl.href },
                            ...(await new extractors_1.StreamWish(this.proxyConfig, this.adapter).extract(serverUrl)),
                            download: fileId ? `https://gdmirrorbot.nl/file/${fileId}` : '',
                        };
                    case models_1.StreamingServers.StreamTape:
                        return {
                            headers: { Referer: serverUrl.href },
                            sources: await new extractors_1.StreamTape(this.proxyConfig, this.adapter).extract(serverUrl),
                            download: fileId ? `https://gdmirrorbot.nl/file/${fileId}` : '',
                        };
                    case models_1.StreamingServers.VidHide:
                        return {
                            headers: { Referer: serverUrl.href },
                            sources: await new extractors_1.VidHide(this.proxyConfig, this.adapter).extract(serverUrl),
                            download: fileId ? `https://gdmirrorbot.nl/file/${fileId}` : '',
                        };
                    default:
                        return {
                            headers: { Referer: serverUrl.href },
                            ...(await new extractors_1.StreamWish(this.proxyConfig, this.adapter).extract(serverUrl)),
                            download: fileId ? `https://gdmirrorbot.nl/file/${fileId}` : '',
                        };
                }
            }
            try {
                const servers = await this.fetchEpisodeServers(episodeId);
                const i = servers.findIndex(s => s.name.toLowerCase() === server.toLowerCase());
                if (i === -1) {
                    throw new Error(`Server ${server} not found`);
                }
                const serverUrl = new URL(servers[i].url);
                let fileId = '';
                if (!episodeId.startsWith('http')) {
                    const { fileId: id } = await this.getServer(`${this.baseUrl}/${episodeId}`);
                    fileId = id !== null && id !== void 0 ? id : '';
                }
                // fileId to be used for download link
                return await this.fetchEpisodeSources(serverUrl.href, mediaId, server, fileId);
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         *
         * @param episodeId takes episode link or movie id
         */
        this.fetchEpisodeServers = async (episodeId) => {
            if (!episodeId.startsWith(this.baseUrl)) {
                episodeId = `${this.baseUrl}/${episodeId}`;
            }
            try {
                const { servers } = await this.getServer(episodeId);
                return servers;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchPopular = async (page = 1) => {
            const result = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            try {
                const { data } = await this.client.get(`${this.baseUrl}/trending/page/${page}/`);
                const $ = (0, cheerio_1.load)(data);
                const navSelector = 'div.pagination';
                result.hasNextPage = $(navSelector).find('#nextpagination').length > 0;
                $('.items > article')
                    .each((i, el) => {
                    var _a, _b, _c, _d, _e;
                    const resultItem = {
                        id: $(el).attr('id'),
                        title: (_a = $(el).find('div.data > h3').text()) !== null && _a !== void 0 ? _a : '',
                        url: $(el).find('div.poster > a').attr('href'),
                        image: (_b = $(el).find('div.poster > img').attr('data-src')) !== null && _b !== void 0 ? _b : '',
                        type: ((_c = $(el).find('div.poster > a').attr('href')) === null || _c === void 0 ? void 0 : _c.includes('/movies/'))
                            ? models_1.TvType.MOVIE
                            : models_1.TvType.TVSERIES,
                        rating: (_d = $(el).find('div.poster > div.rating').text()) !== null && _d !== void 0 ? _d : '',
                        releaseDate: (_e = $(el).find('div.data > span').text()) !== null && _e !== void 0 ? _e : '',
                    };
                    result.results.push(resultItem);
                })
                    .get();
                return result;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchByGenre = async (genre, page = 1) => {
            const result = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            try {
                const { data } = await this.client.get(`${this.baseUrl}/genre/${genre}/page/${page}`);
                const $ = (0, cheerio_1.load)(data);
                const navSelector = 'div.pagination';
                result.hasNextPage = $(navSelector).find('#nextpagination').length > 0;
                $('.items > article')
                    .each((i, el) => {
                    var _a, _b, _c, _d, _e;
                    const resultItem = {
                        id: $(el).attr('id'),
                        title: (_a = $(el).find('div.data > h3').text()) !== null && _a !== void 0 ? _a : '',
                        url: $(el).find('div.poster > a').attr('href'),
                        image: (_b = $(el).find('div.poster > img').attr('data-src')) !== null && _b !== void 0 ? _b : '',
                        type: ((_c = $(el).find('div.poster > a').attr('href')) === null || _c === void 0 ? void 0 : _c.includes('/movies/'))
                            ? models_1.TvType.MOVIE
                            : models_1.TvType.TVSERIES,
                        rating: (_d = $(el).find('div.poster > div.rating').text()) !== null && _d !== void 0 ? _d : '',
                        releaseDate: (_e = $(el).find('div.data > span').text()) !== null && _e !== void 0 ? _e : '',
                    };
                    result.results.push(resultItem);
                })
                    .get();
                return result;
            }
            catch (err) {
                throw new Error(err.message);
            }
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
    async getServer(url) {
        var _a, _b, _c, _d, _e;
        try {
            const { data } = await this.client.get(url);
            const $ = (0, cheerio_1.load)(data);
            // Extract player config
            const playerConfig = {
                postId: $('#player-option-1').attr('data-post'),
                nume: $('#player-option-1').attr('data-nume'),
                type: $('#player-option-1').attr('data-type'),
            };
            if (!playerConfig.postId || !playerConfig.nume || !playerConfig.type) {
                throw new Error('Missing player configuration');
            }
            const formData = new FormData();
            formData.append('action', 'doo_player_ajax');
            formData.append('post', playerConfig.postId);
            formData.append('nume', playerConfig.nume);
            formData.append('type', playerConfig.type);
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            };
            const playerRes = await this.client.post(`${this.baseUrl}/wp-admin/admin-ajax.php`, formData, {
                headers,
            });
            const iframeUrl = ((_c = (_b = (_a = playerRes.data) === null || _a === void 0 ? void 0 : _a.embed_url) === null || _b === void 0 ? void 0 : _b.match(/<iframe[^>]+src="([^"]+)"[^>]*>/i)) === null || _c === void 0 ? void 0 : _c[1]) ||
                ((_d = playerRes.data) === null || _d === void 0 ? void 0 : _d.embed_url);
            // Handle non-multimovies case
            if (!iframeUrl.includes('multimovies')) {
                let playerBaseUrl = iframeUrl.split('/').slice(0, 3).join('/');
                const redirectResponse = await this.client.head(playerBaseUrl, { headers });
                // Update base URL if redirect occurred
                if (redirectResponse) {
                    playerBaseUrl =
                        redirectResponse.request._redirectable._options.href.split('/').slice(0, 3).join('/') ||
                            redirectResponse.request.res.responseURL.split('/').slice(0, 3).join('/');
                }
                const fileId = iframeUrl.split('/').pop();
                if (!fileId) {
                    throw new Error('No player ID found');
                }
                const streamRequestData = new FormData();
                streamRequestData.append('sid', fileId);
                const streamResponse = await this.client.post(`${playerBaseUrl}/embedhelper.php`, streamRequestData, {
                    headers,
                });
                if (!streamResponse.data) {
                    throw new Error('No stream data found');
                }
                const streamDetails = streamResponse.data;
                const mresultKeys = new Set(Object.keys(streamDetails.mresult));
                const siteUrlsKeys = new Set(Object.keys(streamDetails.siteUrls));
                // Find common keys
                const commonKeys = [...mresultKeys].filter(key => siteUrlsKeys.has(key));
                // Convert to a Set (if needed)
                const commonStreamSites = new Set(commonKeys);
                const servers = Array.from(commonStreamSites).map(site => {
                    return {
                        name: streamDetails.siteFriendlyNames[site] === 'StreamHG'
                            ? 'StreamWish'
                            : streamDetails.siteFriendlyNames[site],
                        url: streamDetails.siteUrls[site] + streamDetails.mresult[site],
                    };
                });
                return { servers, fileId };
            }
            else {
                //@Durgesh
                return {
                    servers: [{ name: 'StreamWish', url: iframeUrl }],
                    fileId: (_e = iframeUrl.split('/').pop()) !== null && _e !== void 0 ? _e : '',
                };
            }
        }
        catch (err) {
            throw new Error(err.message);
        }
    }
}
// (async () => {
//   const movie = new MultiMovies();
//   const search = await movie.search('jujutsu');
//   const movieInfo = await movie.fetchEpisodeSources(search.results[0]?.id);
//   const server = await movie.fetchEpisodeServers(search.results[0]?.id);
//   // const recentTv = await movie.fetchPopular();
//   // const genre = await movie.fetchByGenre('action');
//   console.log(movieInfo,server);
// })();
exports.default = MultiMovies;
//# sourceMappingURL=multimovies.js.map