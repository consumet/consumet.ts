"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../../models");
const __1 = require("../");
class StreamSB extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'streamsb';
        this.sources = [];
        this.host = 'https://sbplay2.com/sources43';
        this.host2 = 'https://watchsb.com/sources43';
        this.PAYLOAD = (hex) => `566d337678566f743674494a7c7c${hex}7c7c346b6767586d6934774855537c7c73747265616d7362/6565417268755339773461447c7c346133383438333436313335376136323337373433383634376337633465366534393338373136643732373736343735373237613763376334363733353737303533366236333463353333363534366137633763373337343732363536313664373336327c7c6b586c3163614468645a47617c7c73747265616d7362`;
        this.extract = (videoUrl, isAlt = false) => __awaiter(this, void 0, void 0, function* () {
            const headers = {
                watchsb: 'streamsb',
                'User-Agent': __1.USER_AGENT,
                Referer: videoUrl.href,
            };
            let id = videoUrl.href.split('/e/').pop();
            if (id === null || id === void 0 ? void 0 : id.includes('html'))
                id = id.split('.html')[0];
            const bytes = new TextEncoder().encode(id);
            const res = yield axios_1.default
                .get(`${isAlt ? this.host2 : this.host}/${this.PAYLOAD(Buffer.from(bytes).toString('hex'))}`, {
                headers,
            })
                .catch(() => null);
            if (!(res === null || res === void 0 ? void 0 : res.data.stream_data))
                throw new Error('No source found. Try a different server.');
            const m3u8Urls = yield axios_1.default.get(res.data.stream_data.file, {
                headers,
            });
            const videoList = m3u8Urls.data.split('#EXT-X-STREAM-INF:');
            for (const video of videoList !== null && videoList !== void 0 ? videoList : []) {
                if (!video.includes('m3u8'))
                    continue;
                const url = video.split('\n')[1];
                const quality = video.split('RESOLUTION=')[1].split(',')[0].split('x')[1];
                this.sources.push({
                    url: url,
                    quality: `${quality}p`,
                    isM3U8: true,
                });
            }
            this.sources.push({
                quality: 'auto',
                url: res.data.stream_data.file,
                isM3U8: res.data.stream_data.file.includes('.m3u8'),
            });
            return this.sources;
        });
        this.addSources = (source) => {
            this.sources.push({
                url: source.file,
                isM3U8: source.file.includes('.m3u8'),
            });
        };
    }
}
exports.default = StreamSB;
//# sourceMappingURL=streamsb.js.map