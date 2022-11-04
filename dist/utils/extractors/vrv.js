"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const __1 = require("..");
/**
 * work in progress
 */
class Vrv extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'vrv';
        this.sources = [];
        this.host = 'https://v.vrv.co';
        this.animixplayHost = 'https://animixplay.to';
        this.extract = async (videoUrl) => {
            const options = {
                headers: {
                    Referer: videoUrl.href,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': __1.USER_AGENT,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            };
            console.log(videoUrl.href);
            const { data } = await axios_1.default.get(videoUrl.href);
            const $ = (0, cheerio_1.load)(data);
            const iframe = $('#iframeplayer').attr('src');
            console.log(this.animixplayHost + iframe);
            const { data: iframeData } = await axios_1.default.get(this.animixplayHost + iframe);
            return this.sources;
        };
    }
}
exports.default = Vrv;
//# sourceMappingURL=vrv.js.map