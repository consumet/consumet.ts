"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
class Mp4Player extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'mp4player';
        this.sources = [];
        this.domains = ['mp4player.site'];
        this.extract = async (videoUrl) => {
            var _a, _b;
            try {
                const result = {
                    sources: [],
                    subtitles: [],
                };
                const response = await this.client.get(videoUrl.href);
                const data = (_b = (_a = response.data
                    .match(new RegExp('(?<=sniff\\()(.*)(?=\\))'))[0]) === null || _a === void 0 ? void 0 : _a.replace(/\"/g, '')) === null || _b === void 0 ? void 0 : _b.split(',');
                const link = `https://${videoUrl.host}/m3u8/${data[1]}/${data[2]}/master.txt?s=1&cache=${data[7]}`;
                //const thumbnails = response.data.match(new RegExp('(?<=file":")(.*)(?=","kind)'))[0]?.replace(/\\/g, '');
                const m3u8Content = await this.client.get(link, {
                    headers: {
                        accept: '*/*',
                        referer: videoUrl.href,
                    },
                });
                if (m3u8Content.data.includes('EXTM3U')) {
                    const videoList = m3u8Content.data.split('#EXT-X-STREAM-INF:');
                    for (const video of videoList !== null && videoList !== void 0 ? videoList : []) {
                        if (video.includes('BANDWIDTH')) {
                            const url = video.split('\n')[1];
                            const quality = video.split('RESOLUTION=')[1].split('\n')[0].split('x')[1];
                            result.sources.push({
                                url: url,
                                quality: `${quality}`,
                                isM3U8: url.includes('.m3u8'),
                            });
                        }
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
exports.default = Mp4Player;
//# sourceMappingURL=mp4player.js.map