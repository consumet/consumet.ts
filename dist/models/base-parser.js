"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const axios_1 = __importDefault(require("axios"));
class BaseParser extends _1.BaseProvider {
    constructor(baseUrl, proxy) {
        super();
        this.client = axios_1.default.create({
            baseURL: baseUrl,
        });
        this.client.interceptors.request.use(config => {
            var _a;
            if (proxy === null || proxy === void 0 ? void 0 : proxy.url) {
                config.headers = Object.assign(Object.assign({}, config.headers), { 'x-api-key': (_a = proxy === null || proxy === void 0 ? void 0 : proxy.key) !== null && _a !== void 0 ? _a : '' });
                config.url = proxy.url + config.url;
            }
            return config;
        });
    }
}
exports.default = BaseParser;
//# sourceMappingURL=base-parser.js.map