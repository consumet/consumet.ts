"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const video_extractor_1 = __importDefault(require("../models/video-extractor"));
const crypto = __importStar(require("crypto"));
class Lpayer extends video_extractor_1.default {
    constructor() {
        super(...arguments);
        this.serverName = 'lpayer';
        this.sources = [];
        this.AES_KEY = Buffer.from('kiemtienmua911ca', 'utf8');
        this.AES_IV = Buffer.from('1234567890oiuytr', 'utf8');
        this.extract = async (videoUrl) => {
            var _a;
            try {
                const videoId = videoUrl.hash.substring(1);
                if (!videoId)
                    return [];
                const apiUrl = `${videoUrl.origin}/api/v1/video?id=${videoId}&w=1366&h=768&r=`;
                const { data: encryptedData } = await this.client.get(apiUrl, {
                    headers: {
                        Referer: videoUrl.href,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    },
                });
                const decryptedData = this.decrypt(encryptedData);
                if (!decryptedData)
                    return [];
                const videoData = JSON.parse(decryptedData);
                let hlsUrl = videoData.hls || videoData.source || videoData.url || videoData.file || '';
                if (!hlsUrl)
                    return [];
                if (hlsUrl.startsWith('/')) {
                    hlsUrl = videoUrl.origin + hlsUrl;
                }
                this.sources.push({
                    quality: 'auto',
                    url: hlsUrl,
                    isM3U8: hlsUrl.includes('.m3u8'),
                });
                if (hlsUrl.includes('.m3u8')) {
                    try {
                        const { data } = await this.client.get(hlsUrl, {
                            headers: {
                                Referer: videoUrl.href,
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            },
                            timeout: 5000,
                        });
                        if (data.includes('EXT-X-STREAM-INF')) {
                            const lines = data.split('\n');
                            for (let i = 0; i < lines.length; i++) {
                                if (lines[i].startsWith('#EXT-X-STREAM-INF:')) {
                                    const resolutionMatch = lines[i].match(/RESOLUTION=\d+x(\d+)/);
                                    const quality = resolutionMatch ? `${resolutionMatch[1]}p` : 'unknown';
                                    const urlLine = (_a = lines[i + 1]) === null || _a === void 0 ? void 0 : _a.trim();
                                    if (urlLine && !urlLine.startsWith('#')) {
                                        let variantUrl = urlLine;
                                        if (!variantUrl.startsWith('http')) {
                                            const baseUrl = hlsUrl.substring(0, hlsUrl.lastIndexOf('/') + 1);
                                            variantUrl = baseUrl + variantUrl;
                                        }
                                        this.sources.push({
                                            quality,
                                            url: variantUrl,
                                            isM3U8: true,
                                        });
                                    }
                                }
                            }
                        }
                    }
                    catch (_b) { }
                }
                return this.sources;
            }
            catch (_c) {
                return [];
            }
        };
    }
    decrypt(encryptedHex) {
        try {
            const encryptedBuffer = Buffer.from(encryptedHex, 'hex');
            const decipher = crypto.createDecipheriv('aes-128-cbc', this.AES_KEY, this.AES_IV);
            let decrypted = decipher.update(encryptedBuffer);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString('utf8');
        }
        catch (_a) {
            return '';
        }
    }
}
exports.default = Lpayer;
//# sourceMappingURL=lplayer.js.map