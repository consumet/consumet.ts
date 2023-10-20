"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Proxy = void 0;
const axios_1 = __importDefault(require("axios"));
class Proxy {
    /**
     *
     * @param proxyConfig The proxy config (optional)
     * @param adapter The axios adapter (optional)
     */
    constructor(proxyConfig, adapter) {
        this.proxyConfig = proxyConfig;
        this.adapter = adapter;
        this.validUrl = /^https?:\/\/.+/;
        this.rotateProxy = (proxy) => {
            var _a;
            setInterval(() => {
                const url = proxy.urls.shift();
                if (url)
                    proxy.urls.push(url);
                this.setProxy({ url: proxy.urls[0], key: proxy.key });
            }, (_a = proxy === null || proxy === void 0 ? void 0 : proxy.rotateInterval) !== null && _a !== void 0 ? _a : 5000);
        };
        this.toMap = (arr) => arr.map((v, i) => [i, v]);
        this.client = axios_1.default.create();
        if (proxyConfig)
            this.setProxy(proxyConfig);
        if (adapter)
            this.setAxiosAdapter(adapter);
    }
    /**
     * Set or Change the proxy config
     */
    setProxy(proxyConfig) {
        if (!(proxyConfig === null || proxyConfig === void 0 ? void 0 : proxyConfig.url))
            return;
        if (typeof (proxyConfig === null || proxyConfig === void 0 ? void 0 : proxyConfig.url) === 'string')
            if (!this.validUrl.test(proxyConfig.url))
                throw new Error('Proxy URL is invalid!');
        if (Array.isArray(proxyConfig === null || proxyConfig === void 0 ? void 0 : proxyConfig.url)) {
            for (const [i, url] of this.toMap(proxyConfig.url))
                if (!this.validUrl.test(url))
                    throw new Error(`Proxy URL at index ${i} is invalid!`);
            this.rotateProxy(Object.assign(Object.assign({}, proxyConfig), { urls: proxyConfig.url }));
        }
        this.client.interceptors.request.use(config => {
            var _a, _b;
            if (proxyConfig === null || proxyConfig === void 0 ? void 0 : proxyConfig.url) {
                config.headers = Object.assign(Object.assign({}, config.headers), { 'x-api-key': (_a = proxyConfig === null || proxyConfig === void 0 ? void 0 : proxyConfig.key) !== null && _a !== void 0 ? _a : '' });
                config.url = `${proxyConfig.url}${(config === null || config === void 0 ? void 0 : config.url) ? config === null || config === void 0 ? void 0 : config.url : ''}`;
            }
            if ((_b = config === null || config === void 0 ? void 0 : config.url) === null || _b === void 0 ? void 0 : _b.includes('anify'))
                config.headers = Object.assign(Object.assign({}, config.headers), { 'User-Agent': 'consumet' });
            return config;
        });
    }
    /**
     * Set or Change the axios adapter
     */
    setAxiosAdapter(adapter) {
        this.client.defaults.adapter = adapter;
    }
}
exports.Proxy = Proxy;
exports.default = Proxy;
//# sourceMappingURL=proxy.js.map