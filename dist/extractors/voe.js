"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
class Voe extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'voe';
        this.sources = [];
        this.domains = ['voe.sx'];
        this.extract = async (videoUrl) => {
            try {
                const { data } = await this.client.get(videoUrl.href);
                const links = data.match(/'hls': ?'(http.*?)',/);
                const quality = data.match(/'video_height': ?([0-9]+),/)[1];
                this.sources.push({
                    quality: quality,
                    url: links[1],
                    isM3U8: links[1].includes('.m3u8'),
                });
                return this.sources;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
}
exports.default = Voe;
//# sourceMappingURL=voe.js.map