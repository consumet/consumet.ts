"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSources = getSources;
const crypto_js_1 = __importDefault(require("crypto-js"));
const utils_1 = require("../../utils/utils");
const axios_1 = __importDefault(require("axios"));
/**
 * Thanks to https://github.com/yogesh-hacker for the key's api
 * Thanks to https://github.com/illusionTBA for the key's api
 */
async function getSources(embed_url, site) {
    var _a;
    const regex = /\/([^\/?]+)(?=\?)/;
    const xrax = (_a = embed_url.toString().match(regex)) === null || _a === void 0 ? void 0 : _a[1];
    const basePath = embed_url.pathname.split('/').slice(0, 4).join('/');
    const url = `${embed_url.origin}${basePath}/getSources?id=${xrax}`;
    const getKeyType = url.includes('mega') ? 'mega' : url.includes('videostr') ? 'vidstr' : 'rabbit';
    //gets the base64 encoded string from the URL and key in parallel
    let key;
    let data;
    try {
        [{ data }, { data: key }] = await Promise.all([
            axios_1.default.get(url, {
                headers: {
                    'User-Agent': utils_1.USER_AGENT,
                    Referer: site,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            }),
            axios_1.default.get('https://raw.githubusercontent.com/yogesh-hacker/MegacloudKeys/refs/heads/main/keys.json'),
        ]);
    }
    catch (err) {
        [{ data }, { data: key }] = await Promise.all([
            axios_1.default.get(url, {
                headers: {
                    'User-Agent': utils_1.USER_AGENT,
                    Referer: site,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            }),
            axios_1.default.get('https://keys.hs.vc/'),
        ]);
        // Transform keys.hs.vc format to match yogesh-hacker format
        if (key.megacloud && key.rabbitstream) {
            key = {
                mega: key.megacloud.key,
                vidstr: key.rabbitstream.key,
                rabbit: key.rabbitstream.key,
            };
        }
    }
    const sources = JSON.parse(crypto_js_1.default.AES.decrypt(data.sources, key[getKeyType]).toString(crypto_js_1.default.enc.Utf8));
    return {
        sources,
        tracks: data.tracks,
        intro: data === null || data === void 0 ? void 0 : data.intro,
        outro: data === null || data === void 0 ? void 0 : data.outro,
    };
}
//# sourceMappingURL=megacloud.getsrcs.js.map