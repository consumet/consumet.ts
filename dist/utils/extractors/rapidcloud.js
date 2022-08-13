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
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
class RapidCloud extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'RapidCloud';
        this.sources = [];
        this.host = 'https://rapid-cloud.co';
        this.enimeApi = 'https://api.enime.moe';
        this.extract = (videoUrl) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const result = {
                sources: [],
                subtitles: [],
            };
            try {
                const id = (_a = videoUrl.href.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('?')[0];
                const options = {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                };
                let res = null;
                const { data } = yield axios_1.default.get(videoUrl.href, options);
                const html = (0, cheerio_1.load)(data).html();
                const key = html
                    .substring(html.indexOf('var recaptchaSiteKey ='), html.lastIndexOf(','))
                    .split(' = ')[1]
                    .replace(/\'/g, '');
                const _number = html
                    .substring(html.indexOf('recaptchaNumber ='), html.lastIndexOf(';'))
                    .split(' = ')[1]
                    .replace(/\'/g, '');
                const { data: sId } = yield axios_1.default.get(`${this.enimeApi}/tool/rapid-cloud/server-id`);
                // const _token = await this.captcha(videoUrl.href, key);
                const _token = undefined;
                res = yield axios_1.default.get(`${this.host}/ajax/embed-6/getSources?id=${id}&sId=${sId}&_number=${_number}&_token=${_token}`, options);
                const { data: { sources, tracks, intro }, } = res;
                this.sources = sources.map((s) => ({
                    url: s.file,
                    isM3U8: s.file.includes('.m3u8'),
                }));
                result.sources.push(...this.sources);
                if (videoUrl.href.includes(new URL(this.host).host)) {
                    result.sources = [];
                    this.sources = [];
                    for (const source of sources) {
                        const { data } = yield axios_1.default.get(source.file, options);
                        const m3u8data = data
                            .split('\n')
                            .filter((line) => line.includes('.m3u8') && line.includes('RESOLUTION='));
                        const secondHalf = m3u8data.map((line) => line.match(/(?<=RESOLUTION=).*(?<=,C)|(?<=URI=).*/g));
                        const TdArray = secondHalf.map((s) => {
                            const f1 = s[0].split(',C')[0];
                            const f2 = s[1].replace(/"/g, '');
                            return [f1, f2];
                        });
                        for (const [f1, f2] of TdArray) {
                            this.sources.push({
                                url: `${(_b = source.file) === null || _b === void 0 ? void 0 : _b.split('master.m3u8')[0]}${f2.replace('iframes', 'index')}`,
                                quality: f1.split('x')[1] + 'p',
                                isM3U8: f2.includes('.m3u8'),
                            });
                        }
                        result.sources.push(...this.sources);
                    }
                    if (intro.end > 1) {
                        result.intro = {
                            start: intro.start,
                            end: intro.end,
                        };
                    }
                }
                result.sources.push({
                    url: sources[0].file,
                    isM3U8: sources[0].file.includes('.m3u8'),
                    quality: 'auto',
                });
                result.subtitles = tracks
                    .map((s) => s.file
                    ? {
                        url: s.file,
                        lang: s.label ? s.label : 'Default (maybe)',
                    }
                    : null)
                    .filter((s) => s);
                return result;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        this.captcha = (url, key) => __awaiter(this, void 0, void 0, function* () {
            const uri = new URL(url);
            const domain = uri.protocol + '//' + uri.host;
            const { data } = yield axios_1.default.get(`https://www.google.com/recaptcha/api.js?render=${key}`, {
                headers: {
                    Referer: domain,
                },
            });
            const v = data === null || data === void 0 ? void 0 : data.substring(data.indexOf('/releases/'), data.lastIndexOf('/recaptcha')).split('/releases/')[1];
            //TODO: NEED to fix the co (domain) parameter to work with every domain
            const anchor = `https://www.google.com/recaptcha/api2/anchor?ar=1&hl=en&size=invisible&cb=kr42069kr&k=${key}&co=aHR0cHM6Ly9yYXBpZC1jbG91ZC5ydTo0NDM.&v=${v}`;
            const c = (0, cheerio_1.load)((yield axios_1.default.get(anchor)).data)('#recaptcha-token').attr('value');
            // currently its not returning proper response. not sure why
            const res = yield axios_1.default.post(`https://www.google.com/recaptcha/api2/reload?k=${key}`, {
                v: v,
                k: key,
                c: c,
                co: 'aHR0cHM6Ly9yYXBpZC1jbG91ZC5ydTo0NDM.',
                sa: '',
                reason: 'q',
            }, {
                headers: {
                    Referer: anchor,
                },
            });
            return res.data.substring(res.data.indexOf('rresp","'), res.data.lastIndexOf('",null'));
        });
        // private wss = async (): Promise<string> => {
        //   let sId = '';
        //   const ws = new WebSocket('wss://ws1.rapid-cloud.ru/socket.io/?EIO=4&transport=websocket');
        //   ws.on('open', () => {
        //     ws.send('40');
        //   });
        //   return await new Promise((resolve, reject) => {
        //     ws.on('message', (data: string) => {
        //       data = data.toString();
        //       if (data?.startsWith('40')) {
        //         sId = JSON.parse(data.split('40')[1]).sid;
        //         ws.close(4969, "I'm a teapot");
        //         resolve(sId);
        //       }
        //     });
        //   });
        // };
    }
}
exports.default = RapidCloud;
//# sourceMappingURL=rapidcloud.js.map