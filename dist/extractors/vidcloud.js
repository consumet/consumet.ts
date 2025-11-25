"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const utils_1 = require("../utils");
const axios_1 = __importDefault(require("axios"));
class VidCloud extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'VidCloud';
        this.sources = [];
        this.extract = async (videoUrl, referer = 'https://flixhq.to/') => {
            var _a, _b, _c;
            try {
                const result = {
                    sources: [],
                    subtitles: [],
                };
                const decUrl = new URL('https://dec.eatmynerds.live');
                decUrl.searchParams.set('url', videoUrl.href);
                const { data: initialData } = await axios_1.default.get(decUrl.toString());
                if (!((_a = initialData === null || initialData === void 0 ? void 0 : initialData.sources) === null || _a === void 0 ? void 0 : _a.length)) {
                    throw new Error('No sources found from the initial request.');
                }
                let masterPlaylistUrl = initialData.sources[0].file;
                let masterPlaylist = null;
                try {
                    const { data } = await axios_1.default.get(masterPlaylistUrl, {
                        headers: {
                            Referer: videoUrl.href,
                            'User-Agent': utils_1.USER_AGENT,
                        },
                        timeout: 10000,
                    });
                    masterPlaylist = data;
                }
                catch (httpsError) {
                    const httpUrl = masterPlaylistUrl.replace('https://', 'http://');
                    try {
                        const { data } = await axios_1.default.get(httpUrl, {
                            headers: {
                                Referer: videoUrl.href,
                                'User-Agent': utils_1.USER_AGENT,
                            },
                            timeout: 10000,
                        });
                        masterPlaylist = data;
                        masterPlaylistUrl = httpUrl;
                    }
                    catch (httpError) {
                        return {
                            sources: [
                                {
                                    url: masterPlaylistUrl,
                                    isM3U8: masterPlaylistUrl.includes('.m3u8'),
                                    quality: 'auto',
                                },
                            ],
                            subtitles: ((_b = initialData.tracks) === null || _b === void 0 ? void 0 : _b.map((s) => {
                                var _a;
                                return ({
                                    url: s.file,
                                    lang: (_a = s.label) !== null && _a !== void 0 ? _a : 'Default',
                                });
                            })) || [],
                        };
                    }
                }
                const sources = [];
                sources.push({
                    url: masterPlaylistUrl,
                    isM3U8: true,
                    quality: 'auto',
                });
                const playlistRegex = /#EXT-X-STREAM-INF:.*RESOLUTION=(\d+x(\d+)).*\n(.*)/g;
                let match;
                while ((match = playlistRegex.exec(masterPlaylist)) !== null) {
                    const quality = `${match[2]}p`;
                    let url = match[3];
                    if (!url.startsWith('http')) {
                        url = new URL(url, masterPlaylistUrl).toString();
                    }
                    sources.push({
                        url,
                        quality,
                        isM3U8: url.includes('.m3u8'),
                    });
                }
                result.sources = sources;
                result.subtitles =
                    ((_c = initialData.tracks) === null || _c === void 0 ? void 0 : _c.map((s) => {
                        var _a;
                        return ({
                            url: s.file,
                            lang: (_a = s.label) !== null && _a !== void 0 ? _a : 'Default',
                        });
                    })) || [];
                return result;
            }
            catch (err) {
                throw err;
            }
        };
    }
}
exports.default = VidCloud;
//# sourceMappingURL=vidcloud.js.map