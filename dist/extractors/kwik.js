"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../models");
class Kwik extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'kwik';
        this.sources = [];
        this.host = 'https://animepahe.com';
        this.extract = async (videoUrl) => {
            try {
                const { data } = await axios_1.default.get(`${videoUrl.href}`, {
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