"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
class AnimeParser extends _1.BaseParser {
    constructor() {
        super(...arguments);
        /**
         * if the provider has dub and it's avialable seperatly from sub set this to `true`
         */
        this.isDubAvailableSeparately = false;
    }
}
exports.default = AnimeParser;
//# sourceMappingURL=anime-parser.js.map