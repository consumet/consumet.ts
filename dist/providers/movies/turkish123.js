"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
class Turkish extends models_1.MovieParser {
    constructor() {
        super(...arguments);
        this.name = 'Turkish123';
        this.baseUrl = 'https://turkish123.ac/';
        this.classPath = 'MOVIES.Turkish';
        this.supportedTypes = new Set([models_1.TvType.TVSERIES]);
    }
    /**
     * Search for Turkish TV shows
     * @param query search query string
     */
    async search(query) {
        try {
            const params = `wp-admin/admin-ajax.php?s=${query}&action=searchwp_live_search&swpengine=default&swpquery=${query}`;
            const { data } = await this.client(this.baseUrl + params, {
                headers: this.getRequestHeaders(),
            });
            const $ = (0, cheerio_1.load)(data);
            const results = [];
            $('li')
                .not('.ss-bottom')
                .each((_, el) => {
                const $el = $(el);
                const href = $el.find('a').attr('href');
                const styleAttr = $el.find('a').attr('style');
                const imageMatch = styleAttr.match(/url\((.*?)\)/);
                results.push({
                    id: href.replace(this.baseUrl, '').replace('/', ''),
                    image: imageMatch ? imageMatch[1] : '',
                    title: $el.find('.ss-title').text(),
                    tags: $el
                        .find('.ss-info > a')
                        .not('.ss-title')
                        .map((_, e) => $(e).text())
                        .get()
                        .filter(v => v !== 'NULL'),
                });
            });
            return results;
        }
        catch (err) {
            throw new Error(err.message);
        }
    }
    /**
     * Fetch detailed media information
     * @param mediaId media id
     */
    async fetchMediaInfo(mediaId) {
        const info = { id: mediaId, title: '' };
        try {
            const { data } = await this.client(this.baseUrl + mediaId, {
                headers: this.getRequestHeaders(),
            });
            const $ = (0, cheerio_1.load)(data);
            const coverStyle = $('#content-cover').attr('style');
            const coverMatch = coverStyle === null || coverStyle === void 0 ? void 0 : coverStyle.match(/url\((.*?)\)/);
            info.image = coverMatch ? coverMatch[1] : undefined;
            info.title = $('.mvic-desc > h1').text();
            info.description = $('.f-desc')
                .text()
                .replace(/[\n\t\b]/g, '');
            info.romaji = $('.yellowi').text();
            info.tags = $('.mvici-left > p:nth-child(3)')
                .find('a')
                .map((_, el) => $(el).text())
                .get();
            info.rating = parseFloat($('.imdb-r').text());
            info.releaseDate = $('.mvici-right > p:nth-child(3)').find('a').first().text();
            info.totalEpisodes = $('.les-content > a').length;
            info.episodes = $('.les-content > a')
                .map((i, el) => {
                const $el = $(el);
                const href = $el.attr('href');
                const episodeId = href.split('/').slice(-2)[0];
                return {
                    id: episodeId,
                    title: `Episode ${i + 1}`,
                };
            })
                .get();
            return info;
        }
        catch (err) {
            throw new Error(err.message);
        }
    }
    /**
     * Fetch episode servers (not implemented)
     */
    fetchEpisodeServers() {
        throw new Error('Method not implemented.');
    }
    /**
     * Fetch episode sources
     * @param episodeId episode id
     */
    async fetchEpisodeSources(episodeId) {
        try {
            const { data } = await this.client(this.baseUrl + episodeId, {
                headers: this.getRequestHeaders(),
            });
            // Extract tukipasti URL
            const urlMatch = data.match(/"(https:\/\/tukipasti\.com\/t\/.*?)"/);
            if (!urlMatch) {
                throw new Error('Failed to extract tukipasti URL');
            }
            // Fetch the actual stream URL
            const { data: streamData } = await this.client(urlMatch[1]);
            const streamMatch = streamData.match(/var urlPlay = '(.*?)'/);
            if (!streamMatch) {
                throw new Error('Failed to extract stream URL');
            }
            return {
                sources: [{ url: streamMatch[1] }],
                headers: { Referer: 'https://tukipasti.com' },
            };
        }
        catch (err) {
            throw new Error(err.message);
        }
    }
    /**
     * Get common request headers
     */
    getRequestHeaders() {
        return {
            'User-Agent': Turkish.USER_AGENT,
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            Referer: this.baseUrl,
        };
    }
}
Turkish.USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
exports.default = Turkish;
//# sourceMappingURL=turkish123.js.map