"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
class VidMoly extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'vidmoly';
        this.sources = [];
        this.extract = async (videoUrl) => {
            var _a;
            try {
                const urlString = videoUrl.href.replace('vidmoly.to', 'vidmoly.net');
                const { data } = await this.client.get(urlString, {
                    headers: {
                        Referer: videoUrl.origin,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    },
                });
                const patterns = [
                    /file:\s*"([^"]+)"/,
                    /sources:\s*\[\s*{[^}]*file:\s*"([^"]+)"/,
                    /source\s*src="([^"]+\.m3u8[^"]*)"/,
                ];
                let masterUrl = null;
                for (const pattern of patterns) {
                    const match = data.match(pattern);
                    if (match && match[1]) {
                        masterUrl = match[1];
                        break;
                    }
                }
                if (!masterUrl) {
                    console.warn(`Vidmoly: Could not find video source in ${urlString}`);
                    return [];
                }
                const m3u8Content = await this.client.get(masterUrl, {
                    headers: {
                        Referer: urlString,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    },
                });
                this.sources.push({
                    quality: 'auto',
                    url: masterUrl,
                    isM3U8: masterUrl.includes('.m3u8'),
                });
                if (m3u8Content.data.includes('EXTM3U')) {
                    const videoList = m3u8Content.data.split('#EXT-X-STREAM-INF:');
                    for (const video of videoList) {
                        if (!video.includes('m3u8'))
                            continue;
                        const lines = video.split('\n');
                        const url = (_a = lines[1]) === null || _a === void 0 ? void 0 : _a.trim();
                        if (!url)
                            continue;
                        const resolutionMatch = video.match(/RESOLUTION=(\d+)x(\d+)/);
                        const quality = resolutionMatch ? resolutionMatch[2] : 'unknown';
                        this.sources.push({
                            url,
                            quality,
                            isM3U8: url.includes('.m3u8'),
                        });
                    }
                }
                return this.sources;
            }
            catch (err) {
                console.error(`Vidmoly extraction error: ${err.message}`);
                return [];
            }
        };
    }
}
exports.default = VidMoly;
//# sourceMappingURL=vidmoly.js.map