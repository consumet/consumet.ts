"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
class VidHide extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'VidHide';
        this.sources = [];
        this.extract = async (videoUrl) => {
            var _a, _b;
            try {
                const result = {
                    sources: [],
                    subtitles: [],
                };
                const { data } = await this.client.get(videoUrl.href).catch(() => {
                    throw new Error('Video not found');
                });
                const unpackedData = eval(/(eval)(\(f.*?)(\n<\/script>)/s.exec(data)[2].replace('eval', ''));
                const links = (_a = unpackedData.match(new RegExp('sources:\\[\\{file:"(.*?)"'))) !== null && _a !== void 0 ? _a : [];
                const m3u8Link = links[1];
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
                    const pathWithoutMaster = m3u8Link.split('/master.m3u8')[0];
                    const videoList = m3u8Content.data.split('#EXT-X-STREAM-INF:');
                    for (const video of videoList !== null && videoList !== void 0 ? videoList : []) {
                        if (!video.includes('m3u8'))
                            continue;
                        const url = video.split('\n')[1];
                        const quality = (_b = video.split('RESOLUTION=')[1]) === null || _b === void 0 ? void 0 : _b.split(',')[0].split('x')[1];
                        result.sources.push({
                            url: `${pathWithoutMaster}/${url}`,
                            quality: `${quality}p`,
                            isM3U8: url.includes('.m3u8'),
                        });
                    }
                }
                return result.sources;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
}
exports.default = VidHide;
//# sourceMappingURL=vidhide.js.map