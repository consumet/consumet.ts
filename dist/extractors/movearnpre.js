"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const video_extractor_1 = __importDefault(require("../models/video-extractor"));
class MoveArnPre extends video_extractor_1.default {
    constructor() {
        super(...arguments);
        this.serverName = 'movearnpre';
        this.sources = [];
        this.extract = async (videoUrl) => {
            var _a;
            try {
                const { data } = await this.client.get(videoUrl.href, {
                    headers: {
                        Referer: videoUrl.origin,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    },
                });
                let masterUrl = '';
                const packedMatch = data.match(/eval\(function\(p,a,c,k,e,d\)[\s\S]*?}\('(.+)',(\d+),(\d+),'(.+?)'\.split\('\|'\)\)\)/);
                if (packedMatch) {
                    const unpacked = this.unpack(packedMatch[0]);
                    if (unpacked) {
                        const hlsMatches = {};
                        const hlsPattern = /["']hls(\d+)["']:\s*["']([^"']+)["']/g;
                        let match;
                        while ((match = hlsPattern.exec(unpacked)) !== null) {
                            const url = match[2];
                            if (!url.endsWith('.txt') && (url.includes('.m3u8') || url.includes('/stream/'))) {
                                hlsMatches[`hls${match[1]}`] = url;
                            }
                        }
                        const priority = ['hls4', 'hls2', 'hls3'];
                        for (const key of priority) {
                            if (hlsMatches[key]) {
                                masterUrl = hlsMatches[key];
                                break;
                            }
                        }
                        if (!masterUrl) {
                            const patterns = [
                                /file:\s*["']([^"']*master\.m3u8[^"']*)["']/,
                                /["']([^"']*\/stream\/[^"']*master\.m3u8[^"']*)["']/,
                            ];
                            for (const pattern of patterns) {
                                const match = unpacked.match(pattern);
                                if (match === null || match === void 0 ? void 0 : match[1]) {
                                    masterUrl = match[1];
                                    break;
                                }
                            }
                        }
                    }
                }
                if (!masterUrl) {
                    const patterns = [
                        /sources:\s*\[\s*\{\s*file:\s*["']([^"']+)["']/,
                        /file:\s*["']([^"']*master\.m3u8[^"']*)["']/,
                        /["']([^"']*\/stream\/[^"']*master\.m3u8[^"']*)["']/,
                    ];
                    for (const pattern of patterns) {
                        const match = data.match(pattern);
                        if (match === null || match === void 0 ? void 0 : match[1]) {
                            masterUrl = match[1];
                            break;
                        }
                    }
                }
                if (!masterUrl)
                    return [];
                if (masterUrl.startsWith('/')) {
                    masterUrl = `${videoUrl.origin}${masterUrl}`;
                }
                try {
                    const { data: m3u8Data } = await this.client.get(masterUrl, {
                        headers: {
                            Referer: videoUrl.href,
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        },
                        timeout: 10000,
                    });
                    this.sources.push({
                        quality: 'auto',
                        url: masterUrl,
                        isM3U8: true,
                    });
                    if (m3u8Data.includes('#EXT-X-STREAM-INF')) {
                        const variants = m3u8Data.split('#EXT-X-STREAM-INF:');
                        for (const variant of variants) {
                            if (!variant.includes('m3u8'))
                                continue;
                            const lines = variant.split('\n');
                            const variantUrl = (_a = lines[1]) === null || _a === void 0 ? void 0 : _a.trim();
                            if (!variantUrl)
                                continue;
                            const resMatch = variant.match(/RESOLUTION=\d+x(\d+)/);
                            const quality = resMatch ? `${resMatch[1]}p` : 'unknown';
                            let fullUrl = variantUrl;
                            if (!variantUrl.startsWith('http')) {
                                const baseUrl = masterUrl.substring(0, masterUrl.lastIndexOf('/') + 1);
                                fullUrl = baseUrl + variantUrl;
                            }
                            this.sources.push({
                                url: fullUrl,
                                quality,
                                isM3U8: true,
                            });
                        }
                    }
                }
                catch (_b) {
                    if (this.sources.length === 0) {
                        this.sources.push({
                            quality: 'auto',
                            url: masterUrl,
                            isM3U8: true,
                        });
                    }
                }
                return this.sources;
            }
            catch (_c) {
                return [];
            }
        };
    }
    unpack(packed) {
        try {
            const match = packed.match(/}\('(.+)',(\d+),(\d+),'(.+)'\.split\('\|'\)/);
            if (!match)
                return '';
            const payload = match[1].replace(/\\'/g, "'");
            const radix = parseInt(match[2]);
            const count = parseInt(match[3]);
            const symbols = match[4].split('|');
            let unpacked = payload;
            for (let i = count - 1; i >= 0; i--) {
                if (symbols[i]) {
                    const token = i.toString(radix);
                    const regex = new RegExp('\\b' + token + '\\b', 'g');
                    unpacked = unpacked.replace(regex, symbols[i]);
                }
            }
            return unpacked;
        }
        catch (_a) {
            return '';
        }
    }
}
exports.default = MoveArnPre;
//# sourceMappingURL=movearnpre.js.map