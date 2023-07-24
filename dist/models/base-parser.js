"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const proxy_1 = __importDefault(require("./proxy"));
class BaseParser extends proxy_1.default.Provider {
    constructor(baseUrl, proxyConfig, adapter) {
        super(baseUrl, proxyConfig, adapter);
    }
}
exports.default = BaseParser;
//# sourceMappingURL=base-parser.js.map