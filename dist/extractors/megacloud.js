"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const models_1 = require("../models");
const megacloud = {
    script: "https://megacloud.tv/js/player/a/prod/e1-player.min.js?v=",
    sources: "https://megacloud.tv/embed-2/ajax/e-1/getSources?id=",
};
class MegaCloud extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'MegaCloud';
        this.sources = [];
    }
    async extract(videoUrl) {
        var _a, _b, _c;
        try {
            const result = {
                sources: [],
                subtitles: [],
            };
            const videoId = (_c = (_b = (_a = videoUrl === null || videoUrl === void 0 ? void 0 : videoUrl.href) === null || _a === void 0 ? void 0 : _a.split("/")) === null || _b === void 0 ? void 0 : _b.pop()) === null || _c === void 0 ? void 0 : _c.split("?")[0];
            const { data: srcsData } = await this.client.get(megacloud.sources.concat(videoId || ""), {
                headers: {
                    Accept: "*/*",
                    "X-Requested-With": "XMLHttpRequest",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                    Referer: videoUrl.href,
                },
            });
            if (!srcsData) {
                throw new Error("Url may have an invalid video id");
            }
            const encryptedString = srcsData.sources;
            if (srcsData.encrypted && Array.isArray(encryptedString)) {
                result.intro = srcsData.intro;
                result.outro = srcsData.outro;
                result.subtitles = srcsData.tracks.map((s) => ({
                    url: s.file,
                    lang: s.label ? s.label : 'Thumbnails',
                }));
                result.sources = encryptedString.map((s) => ({
                    url: s.file,
                    type: s.type,
                    isM3U8: s.file.includes('.m3u8'),
                }));
                return result;
            }
            const { data } = await this.client.get(megacloud.script.concat(Date.now().toString()));
            const text = data;
            if (!text)
                throw new Error("Couldn't fetch script to decrypt resource");
            const vars = this.extractVariables(text, "MEGACLOUD");
            const { secret, encryptedSource } = this.getSecret(encryptedString, vars);
            const decrypted = this.decrypt(encryptedSource, secret);
            try {
                const sources = JSON.parse(decrypted);
                result.intro = srcsData.intro;
                result.outro = srcsData.outro;
                result.subtitles = srcsData.tracks.map((s) => ({
                    url: s.file,
                    lang: s.label ? s.label : 'Thumbnails',
                }));
                result.sources = sources.map((s) => ({
                    url: s.file,
                    type: s.type,
                    isM3U8: s.file.includes('.m3u8'),
                }));
                return result;
            }
            catch (error) {
                throw new Error("Failed to decrypt resource");
            }
        }
        catch (err) {
            throw err;
        }
    }
    extractVariables(text, sourceName) {
        var _a, _b, _c, _d;
        let allvars;
        if (sourceName !== "MEGACLOUD") {
            allvars =
                (_b = (_a = text
                    .match(/const (?:\w{1,2}=(?:'.{0,50}?'|\w{1,2}\(.{0,20}?\)).{0,20}?,){7}.+?;/gm)) === null || _a === void 0 ? void 0 : _a.at(-1)) !== null && _b !== void 0 ? _b : "";
        }
        else {
            allvars =
                (_d = (_c = text
                    .match(/const \w{1,2}=new URLSearchParams.+?;(?=function)/gm)) === null || _c === void 0 ? void 0 : _c.at(-1)) !== null && _d !== void 0 ? _d : "";
        }
        const vars = allvars
            .slice(0, -1)
            .split("=")
            .slice(1)
            .map((pair) => Number(pair.split(",").at(0)))
            .filter((num) => num === 0 || num);
        return vars;
    }
    getSecret(encryptedString, values) {
        let secret = "", encryptedSource = encryptedString, totalInc = 0;
        for (let i = 0; i < values[0]; i++) {
            let start, inc;
            switch (i) {
                case 0:
                    (start = values[2]), (inc = values[1]);
                    break;
                case 1:
                    (start = values[4]), (inc = values[3]);
                    break;
                case 2:
                    (start = values[6]), (inc = values[5]);
                    break;
                case 3:
                    (start = values[8]), (inc = values[7]);
                    break;
                case 4:
                    (start = values[10]), (inc = values[9]);
                    break;
                case 5:
                    (start = values[12]), (inc = values[11]);
                    break;
                case 6:
                    (start = values[14]), (inc = values[13]);
                    break;
                case 7:
                    (start = values[16]), (inc = values[15]);
                    break;
                case 8:
                    (start = values[18]), (inc = values[17]);
            }
            const from = start + totalInc, to = from + inc;
            (secret += encryptedString.slice(from, to)),
                (encryptedSource = encryptedSource.replace(encryptedString.substring(from, to), "")),
                (totalInc += inc);
        }
        return { secret, encryptedSource };
    }
    decrypt(encrypted, keyOrSecret, maybe_iv) {
        let key;
        let iv;
        let contents;
        if (maybe_iv) {
            key = keyOrSecret;
            iv = maybe_iv;
            contents = encrypted;
        }
        else {
            const cypher = Buffer.from(encrypted, "base64");
            const salt = cypher.subarray(8, 16);
            const password = Buffer.concat([
                Buffer.from(keyOrSecret, "binary"),
                salt,
            ]);
            const md5Hashes = [];
            let digest = password;
            for (let i = 0; i < 3; i++) {
                md5Hashes[i] = crypto_1.default.createHash("md5").update(digest).digest();
                digest = Buffer.concat([md5Hashes[i], password]);
            }
            key = Buffer.concat([md5Hashes[0], md5Hashes[1]]);
            iv = md5Hashes[2];
            contents = cypher.subarray(16);
        }
        const decipher = crypto_1.default.createDecipheriv("aes-256-cbc", key, iv);
        const decrypted = decipher.update(contents, typeof contents === "string" ? "base64" : undefined, "utf8") + decipher.final();
        return decrypted;
    }
}
exports.default = MegaCloud;
//# sourceMappingURL=megacloud.js.map