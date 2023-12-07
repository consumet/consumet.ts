"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const crypto_js_1 = __importDefault(require("crypto-js"));
const models_1 = require("../models");
const utils_1 = require("../utils");
class GogoCDN extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'goload';
        this.sources = [];
        this.keys = {
            key: crypto_js_1.default.enc.Utf8.parse('37911490979715163134003223491201'),
            secondKey: crypto_js_1.default.enc.Utf8.parse('54674138327930866480207815084989'),
            iv: crypto_js_1.default.enc.Utf8.parse('3134003223491201'),
        };
        this.referer = '';
        this.extract = async (videoUrl) => {
            var _a;
            this.referer = videoUrl.href;
            const res = await this.client.get(videoUrl.href);
            const $ = (0, cheerio_1.load)(res.data);
            const encyptedParams = await this.generateEncryptedAjaxParams($, (_a = videoUrl.searchParams.get('id')) !== null && _a !== void 0 ? _a : '');
            const encryptedData = await this.client.get(`${videoUrl.protocol}//${videoUrl.hostname}/encrypt-ajax.php?${encyptedParams}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const decryptedData = await this.decryptAjaxData(encryptedData.data.data);
            if (!decryptedData.source)
                throw new Error('No source found. Try a different server.');
            if (decryptedData.source[0].file.includes('.m3u8')) {
                const resResult = await this.client.get(decryptedData.source[0].file.toString());
                const resolutions = resResult.data.match(/(RESOLUTION=)(.*)(\s*?)(\s*.*)/g);
                resolutions === null || resolutions === void 0 ? void 0 : resolutions.forEach((res) => {
                    const index = decryptedData.source[0].file.lastIndexOf('/');
                    const quality = res.split('\n')[0].split('x')[1].split(',')[0];
                    const url = decryptedData.source[0].file.slice(0, index);
                    this.sources.push({
                        url: url + '/' + res.split('\n')[1],
                        isM3U8: (url + res.split('\n')[1]).includes('.m3u8'),
                        quality: quality + 'p',
                    });
                });
                decryptedData.source.forEach((source) => {
                    this.sources.push({
                        url: source.file,
                        isM3U8: source.file.includes('.m3u8'),
                        quality: 'default',
                    });
                });
            }
            else
                decryptedData.source.forEach((source) => {
                    this.sources.push({
                        url: source.file,
                        isM3U8: source.file.includes('.m3u8'),
                        quality: source.label.split(' ')[0] + 'p',
                    });
                });
            decryptedData.source_bk.forEach((source) => {
                this.sources.push({
                    url: source.file,
                    isM3U8: source.file.includes('.m3u8'),
                    quality: 'backup',
                });
            });
            return this.sources;
        };
        this.addSources = async (source) => {
            if (source.file.includes('m3u8')) {
                const m3u8Urls = await this.client
                    .get(source.file, {
                    headers: {
                        Referer: this.referer,
                        'User-Agent': utils_1.USER_AGENT,
                    },
                })
                    .catch(() => null);
                const videoList = m3u8Urls === null || m3u8Urls === void 0 ? void 0 : m3u8Urls.data.split('#EXT-X-I-FRAME-STREAM-INF:');
                for (const video of videoList !== null && videoList !== void 0 ? videoList : []) {
                    if (!video.includes('m3u8'))
                        continue;
                    const url = video
                        .split('\n')
                        .find((line) => line.includes('URI='))
                        .split('URI=')[1]
                        .replace(/"/g, '');
                    const quality = video.split('RESOLUTION=')[1].split(',')[0].split('x')[1];
                    this.sources.push({
                        url: url,
                        quality: `${quality}p`,
                        isM3U8: true,
                    });
                }
                return;
            }
            this.sources.push({
                url: source.file,
                isM3U8: source.file.includes('.m3u8'),
            });
        };
        this.generateEncryptedAjaxParams = async ($, id) => {
            const encryptedKey = crypto_js_1.default.AES.encrypt(id, this.keys.key, {
                iv: this.keys.iv,
            });
            const scriptValue = $("script[data-name='episode']").attr('data-value');
            const decryptedToken = crypto_js_1.default.AES.decrypt(scriptValue, this.keys.key, {
                iv: this.keys.iv,
            }).toString(crypto_js_1.default.enc.Utf8);
            return `id=${encryptedKey}&alias=${id}&${decryptedToken}`;
        };
        this.decryptAjaxData = async (encryptedData) => {
            const decryptedData = crypto_js_1.default.enc.Utf8.stringify(crypto_js_1.default.AES.decrypt(encryptedData, this.keys.secondKey, {
                iv: this.keys.iv,
            }));
            return JSON.parse(decryptedData);
        };
    }
}
exports.default = GogoCDN;
//# sourceMappingURL=gogocdn.js.map