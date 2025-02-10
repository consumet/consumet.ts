"use strict";
//extractor for https://animekai.to
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MegaUp_reverseIt, _MegaUp_base64UrlEncode, _MegaUp_substitute, _MegaUp_transform, _MegaUp_base64UrlDecode;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MegaUp = void 0;
const models_1 = require("../models");
class MegaUp extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'MegaUp';
        this.sources = [];
        _MegaUp_reverseIt.set(this, (n) => {
            return n.split('').reverse().join('');
        });
        _MegaUp_base64UrlEncode.set(this, (str) => {
            return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        });
        _MegaUp_substitute.set(this, (input, keys, values) => {
            const map = Object.fromEntries(keys.split('').map((key, i) => [key, values[i] || '']));
            const a = input
                .split('')
                .map(char => map[char] || char)
                .join('');
            return a;
        });
        _MegaUp_transform.set(this, (n, t) => {
            const v = Array.from({ length: 256 }, (_, i) => i);
            let c = 0, f = '';
            for (let w = 0; w < 256; w++) {
                c = (c + v[w] + n.charCodeAt(w % n.length)) % 256;
                [v[w], v[c]] = [v[c], v[w]];
            }
            for (let a = (c = 0), w = 0; a < t.length; a++) {
                w = (w + 1) % 256;
                c = (c + v[w]) % 256;
                [v[w], v[c]] = [v[c], v[w]];
                f += String.fromCharCode(t.charCodeAt(a) ^ v[(v[w] + v[c]) % 256]);
            }
            return f;
        });
        _MegaUp_base64UrlDecode.set(this, (n) => {
            n = n
                .padEnd(n.length + ((4 - (n.length % 4)) % 4), '=')
                .replace(/-/g, '+')
                .replace(/_/g, '/');
            return atob(n);
        });
        this.GenerateToken = (n) => {
            n = encodeURIComponent(n);
            n = __classPrivateFieldGet(this, _MegaUp_base64UrlEncode, "f").call(this, __classPrivateFieldGet(this, _MegaUp_transform, "f").call(this, 'gEUzYavPrGpj', __classPrivateFieldGet(this, _MegaUp_reverseIt, "f").call(this, n)));
            n = __classPrivateFieldGet(this, _MegaUp_substitute, "f").call(this, n, 'U8nv0tEFGTb', 'bnGvE80UtTF');
            n = __classPrivateFieldGet(this, _MegaUp_substitute, "f").call(this, n, '9ysoRqBZHV', 'oqsZyVHBR9');
            n = __classPrivateFieldGet(this, _MegaUp_reverseIt, "f").call(this, __classPrivateFieldGet(this, _MegaUp_base64UrlEncode, "f").call(this, __classPrivateFieldGet(this, _MegaUp_transform, "f").call(this, 'CSk63F7PwBHJKa', n)));
            n = __classPrivateFieldGet(this, _MegaUp_substitute, "f").call(this, n, 'cKj9BMN15LsdH', 'NL5cdKs1jB9MH');
            return __classPrivateFieldGet(this, _MegaUp_base64UrlEncode, "f").call(this, __classPrivateFieldGet(this, _MegaUp_reverseIt, "f").call(this, __classPrivateFieldGet(this, _MegaUp_base64UrlEncode, "f").call(this, __classPrivateFieldGet(this, _MegaUp_transform, "f").call(this, 'T2zEp1WHL9CsSk7', n))));
        };
        this.DecodeIframeData = (n) => {
            n = __classPrivateFieldGet(this, _MegaUp_base64UrlDecode, "f").call(this, __classPrivateFieldGet(this, _MegaUp_reverseIt, "f").call(this, __classPrivateFieldGet(this, _MegaUp_base64UrlDecode, "f").call(this, n)));
            n = __classPrivateFieldGet(this, _MegaUp_transform, "f").call(this, 'T2zEp1WHL9CsSk7', n);
            n = __classPrivateFieldGet(this, _MegaUp_reverseIt, "f").call(this, __classPrivateFieldGet(this, _MegaUp_substitute, "f").call(this, n, 'NL5cdKs1jB9MH', 'cKj9BMN15LsdH'));
            n = __classPrivateFieldGet(this, _MegaUp_transform, "f").call(this, 'CSk63F7PwBHJKa', __classPrivateFieldGet(this, _MegaUp_base64UrlDecode, "f").call(this, n));
            n = __classPrivateFieldGet(this, _MegaUp_substitute, "f").call(this, n, 'oqsZyVHBR9', '9ysoRqBZHV');
            n = __classPrivateFieldGet(this, _MegaUp_base64UrlDecode, "f").call(this, __classPrivateFieldGet(this, _MegaUp_substitute, "f").call(this, n, 'bnGvE80UtTF', 'U8nv0tEFGTb'));
            n = __classPrivateFieldGet(this, _MegaUp_reverseIt, "f").call(this, __classPrivateFieldGet(this, _MegaUp_transform, "f").call(this, 'gEUzYavPrGpj', n));
            return decodeURIComponent(n);
        };
        this.Decode = (n) => {
            n = __classPrivateFieldGet(this, _MegaUp_base64UrlDecode, "f").call(this, __classPrivateFieldGet(this, _MegaUp_base64UrlDecode, "f").call(this, n));
            n = __classPrivateFieldGet(this, _MegaUp_reverseIt, "f").call(this, __classPrivateFieldGet(this, _MegaUp_transform, "f").call(this, 'E438hS1W9oRmB', n));
            n = __classPrivateFieldGet(this, _MegaUp_reverseIt, "f").call(this, __classPrivateFieldGet(this, _MegaUp_substitute, "f").call(this, n, 'D5qdzkGANMQZEi', 'Q5diEGMADkZzNq'));
            n = __classPrivateFieldGet(this, _MegaUp_base64UrlDecode, "f").call(this, __classPrivateFieldGet(this, _MegaUp_substitute, "f").call(this, __classPrivateFieldGet(this, _MegaUp_transform, "f").call(this, 'NZcfoMD7JpIrgQE', __classPrivateFieldGet(this, _MegaUp_base64UrlDecode, "f").call(this, n)), 'kTr0pjKzBqZV', 'kZpjzTV0KqBr'));
            n = __classPrivateFieldGet(this, _MegaUp_reverseIt, "f").call(this, __classPrivateFieldGet(this, _MegaUp_substitute, "f").call(this, __classPrivateFieldGet(this, _MegaUp_transform, "f").call(this, 'Gay7bxj5B81TJFM', n), 'zcUxoJTi3fgyS', 'oSgyJUfizcTx3'));
            return decodeURIComponent(n);
        };
        this.extract = async (videoUrl) => {
            try {
                const url = videoUrl.href.replace(/\/(e|e2)\//, '/media/');
                const res = await this.client.get(url);
                const decrypted = JSON.parse(this.Decode(res.data.result).replace(/\\/g, ''));
                const data = {
                    sources: decrypted.sources.map((s) => ({
                        url: s.file,
                        isM3U8: s.file.includes('.m3u8') || s.file.endsWith('m3u8'),
                    })),
                    subtitles: decrypted.tracks.map((t) => ({
                        kind: t.kind,
                        src: t.file,
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
_MegaUp_reverseIt = new WeakMap(), _MegaUp_base64UrlEncode = new WeakMap(), _MegaUp_substitute = new WeakMap(), _MegaUp_transform = new WeakMap(), _MegaUp_base64UrlDecode = new WeakMap();
//# sourceMappingURL=megaup.js.map