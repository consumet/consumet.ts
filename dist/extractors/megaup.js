"use strict";
//extractor for https://animekai.to
Object.defineProperty(exports, "__esModule", { value: true });
exports.MegaUp = void 0;
// The code for this is now fetched from outside consumet:
// https://raw.githubusercontent.com/amarullz/kaicodex/refs/heads/main/generated/kai_codex.js
// as this repository auto-updates the extraction keys when they change.
// If something breaks in the future, blame this part.
const models_1 = require("../models");
class MegaUp extends models_1.VideoExtractor {
    constructor(proxyConfig, adapter) {
        super(proxyConfig, adapter);
        this.proxyConfig = proxyConfig;
        this.adapter = adapter;
        this.serverName = 'MegaUp';
        this.sources = [];
        this.GenerateToken = (n) => {
            return this.KAICODEX.enc(n);
        };
        this.DecodeIframeData = (n) => {
            return this.KAICODEX.dec(n);
        };
        this.Decode = (n) => {
            return this.KAICODEX.decMega(n);
        };
        this.extract = async (videoUrl) => {
            try {
                await this.kaicodexReady;
                const url = videoUrl.href.replace(/\/(e|e2)\//, '/media/');
                const res = await this.client.get(url);
                const decrypted = JSON.parse(this.KAICODEX.decMega(res.data.result).replace(/\\/g, ''));
                const data = {
                    sources: decrypted.sources.map((s) => ({
                        url: s.file,
                        isM3U8: s.file.includes('.m3u8') || s.file.endsWith('m3u8'),
                    })),
                    subtitles: decrypted.tracks.map((t) => ({
                        kind: t.kind,
                        url: t.file,
                    })),
                    download: decrypted.download,
                };
                return data;
            }
            catch (error) {
                throw new Error(error.message);
            }
        };
        this.kaicodexReady = this.loadKAICODEX();
    }
    async loadKAICODEX() {
        const extraction_code = 'https://raw.githubusercontent.com/amarullz/kaicodex/refs/heads/main/generated/kai_codex.js';
        const response = await fetch(extraction_code);
        const originalCode = await response.text();
        const wrappedCode = `
      ${originalCode}
      return KAICODEX;
    `;
        const fn = new Function(wrappedCode);
        this.KAICODEX = fn();
    }
}
exports.MegaUp = MegaUp;
//# sourceMappingURL=megaup.js.map