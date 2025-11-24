"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
class StreamWish extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'streamwish';
        this.sources = [];
        this.extract = async (videoUrl) => {
            var _a, _b, _c, _d;
            try {
                let finalUrl = videoUrl.href;
                if (videoUrl.hostname.includes('hglink.to')) {
                    finalUrl = finalUrl.replace('hglink.to', 'dumbalag.com');
                }
                const apiUrl = 'https://crawlr.cc/B6D2A9F1C?url=' + encodeURIComponent(finalUrl);
                const { data } = await this.client.get(apiUrl);
                if (!((_a = data.sources) === null || _a === void 0 ? void 0 : _a.length))
                    throw new Error('No sources returned');
                for (const src of data.sources) {
                    this.sources.push({
                        url: src.url,
                        quality: (_b = src.quality) !== null && _b !== void 0 ? _b : 'auto',
                        isM3U8: src.url.includes('.m3u8'),
                    });
                }
                const subtitles = (_d = (_c = data.tracks) === null || _c === void 0 ? void 0 : _c.filter(t => t.kind === 'captions').map(t => {
                    var _a;
                    return ({
                        lang: (_a = t.label) !== null && _a !== void 0 ? _a : 'Unknown',
                        url: t.file,
                    });
                })) !== null && _d !== void 0 ? _d : [];
                return {
                    sources: this.sources,
                    subtitles,
                };
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
}
exports.default = StreamWish;
//# sourceMappingURL=streamwish.js.map