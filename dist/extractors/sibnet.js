"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const video_extractor_1 = __importDefault(require("../models/video-extractor"));
class Sibnet extends video_extractor_1.default {
    constructor() {
        super(...arguments);
        this.serverName = 'sibnet';
        this.sources = [];
        this.extract = async (videoUrl) => {
            try {
                const { data } = await this.client.get(videoUrl.href, {
                    headers: {
                        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0',
                        Referer: 'https://video.sibnet.ru/',
                    },
                });
                const srcMatch = data.match(/player\.src\(\[\{src:\s*"([^"]+)",\s*type:\s*"([^"]+)"/);
                if (!srcMatch) {
                    throw new Error('Could not find video source in page');
                }
                const videoPath = srcMatch[1];
                const videoType = srcMatch[2];
                const fullUrl = videoPath.startsWith('http') ? videoPath : `https://video.sibnet.ru${videoPath}`;
                this.sources.push({
                    url: fullUrl,
                    quality: 'default',
                    isM3U8: videoType.includes('m3u8') || fullUrl.includes('.m3u8'),
                    referer: videoUrl.href,
                });
                return this.sources;
            }
            catch (err) {
                throw new Error(`Sibnet extraction failed: ${err.message}`);
            }
        };
    }
}
exports.default = Sibnet;
//# sourceMappingURL=sibnet.js.map