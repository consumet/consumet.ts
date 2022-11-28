"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const models_1 = require("../models");
class StreamTape extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'StreamTape';
        this.sources = [];
        this.extract = async (videoUrl) => {
            var _a;
            try {
                const { data } = await axios_1.default.get(videoUrl.href).catch(() => {
                    throw new Error('Video not found');
                });
                const $ = (0, cheerio_1.load)(data);
                let [fh, sh] = (_a = $.html()) === null || _a === void 0 ? void 0 : _a.match(/robotlink'\).innerHTML = (.*)'/)[1].split("+ ('");
                sh = sh.substring(3);
                fh = fh.replace(/\'/g, '');
                const url = `https:${fh}${sh}`;
                this.sources.push({
                    url: url,
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
exports.default = StreamTape;
//# sourceMappingURL=streamtape.js.map