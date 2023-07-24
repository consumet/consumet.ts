"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
class VidMoly extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'vidmoly';
        this.sources = [];
        this.extract = async (videoUrl) => {
            try {
                const { data } = await this.client.get(videoUrl.href);
                const links = data.match(/file:\s*"([^"]+)"/);
                const m3u8Content = await this.client.get(links[1], {
                    headers: {
                        Referer: videoUrl.href,
                    },
                });
                this.sources.push({
                    quality: 'auto',
                    url: links[1],
                    isM3U8: links[1].includes('.m3u8'),
                });
                if (m3u8Content.data.includes('EXTM3U')) {
                    const videoList = m3u8Content.data.split('#EXT-X-STREAM-INF:');
                    for (const video of videoList !== null && videoList !== void 0 ? videoList : []) {
                        if (!video.includes('m3u8'))
                            continue;
                        const url = video.split('\n')[1];
                        const quality = video.split('RESOLUTION=')[1].split(',')[0].split('x')[1];
                        this.sources.push({
                            url: url,
                            quality: `${quality}`,
                            isM3U8: url.includes('.m3u8'),
                        });
                    }
                }
                return this.sources;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
}
exports.default = VidMoly;
//# sourceMappingURL=vidmoly.js.map