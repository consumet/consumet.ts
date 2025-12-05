"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const utils_1 = require("../utils/utils");
class StreamHub extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'StreamHub';
        this.sources = [];
        this.extract = async (videoUrl) => {
            var _a;
            try {
                const result = {
                    sources: [],
                    subtitles: [],
                };
                const { data } = await this.client.get(videoUrl.href).catch(() => {
                    throw new Error('Video not found');
                });
                const unpackedData = (0, utils_1.safeUnpack)(/(eval)(\(f.*?)(\n<\/script>)/s.exec(data)[2]);
                const links = (_a = unpackedData.match(new RegExp('sources:\\[\\{src:"(.*?)"'))) !== null && _a !== void 0 ? _a : [];
                const m3u8Link = links[1];
                if (!m3u8Link) {
                    throw new Error('No m3u8 link found in unpacked data');
                }
                const m3u8Content = await this.client.get(m3u8Link, {
                    headers: {
                        Referer: m3u8Link,
                    },
                });
                result.sources.push({
                    quality: 'auto',
                    url: m3u8Link,
                    isM3U8: m3u8Link.includes('.m3u8'),
                });
                if (m3u8Content.data.includes('EXTM3U')) {
                    const videoList = m3u8Content.data.split('#EXT-X-STREAM-INF:');
                    for (const video of videoList !== null && videoList !== void 0 ? videoList : []) {
                        if (!video.includes('m3u8'))
                            continue;
                        const url = video.split('\n')[1];
                        const quality = video.split('RESOLUTION=')[1].split(',')[0].split('x')[1];
                        result.sources.push({
                            url: url,
                            quality: `${quality}p`,
                            isM3U8: url.includes('.m3u8'),
                        });
                    }
                }
                return result;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
}
exports.default = StreamHub;
//# sourceMappingURL=streamhub.js.map