"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../models");
class Voe extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'voe';
        this.sources = [];
        this.domains = ['voe.sx'];
        this.extract = async (videoUrl) => {
            var _a, _b;
            try {
                const res = await this.client.get(videoUrl.href);
                const $ = (0, cheerio_1.load)(res.data);
                const scriptContent = $('script').html();
                const pageUrl = scriptContent
                    ? (_b = (_a = scriptContent.match(/window\.location\.href\s*=\s*'(https:\/\/[^']+)';/)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : ''
                    : '';
                const { data } = await this.client.get(pageUrl);
                const $$ = (0, cheerio_1.load)(data);
                const url = $$('body').html().split('prompt("Node", "')[1].split('");')[0];
                let thumbnailSrc = '';
                $$('script').each((i, el) => {
                    const scriptContent = $(el).html();
                    const regex = /previewThumbnails:\s*{[^}]*src:\s*\["([^"]+)"\]/;
                    if (scriptContent) {
                        const match = scriptContent.match(regex);
                        if (match && match[1]) {
                            thumbnailSrc = match[1];
                            return false;
                        }
                    }
                });
                const subtitles = [
                    {
                        lang: 'thumbnails',
                        url: `${videoUrl.origin}${thumbnailSrc}`,
                    },
                ];
                this.sources.push({
                    url: url,
                    quality: 'default',
                    isM3U8: url.includes('.m3u8'),
                });
                return {
                    sources: this.sources,
                    subtitles: subtitles,
                };
            }
            catch (err) {
                console.log(err);
                throw new Error(err.message);
            }
        };
    }
}
exports.default = Voe;
//# sourceMappingURL=voe.js.map