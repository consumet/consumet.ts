"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const proxy_1 = __importDefault(require("../models/proxy"));
class VideoExtractor extends proxy_1.default.Extractor {
    constructor(proxyConfig) {
        super(proxyConfig);
    }
}
exports.default = VideoExtractor;
//# sourceMappingURL=video-extractor.js.map