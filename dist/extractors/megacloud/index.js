"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../../models");
const megacloud_getsrcs_1 = require("./megacloud.getsrcs");
class MegaCloud extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'MegaCloud';
        this.sources = [];
    }
    async extract(embedIframeURL, referer = 'https://hianime.to') {
        try {
            const extractedData = {
                subtitles: [],
                intro: {
                    start: 0,
                    end: 0,
                },
                outro: {
                    start: 0,
                    end: 0,
                },
                sources: [],
            };
            const resp = await (0, megacloud_getsrcs_1.getSources)(embedIframeURL.href, referer);
            if (!resp)
                return extractedData;
            if (Array.isArray(resp.sources)) {
                extractedData.sources = resp.sources.map((s) => ({
                    url: s.file,
                    isM3U8: s.type === 'hls',
                    type: s.type,
                }));
            }
            extractedData.intro = resp.intro ? resp.intro : extractedData.intro;
            extractedData.outro = resp.outro ? resp.outro : extractedData.outro;
            extractedData.subtitles = resp.tracks.map((track) => ({
                url: track.file,
                lang: track.label ? track.label : track.kind,
            }));
            return {
                intro: extractedData.intro,
                outro: extractedData.outro,
                sources: extractedData.sources,
                subtitles: extractedData.subtitles,
            };
        }
        catch (err) {
            throw err;
        }
    }
}
exports.default = MegaCloud;
//# sourceMappingURL=index.js.map