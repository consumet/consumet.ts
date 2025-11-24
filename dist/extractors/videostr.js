"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
class VideoStr extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'VideoStr';
        this.sources = [];
        this.extract = async (videoUrl) => {
            var _a, _b, _c;
            try {
                const apiUrl = 'https://crawlr.cc/E2B9A6F4C?url=' + encodeURIComponent(videoUrl.href);
                const { data } = await this.client.get(apiUrl);
                if (!data.sources || data.sources.length === 0) {
                    throw new Error('No sources returned');
                }
                for (const src of data.sources) {
                    this.sources.push({
                        url: src.url,
                        quality: (_a = src.quality) !== null && _a !== void 0 ? _a : 'auto',
                        isM3U8: src.url.includes('.m3u8'),
                    });
                }
                const subtitles = (_c = (_b = data.tracks) === null || _b === void 0 ? void 0 : _b.map(t => {
                    var _a, _b;
                    return ({
                        lang: (_a = t.label) !== null && _a !== void 0 ? _a : 'Unknown',
                        url: t.file,
                        kind: (_b = t.kind) !== null && _b !== void 0 ? _b : 'captions',
                    });
                })) !== null && _c !== void 0 ? _c : [];
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
exports.default = VideoStr;
//# sourceMappingURL=videostr.js.map