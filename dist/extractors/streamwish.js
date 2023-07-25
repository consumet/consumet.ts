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
                const { data } = await this.client.get(videoUrl.href);
                const unPackagedData = eval(/(eval)(\(f.*?)(\n<\/script>)/s.exec(data)[2]);
                const links = unPackagedData.match(/file:\s*"([^"]+)"/);
                this.sources.push({
                    quality: 'auto',
                    url: links[1],
                    isM3U8: links[1].includes('.m3u8'),
                });
                const m3u8Content = await this.client.get(links[1], {
                    headers: {
                        Referer: videoUrl.href,
                    },
                });
                if (m3u8Content.data.includes('EXTM3U')) {
                    const videoList = m3u8Content.data.split('#EXT-X-STREAM-INF:');
                    for (const video of videoList !== null && videoList !== void 0 ? videoList : []) {
                        if (!video.includes('m3u8'))
                            continue;
                        const url = links[1].split('master.m3u8')[0] + video.split('\n')[1];
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
exports.default = StreamWish;
//# sourceMappingURL=streamwish.js.map