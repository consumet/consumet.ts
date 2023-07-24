"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../models");
class Mp4Upload extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'mp4upload';
        this.sources = [];
        this.extract = async (videoUrl) => {
            try {
                const { data } = await axios_1.default.get(videoUrl.href);
                const playerSrc = data.match(/(?<=player\.src\()\s*{\s*type:\s*"[^"]+",\s*src:\s*"([^"]+)"\s*}\s*(?=\);)/s);
                const streamUrl = playerSrc[1];
                if (!streamUrl)
                    throw new Error("Stream url not found");
                this.sources.push({
                    quality: 'auto',
                    url: streamUrl,
                    isM3U8: streamUrl.includes('.m3u8'),
                });
                return this.sources;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
}
exports.default = Mp4Upload;
//# sourceMappingURL=mp4upload.js.map