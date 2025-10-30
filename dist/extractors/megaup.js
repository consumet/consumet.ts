"use strict";
//extractor for https://animekai.to
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MegaUp = void 0;
const models_1 = require("../models");
const axios_1 = __importDefault(require("axios"));
/**
 * Thanks to [Seniy](https://github.com/AzartX47/EncDecEndpoints/blob/main/samples/animekai.py) for the api implementation
 */
class MegaUp extends models_1.VideoExtractor {
    constructor(proxyConfig, adapter) {
        super(proxyConfig, adapter);
        this.proxyConfig = proxyConfig;
        this.adapter = adapter;
        this.serverName = 'MegaUp';
        this.sources = [];
        this.apiBase = 'https://enc-dec.app/api';
        this.GenerateToken = async (n) => {
            try {
                const res = await axios_1.default.get(`${this.apiBase}/enc-kai?text=${encodeURIComponent(n)}`);
                return res.data.result;
            }
            catch (error) {
                throw new Error(error.message);
            }
        };
        this.DecodeIframeData = async (n) => {
            try {
                const res = await axios_1.default.post(`${this.apiBase}/dec-kai`, { text: n });
                return res.data.result;
            }
            catch (error) {
                throw new Error(error.message);
            }
        };
        this.Decode = async (n) => {
            try {
                const res = await axios_1.default.post(`${this.apiBase}/dec-mega`, {
                    text: n,
                    agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
                }, { headers: { 'Content-Type': 'application/json' } });
                return res.data.result;
            }
            catch (error) {
                console.log(error);
                throw new Error(error.message);
            }
        };
        this.extract = async (videoUrl) => {
            try {
                const url = videoUrl.href.replace('/e/', '/media/');
                const res = await axios_1.default.get(url, {
                    headers: {
                        Connection: 'keep-alive',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
                    },
                });
                const decrypted = await this.Decode(res.data.result);
                const data = {
                    sources: decrypted.sources.map((s) => ({
                        url: s.file,
                        isM3U8: s.file.includes('.m3u8') || s.file.endsWith('m3u8'),
                    })),
                    subtitles: decrypted.tracks.map(t => ({
                        kind: t.kind,
                        url: t.file,
                        lang: t.label,
                    })),
                    download: decrypted.download,
                };
                return data;
            }
            catch (error) {
                throw new Error(error.message);
            }
        };
    }
}
exports.MegaUp = MegaUp;
//# sourceMappingURL=megaup.js.map