"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const video_extractor_1 = __importDefault(require("../models/video-extractor"));
class Sendvid extends video_extractor_1.default {
    constructor() {
        super(...arguments);
        this.serverName = 'sendvid';
        this.sources = [];
        this.extract = async (videoUrl) => {
            try {
                const { data } = await this.client.get(videoUrl.href, {
                    headers: {
                        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0',
                        Referer: 'https://sendvid.com/',
                    },
                    validateStatus: status => {
                        return (status >= 200 && status < 300) || status === 404;
                    },
                });
                let extractedVideoUrl = null;
                let poster = undefined;
                const sourceTagMatch = data.match(/<source\s+src="([^"]+)"\s+type="video\/mp4"/);
                if (sourceTagMatch && sourceTagMatch[1]) {
                    extractedVideoUrl = sourceTagMatch[1];
                }
                if (!extractedVideoUrl) {
                    const videoSourceVarMatch = data.match(/var\s+video_source\s*=\s*"([^"]+)"/);
                    if (videoSourceVarMatch && videoSourceVarMatch[1]) {
                        extractedVideoUrl = videoSourceVarMatch[1];
                    }
                }
                if (!extractedVideoUrl) {
                    const ogVideoMatch = data.match(/<meta\s+property="og:video"\s+content="([^"]+)"/);
                    if (ogVideoMatch && ogVideoMatch[1]) {
                        extractedVideoUrl = ogVideoMatch[1];
                    }
                }
                if (!extractedVideoUrl) {
                    console.warn(`Sendvid video not found or taken down: ${videoUrl.href}`);
                    return [];
                }
                const posterMatch = data.match(/poster="([^"]+)"/);
                if (posterMatch && posterMatch[1]) {
                    poster = posterMatch[1];
                }
                this.sources.push({
                    url: extractedVideoUrl,
                    quality: 'default',
                    isM3U8: false,
                    ...(poster && { poster }),
                });
                return this.sources;
            }
            catch (err) {
                if (err &&
                    typeof err === 'object' &&
                    'response' in err &&
                    err.response &&
                    typeof err.response === 'object' &&
                    'status' in err.response &&
                    err.response.status === 404) {
                    console.warn(`Sendvid video not found (404): ${videoUrl.href}`);
                    return [];
                }
                throw new Error(`Sendvid extraction failed: ${err.message}`);
            }
        };
    }
}
exports.default = Sendvid;
//# sourceMappingURL=sendvid.js.map