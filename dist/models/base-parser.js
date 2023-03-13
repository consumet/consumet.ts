"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const _1 = require(".");
class BaseParser extends _1.BaseProvider {
    constructor(baseUrl, proxy) {
        super();
        this.validUrl = /^https?:\/\/.+/;
        this.rotateProxy = (proxy, ms = 5000) => {
            setInterval(() => {
                const url = proxy.urls.shift();
                if (url)
                    proxy.urls.push(url);
                this.setProxy({ url: proxy.urls[0], key: proxy.key });
            }, ms);
        };
        this.toMap = (arr) => arr.map((v, i) => [i, v]);
        this.client = axios_1.default.create({
            baseURL: baseUrl,
        });
        if (proxy)
            this.setProxy(proxy);
    }
    /**
     * Set or Change the proxy config
     */
    setProxy(proxy) {
        if (!(proxy === null || proxy === void 0 ? void 0 : proxy.url))
            return;
        if (typeof (proxy === null || proxy === void 0 ? void 0 : proxy.url) === 'string')
            if (!this.validUrl.test(proxy.url))
                throw new Error('Proxy URL is invalid!');
        if (Array.isArray(proxy === null || proxy === void 0 ? void 0 : proxy.url)) {
            for (const [i, url] of this.toMap(proxy.url))
                if (!this.validUrl.test(url))
                    throw new Error(`Proxy URL at index ${i} is invalid!`);
            this.rotateProxy(Object.assign(Object.assign({}, proxy), { urls: proxy.url }));
        }
        this.client.interceptors.request.use(config => {
            var _a;
            if (proxy === null || proxy === void 0 ? void 0 : proxy.url) {
                config.headers = Object.assign(Object.assign({}, config.headers), { 'x-api-key': (_a = proxy === null || proxy === void 0 ? void 0 : proxy.key) !== null && _a !== void 0 ? _a : '', "Origin": "axios" });
                config.url = `${proxy.url}${config === null || config === void 0 ? void 0 : config.baseURL}${(config === null || config === void 0 ? void 0 : config.url) ? config === null || config === void 0 ? void 0 : config.url : ''}`;
            }
            return config;
        });
    }
}
exports.default = BaseParser;
//# sourceMappingURL=base-parser.js.map