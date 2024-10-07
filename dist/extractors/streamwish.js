"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const utils_1 = require("../utils");
class StreamWish extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'streamwish';
        this.sources = [];
        this.extract = async (videoUrl) => {
            var _a, _b;
            try {
                const options = {
                    headers: {
                        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                        'Accept-Encoding': 'gzip, deflate, zstd',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Cache-Control': 'max-age=0',
                        Priority: 'u=0, i',
                        Origin: videoUrl.origin,
                        Referer: videoUrl.origin,
                        'Sec-Ch-Ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
                        'Sec-Ch-Ua-Mobile': '?0',
                        'Sec-Ch-Ua-Platform': 'Windows',
                        'Sec-Fetch-Dest': 'document',
                        'Sec-Fetch-Mode': 'navigate',
                        'Sec-Fetch-Site': 'none',
                        'Sec-Fetch-User': '?1',
                        'Upgrade-Insecure-Requests': '1',
                        'User-Agent': utils_1.USER_AGENT,
                    },
                };
                // console.log(videoUrl.href,"videoUrl")
                const { data } = await this.client.get(videoUrl.href, options);
                // Code adapted from Zenda-Cross (https://github.com/Zenda-Cross/vega-app/blob/main/src/lib/providers/multi/multiGetStream.ts)
                // Thank you to Zenda-Cross for the original implementation.
                const functionRegex = /eval\(function\((.*?)\)\{.*?return p\}.*?\('(.*?)'\.split/;
                const match = functionRegex.exec(data);
                let p = '';
                if (match) {
                    const params = match[1].split(',').map(param => param.trim());
                    const encodedString = match[0];
                    p = (_a = encodedString.split("',36,")) === null || _a === void 0 ? void 0 : _a[0].trim();
                    const a = 36;
                    let c = encodedString.split("',36,")[1].slice(2).split('|').length;
                    const k = encodedString.split("',36,")[1].slice(2).split('|');
                    while (c--) {
                        if (k[c]) {
                            const regex = new RegExp('\\b' + c.toString(a) + '\\b', 'g');
                            p = p.replace(regex, k[c]);
                        }
                    }
                    // console.log('Decoded String:', p);
                }
                else {
                    console.log('No match found');
                }
                const links = (_b = p.match(/file:\s*"([^"]+\.m3u8[^"]*)"/)) !== null && _b !== void 0 ? _b : [];
                let lastLink = null;
                links.forEach((link) => {
                    if (link.includes('file:"')) {
                        link = link.replace('file:"', '').replace(new RegExp('"', 'g'), '');
                    }
                    const linkParser = new URL(link);
                    linkParser.searchParams.set('i', '0.0');
                    this.sources.push({
                        quality: lastLink ? 'backup' : 'default',
                        url: linkParser.href,
                        isM3U8: link.includes('.m3u8'),
                    });
                    lastLink = link;
                });
                try {
                    const m3u8Content = await this.client.get(this.sources[0].url, options);
                    if (m3u8Content.data.includes('EXTM3U')) {
                        const videoList = m3u8Content.data.split('#EXT-X-STREAM-INF:');
                        for (const video of videoList !== null && videoList !== void 0 ? videoList : []) {
                            if (!video.includes('m3u8'))
                                continue;
                            const url = links[1].split('master.m3u8')[0] + video.split('\n')[1];
                            const quality = video.split('RESOLUTION=')[1].split(',')[0].split('x')[1];
                            this.sources.push({
                                url: url,
                                quality: `${quality}p`,
                                isM3U8: url.includes('.m3u8'),
                            });
                        }
                    }
                }
                catch (e) { }
                return this.sources;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
}
exports.default = StreamWish;
//# sourceMappingURL=streamwish.js.map