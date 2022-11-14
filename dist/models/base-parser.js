"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
class BaseParser extends _1.BaseProvider {
    set proxyUrl(url) {
        if (url && !url.startsWith('http'))
            throw new Error('[BaseParser] Invalid proxy url');
        if (url && !url.endsWith('/'))
            url += '/';
        this.proxy = url;
    }
    get proxyUrl() {
        return this.proxy;
    }
}
exports.default = BaseParser;
//# sourceMappingURL=base-parser.js.map