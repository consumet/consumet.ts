"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
class StreamTape extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'StreamTape';
        this.sources = [];
        this.extract = async (videoUrl) => {
            try {
                const apiUrl = 'https://crawlr.cc/F4A2D9B6C?url=' + encodeURIComponent(videoUrl.href);
                const { data } = await this.client.get(apiUrl);
                if (!data.sources || data.sources.length === 0) {
                    throw new Error('No sources returned');
                }
                for (const src of data.sources) {
                    this.sources.push({
                        url: src.url,
                        quality: src.quality,
                        isM3U8: src.url.includes('.m3u8'),
                    });
                }
                return this.sources;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
}
exports.default = StreamTape;
//# sourceMappingURL=streamtape.js.map