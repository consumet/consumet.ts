"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const ws_1 = __importDefault(require("ws"));
const models_1 = require("../../models");
const __1 = require("..");
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
                        'User-Agent': __1.USER_AGENT,
                    },
                };
                let res = undefined;
                let sources = undefined;
                res = await axios_1.default.get(`${isAlternative ? this.host2 : this.host}/ajax/embed-4/getSources?id=${id}`, options);
                //const res = await this.wss(id!);
                if (!(0, __1.isJson)(res.data.sources)) {
                    const { data: key } = await axios_1.default.get('https://raw.githubusercontent.com/consumet/rapidclown/rabbitstream/key.txt');
                    sources = JSON.parse(crypto_js_1.default.AES.decrypt(res.data.sources, key).toString(crypto_js_1.default.enc.Utf8));
                }
                this.sources = sources.map((s) => ({
                    url: s.file,
                    isM3U8: s.file.includes('.m3u8'),
                }));
                result.sources.push(...this.sources);
                result.sources = [];
                this.sources = [];
                for (const source of sources) {
                    const { data } = await axios_1.default.get(source.file, options);
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
        this.wss = async (iframeId) => {
            const ws = new ws_1.default('wss://wsx.dokicloud.one/socket.io/?EIO=4&transport=websocket');
            ws.onopen = () => {
                ws.send('40');
            };
            return await new Promise(resolve => {
                let sid = '';
                let res = { sid: '', sources: [], tracks: [] };
                ws.onmessage = e => {
                    const data = e.data.toString();
                    if (data.startsWith('40')) {
                        res.sid = JSON.parse(data.slice(2)).sid;
                        ws.send(`42["getSources",{"id":"${iframeId}"}]`);
                    }
                    else if (data.startsWith('42["getSources"')) {
                        const ress = JSON.parse(data.slice(2))[1];
                        res.sources = ress.sources;
                        res.tracks = ress.tracks;
                        resolve(res);
                    }
                };
            });
        };
    }
}
exports.default = VidCloud;
//# sourceMappingURL=vidcloud.js.map