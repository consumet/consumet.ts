"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const megacloud_util_1 = require("./megacloud-util");
class MegaCloud extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'MegaCloud';
        this.sources = [];
        this.extract = async (videoUrl) => {
            try {
                const result = await (0, megacloud_util_1.extractMegaCloudSources)(videoUrl);
                return {
                    sources: result.sources,
                    subtitles: result.subtitles,
                    intro: result.intro,
                    outro: result.outro,
                };
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
}
exports.default = MegaCloud;
//# sourceMappingURL=megacloud.js.map