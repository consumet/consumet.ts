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
const __1 = require("..");
class VidCloud extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'VidCloud';
        this.sources = [];
        this.host = 'https://mzzcloud.life';
        this.host2 = 'https://rabbitstream.net';
        this.host3 = 'https://rapid-cloud.ru';
        this.extract = (videoUrl, isAlternative = false) => __awaiter(this, void 0, void 0, function* () {
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
                        Referer: videoUrl.href,
                        'User-Agent': __1.USER_AGENT,
                    },
                };
                let res = null;
                if (videoUrl.href.includes('rapid-cloud.ru')) {
                    res = yield axios_1.default.get(`${this.host3}/ajax/embed-6/getSources?id=${id}&sId=zIlsAXDw5t76TRyfhrDY`, options);
                }
                else {
                    res = yield axios_1.default.get(`${isAlternative ? this.host2 : this.host}/ajax/embed-4/getSources?id=${id}`, options);
                }
                const { data: { sources, tracks, intro }, } = res;
                this.sources = sources.map((s) => ({
                    url: s.file,
                    isM3U8: s.file.includes('.m3u8'),
                }));
                result.sources.push(...this.sources);
                if (videoUrl.href.includes(new URL(this.host3).host)) {
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
                else if (videoUrl.href.includes(new URL(this.host2).host) ||
                    videoUrl.href.includes(new URL(this.host).host)) {
                    result.sources = [];
                    this.sources = [];
                    for (const source of sources) {
                        const { data } = yield axios_1.default.get(source.file, options);
                        const urls = data.split('\n').filter((line) => line.includes('.m3u8'));
                        const qualities = data
                            .split('\n')
                            .filter((line) => line.includes('RESOLUTION='));
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
                }
                result.subtitles = tracks.map((s) => ({
                    url: s.file,
                    lang: s.label ? s.label : 'Default (maybe)',
                }));
                return result;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
    }
}
exports.default = VidCloud;
//# sourceMappingURL=vidcloud.js.map