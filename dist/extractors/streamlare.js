"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const video_extractor_1 = __importDefault(require("../models/video-extractor"));
class StreamLare extends video_extractor_1.default {
    constructor() {
        super(...arguments);
        this.serverName = 'StreamLare';
        this.sources = [];
        this.host = 'https://streamlare.com';
        this.regex = new RegExp('/[ve]/([^?#&/]+)');
        this.USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36';
    }
    async extract(videoUrl, userAgent = this.USER_AGENT.toString(), ...args) {
        var _a;
        const res = await this.client.get(videoUrl.href);
        const $ = (0, cheerio_1.load)(res.data);
        const CSRF_TOKEN = (_a = $('head > meta:nth-child(3)').attr('content')) === null || _a === void 0 ? void 0 : _a.toString();
        const videoId = videoUrl.href.match(this.regex)[1];
        if (videoId == undefined) {
            throw new Error('Video id not matched!');
        }
        const POST = await this.client.post(this.host + '/api/video/stream/get', {
            id: videoId,
        }, {
            headers: {
                'User-Agent': userAgent,
            },
        });
        const POST_RES = POST.data;
        const result = {
            headers: {
                'User-Agent': userAgent,
            },
            status: POST_RES.status,
            message: POST_RES.message,
            type: POST_RES.type,
            token: POST_RES.token,
            sources: POST_RES.result,
        };
        if (POST_RES.status == 'error') {
            throw new Error('Request Failed! Error: ' + POST_RES.message);
        }
        return result;
    }
}
exports.default = StreamLare;
//# sourceMappingURL=streamlare.js.map