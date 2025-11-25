"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
class Kwik extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'kwik';
        this.sources = [];
        this.baseUrl = 'https://animepahe.si/';
        this.safelinkBaseUrl = 'https://pahe.win/';
        this.extract = async (videoUrl) => {
            try {
                const response = await fetch(`${videoUrl.href}`, {
                    headers: { Referer: this.baseUrl },
                });
                const data = await response.text();
                // good idea if it eval your server rm -rf, or shell execution
                // maybe some want to inject some people server and put it crypto miner
                // const source = eval(/(eval)(\(f.*?)(\n<\/script>)/s.exec(data)![2].replace('eval', '')).match(
                const source = this.safeUnpack(/;(eval)(\(f.*?)(\n<\/script>)/s.exec(data)[2]).match(/https.*?m3u8/);
                this.sources.push({
                    url: source[0],
                    isM3U8: source[0].includes('.m3u8'),
                });
                return this.sources;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
    safeUnpack(packedSource) {
        // 1. Extract arguments using Regex
        // Matches: }('...', radix, count, 'keywords'
        const argsRegex = /}\s*\(\s*'((?:[^'\\]|\\.)*)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'((?:[^'\\]|\\.)*)'\./;
        const match = argsRegex.exec(packedSource);
        if (!match)
            throw new Error('Invalid Packer format or unable to parse safely.');
        let [_, p, aStr, cStr, kStr] = match;
        const a = parseInt(aStr); // Radix
        const c = parseInt(cStr); // Count
        let k = kStr.split('|'); // Keywords
        // 2. Base62 Helper (The 'e' function in packer)
        const base62 = (n) => {
            const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            return n < a ? chars[n] : base62(Math.floor(n / a)) + chars[n % a];
        };
        // 3. Dictionary Fill (Logic: if k[i] is empty, it maps to base62(i))
        // However, standard packer usually provides full dictionary or handles empty slots dynamically.
        // Simple optimization: standard packer replaces based on index.
        const dict = {};
        for (let i = 0; i < c; i++) {
            const key = base62(i);
            const word = k[i] || key; // Fallback if empty
            dict[key] = word;
        }
        // 4. Substitution
        // Regex: /\b\w+\b/g but compliant with packer generated tokens
        return p.replace(/\b\w+\b/g, word => {
            return dict[word] || word;
        });
    }
    // not best Implementation, but it get MP4
    async bypassShortlink(shortinkUrl) {
        try {
            const response = await fetch(`${shortinkUrl.href}`, {
                headers: { Referer: this.baseUrl },
            });
            const data = await response.text();
            // not the best, but assume the format always like this
            const destination = data.match(`a.redirect\\\"\\\)\.attr\\\(\\\"href","(https://[^"]+)`);
            return destination[1];
        }
        catch (err) {
            throw new Error(err.message);
        }
    }
    async getDirectDownloadLink(downloadUrl) {
        var _a;
        try {
            if (downloadUrl.href.match(this.safelinkBaseUrl)) {
                const bypassedUrl = await this.bypassShortlink(downloadUrl);
                downloadUrl = new URL(bypassedUrl);
            }
            const response = await fetch(`${downloadUrl.href}`, {
                headers: { Referer: this.baseUrl },
            });
            const cookie = (_a = response.headers.get('set-cookie')) === null || _a === void 0 ? void 0 : _a.split(';')[0];
            const data = await response.text();
            const obfuscatedParams = data.match(`\\\}\\\("([^"]+)".*?"([^"]+)"\s*,\s*([^,]+)\s*,\s*([^,]+)`);
            const formScript = this.deobfuscate(obfuscatedParams[1], obfuscatedParams[2], Number(obfuscatedParams[3]), Number(obfuscatedParams[4]));
            const formActionUrl = formScript.match(/form action="([^"]+)/)[1];
            const postToken = formScript.match(/name="_token" value="([^"]+)/)[1];
            const formData = new URLSearchParams();
            formData.append('_token', postToken);
            const formResponse = await fetch(`${formActionUrl}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Referer: `${downloadUrl.href}`,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
                    Cookie: cookie,
                },
                body: formData,
                redirect: 'manual',
            });
            if (formResponse.status === 302) {
                return formResponse.headers.get('location');
            }
            // default to downloadUrl, overkill, but it try to get MP4
            return downloadUrl.href;
        }
        catch (err) {
            return downloadUrl.href;
        }
    }
    /**
     * @param payload - The encrypted string containing delimiters
     * @param key - The custom alphabet string (e.g., "dcnCbMvPQ")
     * @param offset - The integer to subtract from the decoded value (e.g., 14)
     * @param radix - The base of the number system (e.g., 5)
     */
    deobfuscate(payload, key, offset, radix) {
        let result = '';
        const delimiter = key[radix];
        const chunks = payload.split(delimiter);
        const map = {};
        for (let i = 0; i < key.length; i++) {
            map[key[i]] = i;
        }
        for (const chunk of chunks) {
            if (chunk.length === 0)
                continue;
            let val = 0;
            for (let i = 0; i < chunk.length; i++) {
                val = val * radix + map[chunk[i]];
            }
            // Formula application
            result += String.fromCharCode(val - offset);
        }
        try {
            return decodeURIComponent(escape(result));
        }
        catch (_a) {
            return result;
        }
    }
}
exports.default = Kwik;
//# sourceMappingURL=kwik.js.map