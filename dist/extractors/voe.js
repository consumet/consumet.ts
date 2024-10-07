"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../models");
class Voe extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'voe';
        this.sources = [];
        this.domains = ['voe.sx'];
        this.extract = async (videoUrl) => {
            try {
                const res = await this.client.get(videoUrl.href);
                const $ = (0, cheerio_1.load)(res.data);
                const url = $('body').html().split('prompt("Node", "')[1].split('");')[0];
                // const quality = $('body').html()!.match(/'video_height': ?([0-9]+),/)![1];
                this.sources.push({
                    url: url,
                    quality: 'default',
                    isM3U8: url.includes('.m3u8'),
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