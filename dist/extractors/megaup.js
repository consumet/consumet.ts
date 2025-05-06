"use strict";
//extractor for https://animekai.to
Object.defineProperty(exports, "__esModule", { value: true });
exports.MegaUp = void 0;
// Keys required for the decryption to work are loaded dynamically from
// https://raw.githubusercontent.com/amarullz/kaicodex/main/generated/keys.json
const models_1 = require("../models");
class MegaUp extends models_1.VideoExtractor {
    constructor(proxyConfig, adapter) {
        super(proxyConfig, adapter);
        this.proxyConfig = proxyConfig;
        this.adapter = adapter;
        this.serverName = 'MegaUp';
        this.sources = [];
        this.homeKeys = [];
        this.megaKeys = [];
        this.keysChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-~!*()'.".split('');
        this.GenerateToken = (n) => {
            n = encodeURIComponent(n);
            const l = n.length;
            let o = [];
            for (var i = 0; i < l; i++) {
                const kc = this.homeKeys[this.keysChar.indexOf(n.charAt(i))];
                const c = kc.charAt(i % kc.length);
                o.push(c);
            }
            return btoa(o.join('')).replace(/\//g, '_').replace(/\+/g, '-').replace(/\=/g, '');
        };
        this.DecodeIframeData = (n) => {
            n = atob(n.replace(/_/g, '/').replace(/-/g, '+'));
            const l = n.length;
            let o = [];
            for (var i = 0; i < l; i++) {
                const c = n.charCodeAt(i);
                const k = this.megaKeys[c];
                o.push(k.charCodeAt(i % k.length));
            }
            return decodeURIComponent(String.fromCharCode.apply(null, o));
        };
        this.Decode = (n) => {
            n = atob(n.replace(/_/g, '/').replace(/-/g, '+'));
            const l = n.length;
            let o = [];
            for (var i = 0; i < l; i++) {
                const c = n.charCodeAt(i);
                let cp = '';
                for (var j = 0; j < this.homeKeys.length; j++) {
                    var ck = this.homeKeys[j].charCodeAt(i % this.homeKeys[j].length);
                    if (ck === c) {
                        cp = this.keysChar[j];
                        break;
                    }
                }
                if (cp) {
                    o.push(cp);
                }
                else {
                    o.push('%');
                }
            }
            return decodeURIComponent(o.join(''));
        };
        this.extract = async (videoUrl) => {
            try {
                await this.kaiKeysReady;
                const url = videoUrl.href.replace(/\/(e|e2)\//, '/media/');
                const res = await this.client.get(url);
                const decrypted = JSON.parse(this.DecodeIframeData(res.data.result).replace(/\\/g, ''));
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
        this.kaiKeysReady = this.loadKAIKEYS();
    }
    async loadKAIKEYS() {
        const extraction_keys = 'https://raw.githubusercontent.com/amarullz/kaicodex/main/generated/keys.json';
        const response = await this.client.get(extraction_keys);
        const keys = await response.data;
        for (var i = 0; i < keys.kai.length; i++) {
            this.homeKeys.push(atob(keys.kai[i]));
        }
        for (var i = 0; i < keys.mega.length; i++) {
            this.megaKeys.push(atob(keys.mega[i]));
        }
    }
}
exports.MegaUp = MegaUp;
//# sourceMappingURL=megaup.js.map