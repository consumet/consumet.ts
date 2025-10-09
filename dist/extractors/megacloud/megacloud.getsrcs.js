"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSources = getSources;
const utils_1 = require("../../utils/utils");
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
/**
 * Thanks to https://github.com/yogesh-hacker for the original implementation.
 */
async function getSources(embed_url, site) {
    var _a, _b;
    const regex = /\/([^\/?]+)(?=\?)/;
    const xrax = (_a = embed_url.toString().match(regex)) === null || _a === void 0 ? void 0 : _a[1];
    const basePath = embed_url.pathname.split('/').slice(0, 4).join('/');
    const url = `${embed_url.origin}${basePath}/getSources?id=${xrax}}`;
    const getKeyType = url.includes('mega') ? 'mega' : url.includes('videostr') ? 'vidstr' : 'rabbit';
    //gets the base64 encoded string from the URL and key in parallel
    let key;
    const headers = {
        Accept: '*/*',
        'X-Requested-With': 'XMLHttpRequest',
        Referer: site,
        'User-Agent': utils_1.USER_AGENT,
    };
    try {
        const { data: keyData } = await axios_1.default.get('https://raw.githubusercontent.com/yogesh-hacker/MegacloudKeys/refs/heads/main/keys.json');
        key = keyData;
    }
    catch (err) {
        console.error('❌ Error fetching key:', err);
        throw new Error('Failed to fetch key');
    }
    let videoTag;
    let embedRes;
    try {
        embedRes = await axios_1.default.get(embed_url.href, { headers });
        const $ = (0, cheerio_1.load)(embedRes.data);
        videoTag = $('#megacloud-player');
    }
    catch (error) {
        console.error('❌ Error fetching embed URL:', error);
        throw new Error('Failed to fetch embed URL');
    }
    if (!videoTag.length) {
        console.error('❌ Looks like URL expired!');
        throw new Error('Embed tag not found');
    }
    const rawText = embedRes.data;
    let nonceMatch = rawText.match(/\b[a-zA-Z0-9]{48}\b/);
    if (!nonceMatch) {
        const altMatch = rawText.match(/\b([a-zA-Z0-9]{16})\b.*?\b([a-zA-Z0-9]{16})\b.*?\b([a-zA-Z0-9]{16})\b/);
        if (altMatch)
            nonceMatch = [altMatch.slice(1).join('')];
    }
    const nonce = nonceMatch === null || nonceMatch === void 0 ? void 0 : nonceMatch[0];
    if (!nonce) {
        console.error('❌ Nonce not found!');
        throw new Error('Nonce not found');
    }
    const fileId = videoTag.attr('data-id');
    const { data: encryptedResData } = await axios_1.default.get(`${embed_url.origin}${basePath}/getSources?id=${fileId}&_k=${nonce}`, {
        headers,
    });
    const encrypted = encryptedResData.encrypted;
    const sources = encryptedResData.sources;
    let videoSrc = [];
    if (encrypted) {
        const decodeUrl = 'https://script.google.com/macros/s/AKfycbxHbYHbrGMXYD2-bC-C43D3njIbU-wGiYQuJL61H4vyy6YVXkybMNNEPJNPPuZrD1gRVA/exec';
        const params = new URLSearchParams({
            encrypted_data: sources,
            nonce: nonce,
            secret: key[getKeyType],
        });
        const decodeRes = await axios_1.default.get(`${decodeUrl}?${params.toString()}`);
        videoSrc = JSON.parse((_b = decodeRes.data.match(/\[.*?\]/s)) === null || _b === void 0 ? void 0 : _b[0]);
    }
    else {
        videoSrc = sources;
    }
    return {
        sources: videoSrc,
        tracks: encryptedResData.tracks,
        intro: encryptedResData === null || encryptedResData === void 0 ? void 0 : encryptedResData.intro,
        outro: encryptedResData === null || encryptedResData === void 0 ? void 0 : encryptedResData.outro,
    };
}
//# sourceMappingURL=megacloud.getsrcs.js.map