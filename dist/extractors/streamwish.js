"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
class StreamWish extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'streamwish';
        this.sources = [];
        this.extract = async (videoUrl) => {
            try {
                let finalUrl = videoUrl.href;
                if (videoUrl.hostname.includes('hglink.to')) {
                    finalUrl = finalUrl.replace('hglink.to', 'dumbalag.com');
                }
                const apiUrl = 'https://crawlr.cc/B6D2A9F1C?url=' + encodeURIComponent(finalUrl);
                const { data } = await this.client.get(apiUrl);
                if (!data.sources?.length)
                    throw new Error('No sources returned');
                for (const src of data.sources) {
                    this.sources.push({
                        url: src.url,
                        quality: src.quality ?? 'auto',
                        isM3U8: src.url.includes('.m3u8'),
                    });
                }
                const subtitles = data.tracks
                    ?.filter(t => t.kind === 'captions')
                    .map(t => ({
                    lang: t.label ?? 'Unknown',
                    url: t.file,
                })) ?? [];
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