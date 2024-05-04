"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_js_1 = __importDefault(require("crypto-js"));
const models_1 = require("../models");
const utils_1 = require("../utils");
class VidCloud extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'VidCloud';
        this.sources = [];
        this.host = 'https://dokicloud.one';
        this.host2 = 'https://rabbitstream.net';
        this.extract = async (videoUrl, isAlternative = false) => {
            var _a;
            const result = {
                sources: [],
                subtitles: [],
            };
            try {
                const id = (_a = videoUrl.href.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('?')[0];
                const options = {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        Referer: videoUrl.href,
                        'User-Agent': utils_1.USER_AGENT,
                    },
                };
                let res = undefined;
                let sources = undefined;
                res = await this.client.get(`${isAlternative ? this.host2 : this.host}/ajax/embed-4/getSources?id=${id}`, options);
                if (!(0, utils_1.isJson)(res.data.sources)) {
                    const keys = await (await this.client.get('https://raw.githubusercontent.com/eatmynerds/key/e4/key.txt')).data;
                    const keyString = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(JSON.parse(JSON.stringify(keys))))));
                    const decryptedVal = crypto_js_1.default.AES.decrypt(res.data.sources, keyString).toString(crypto_js_1.default.enc.Utf8);
                    sources = (0, utils_1.isJson)(decryptedVal) ? JSON.parse(decryptedVal) : res.data.sources;
                }
                this.sources = sources.map((s) => ({
                    url: s.file,
                    isM3U8: s.file.includes('.m3u8'),
                }));
                result.sources.push(...this.sources);
                result.sources = [];
                this.sources = [];
                for (const source of sources) {
                    const { data } = await this.client.get(source.file, options);
                    const urls = data.split('\n').filter((line) => line.includes('.m3u8'));
                    const qualities = data.split('\n').filter((line) => line.includes('RESOLUTION='));
                    const TdArray = qualities.map((s, i) => {
                        const f1 = s.split('x')[1];
                        const f2 = urls[i];
                        return [f1, f2];
                    });
                    for (const [f1, f2] of TdArray) {
                        this.sources.push({
                            url: f2,
                            quality: f1,
                            isM3U8: f2.includes('.m3u8'),
                        });
                    }
                    result.sources.push(...this.sources);
                }
                result.sources.push({
                    url: sources[0].file,
                    isM3U8: sources[0].file.includes('.m3u8'),
                    quality: 'auto',
                });
                result.subtitles = res.data.tracks.map((s) => ({
                    url: s.file,
                    lang: s.label ? s.label : 'Default (maybe)',
                }));
                return result;
            }
            catch (err) {
                throw err;
            }
        };
    }
}
exports.default = VidCloud;
//# sourceMappingURL=vidcloud.js.map