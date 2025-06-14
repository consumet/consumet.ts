"use strict";
// extractor for https://animekai.to
Object.defineProperty(exports, "__esModule", { value: true });
exports.MegaUp = void 0;
const models_1 = require("../models");

class MegaUp extends models_1.VideoExtractor {
    constructor(proxyConfig, adapter) {
        super(proxyConfig, adapter);
        this.proxyConfig = proxyConfig;
        this.adapter = adapter;
        this.serverName = 'MegaUp';
        this.sources = [];

        // Embed KAICODEX logic directly here
        this.KAICODEX = {
            enc: function(n) {
                // Paste the real KAICODEX.enc logic here
                throw new Error("KAICODEX.enc not implemented");
            },
            dec: function(n) {
                // Paste the real KAICODEX.dec logic here
                throw new Error("KAICODEX.dec not implemented");
            },
            decMega: function(n) {
                // Paste the real KAICODEX.decMega logic here
                throw new Error("KAICODEX.decMega not implemented");
            }
        };

        this.GenerateToken = (n) => {
            return this.KAICODEX.enc(n);
        };
        this.DecodeIframeData = (n) => {
            return this.KAICODEX.dec(n);
        };
        this.Decode = (n) => {
            return this.KAICODEX.decMega(n);
        };
    }

    async extract(videoUrl) {
        try {
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
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
exports.MegaUp = MegaUp;