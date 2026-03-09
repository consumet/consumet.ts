"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const megacloud_util_1 = require("./megacloud-util");
class VidCloud extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'VidCloud';
        this.sources = [];
        this.extract = async (videoUrl, referer = 'https://flixhq.to/') => {
            try {
                const result = await (0, megacloud_util_1.extractMegaCloudSources)(videoUrl, referer);
                return {
                    sources: result.sources,
                    subtitles: result.subtitles,
                    intro: result.intro,
                    outro: result.outro,
                };
            }
            catch (err) {
                throw err;
            }
        };
    }
}
exports.default = VidCloud;
//# sourceMappingURL=vidcloud.js.map