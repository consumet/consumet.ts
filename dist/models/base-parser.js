"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const proxy_1 = __importDefault(require("./proxy"));
class BaseParser extends proxy_1.default.ProviderProxy {
    constructor(baseUrl, proxyConfig) {
        super(baseUrl, proxyConfig);
    }
}
exports.default = BaseParser;
//# sourceMappingURL=base-parser.js.map