"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const utils_1 = require("../utils");
/**
 * work in progress
 */
class Filemoon extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'Filemoon';
        this.sources = [];
        this.host = 'https://filemoon.sx';
        this.extract = async (videoUrl) => {
            const options = {
                headers: {
                    Referer: videoUrl.href,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': utils_1.USER_AGENT,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            };
            const { data } = await this.client.get(videoUrl.href);
            const s = data.substring(data.indexOf('eval(function') + 5, data.lastIndexOf(')))'));
            try {
                const newScript = 'function run(' + s.split('function(')[1] + '))';
            }
            catch (err) { }
            return this.sources;
        };
    }
}
exports.default = Filemoon;
//# sourceMappingURL=filemoon.js.map