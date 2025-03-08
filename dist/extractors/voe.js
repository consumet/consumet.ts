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
            var _a, _b, _c;
            try {
                const res = await this.client.get(videoUrl.href);
                const $ = (0, cheerio_1.load)(res.data);
                const scriptContent = $('script').html();
                const pageUrl = scriptContent
                    ? (_b = (_a = scriptContent.match(/window\.location\.href\s*=\s*'(https:\/\/[^']+)';/)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : ''
                    : '';
                const { data } = await this.client.get(pageUrl);
                const $$ = (0, cheerio_1.load)(data);
                const bodyHtml = $$('body').html() || '';
                const url = ((_c = bodyHtml.match(/'hls'\s*:\s*'([^']+)'/s)) === null || _c === void 0 ? void 0 : _c[1]) || '';
                const subtitleRegex = /<track\s+kind="subtitles"\s+label="([^"]+)"\s+srclang="([^"]+)"\s+src="([^"]+)"/g;
                let subtitles = [];
                let match;
                while ((match = subtitleRegex.exec(bodyHtml)) !== null) {
                    subtitles.push({
                        lang: match[1],
                        url: new URL(match[3], videoUrl.origin).href,
                    });
                }
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
                if (thumbnailSrc) {
                    subtitles.push({
                        lang: 'thumbnails',
                        url: `${videoUrl.origin}${thumbnailSrc}`,
                    });
                }
                this.sources.push({
                    url: atob(url),
                    quality: 'default',
                    isM3U8: atob(url).includes('.m3u8'),
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