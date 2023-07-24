"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
class Kwik extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'kwik';
        this.sources = [];
        this.host = 'https://animepahe.com';
        this.extract = async (videoUrl) => {
            try {
                const { data } = await this.client.get(`${videoUrl.href}`, {
                    headers: { Referer: this.host },
                });
                const source = eval(/(eval)(\(f.*?)(\n<\/script>)/s.exec(data)[2].replace('eval', '')).match(/https.*?m3u8/);
                this.sources.push({
                    url: source[0],
                    isM3U8: source[0].includes('.m3u8'),
                });
                return this.sources;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
}
exports.default = Kwik;
//# sourceMappingURL=kwik.js.map