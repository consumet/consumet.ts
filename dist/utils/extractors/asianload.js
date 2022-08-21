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
const crypto_js_1 = __importDefault(require("crypto-js"));
const models_1 = require("../../models");
class AsianLoad extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'asianload';
        this.sources = [];
        this.keys = {
            key: crypto_js_1.default.enc.Utf8.parse('93422192433952489752342908585752'),
            iv: crypto_js_1.default.enc.Utf8.parse('9262859232435825'),
        };
        this.extract = (videoUrl) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const res = yield axios_1.default.get(videoUrl.href);
            const $ = (0, cheerio_1.load)(res.data);
            const encyptedParams = yield this.generateEncryptedAjaxParams($, (_a = videoUrl.searchParams.get('id')) !== null && _a !== void 0 ? _a : '');
            const encryptedData = yield axios_1.default.get(`${videoUrl.protocol}//${videoUrl.hostname}/encrypt-ajax.php?${encyptedParams}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const decryptedData = yield this.decryptAjaxData(encryptedData.data.data);
            if (!decryptedData.source)
                throw new Error('No source found. Try a different server.');
            decryptedData.source.forEach((source) => {
                this.sources.push({
                    url: source.file,
                    isM3U8: source.file.includes('.m3u8'),
                });
            });
            decryptedData.source_bk.forEach((source) => {
                this.sources.push({
                    url: source.file,
                    isM3U8: source.file.includes('.m3u8'),
                });
            });
            const subtitles = (_c = (_b = decryptedData.track) === null || _b === void 0 ? void 0 : _b.tracks) === null || _c === void 0 ? void 0 : _c.map((track) => ({
                url: track.file,
                lang: track.kind === 'thumbnails' ? 'Default (maybe)' : track.kind,
            }));
            return {
                sources: this.sources,
                subtitles: subtitles,
            };
        });
        this.generateEncryptedAjaxParams = ($, id) => __awaiter(this, void 0, void 0, function* () {
            const encryptedKey = crypto_js_1.default.AES.encrypt(id, this.keys.key, {
                iv: this.keys.iv,
            }).toString();
            const scriptValue = $("script[data-name='crypto']").data().value;
            const decryptedToken = crypto_js_1.default.AES.decrypt(scriptValue, this.keys.key, {
                iv: this.keys.iv,
            }).toString(crypto_js_1.default.enc.Utf8);
            return `id=${encryptedKey}&alias=${decryptedToken}`;
        });
        this.decryptAjaxData = (encryptedData) => __awaiter(this, void 0, void 0, function* () {
            const decryptedData = crypto_js_1.default.enc.Utf8.stringify(crypto_js_1.default.AES.decrypt(encryptedData, this.keys.key, {
                iv: this.keys.iv,
            }));
            return JSON.parse(decryptedData);
        });
    }
}
exports.default = AsianLoad;
//# sourceMappingURL=asianload.js.map