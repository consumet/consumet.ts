"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Proxy = void 0;
const axios_1 = __importDefault(require("axios"));
const axios_cache_interceptor_1 = require("axios-cache-interceptor");
class Proxy {
    constructor(proxyConfig, adapter) {
        this.proxyConfig = proxyConfig;
        this.adapter = adapter;
        // Prefer URL() over regex for validation
        this.isValidUrl = (value) => {
            try {
                const u = new URL(value);
                return u.protocol === 'http:' || u.protocol === 'https:';
            }
            catch (_a) {
                return false;
            }
        };
        const instance = axios_1.default.create();
        this.client = (0, axios_cache_interceptor_1.setupCache)(instance);
        if (adapter)
            this.setAxiosAdapter(adapter);
        if (proxyConfig)
            this.setProxy(proxyConfig);
    }
    /**
     * Set or Change the proxy config
     */
    setProxy(proxyConfig) {
        var _a;
        if (!(proxyConfig === null || proxyConfig === void 0 ? void 0 : proxyConfig.url))
            return;
        // Clear any existing rotation when changing strategy
        if (this.rotationTimer) {
            clearInterval(this.rotationTimer);
            this.rotationTimer = undefined;
        }
        if (Array.isArray(proxyConfig.url)) {
            // Validate all
            proxyConfig.url.forEach((u, i) => {
                if (!this.isValidUrl(u))
                    throw new Error(`Proxy URL at index ${i} is invalid!`);
            });
            const urls = [...proxyConfig.url];
            // Apply immediately with the first URL
            this.applyProxyUrl(urls[0], proxyConfig.key);
            // Start rotation
            this.rotationTimer = setInterval(() => {
                const next = urls.shift();
                if (next)
                    urls.push(next);
                this.applyProxyUrl(urls[0], proxyConfig.key);
            }, (_a = proxyConfig.rotateInterval) !== null && _a !== void 0 ? _a : 5000);
            return;
        }
        // Single URL
        if (typeof proxyConfig.url === 'string') {
            if (!this.isValidUrl(proxyConfig.url))
                throw new Error('Proxy URL is invalid!');
            this.applyProxyUrl(proxyConfig.url, proxyConfig.key);
        }
    }
    /**
     * Apply a single proxy URL by (re)installing the request interceptor
     */
    applyProxyUrl(proxyUrl, key) {
        // Eject previous interceptor if any
        if (this.proxyInterceptorId !== undefined) {
            this.client.interceptors.request.eject(this.proxyInterceptorId);
            this.proxyInterceptorId = undefined;
        }
        // Install new interceptor
        this.proxyInterceptorId = this.client.interceptors.request.use(config => {
            var _a, _b, _c, _d;
            // Use baseURL instead of string-concatenating into url
            // Only set baseURL if it isn't already the same proxy
            if (!config.baseURL || !config.baseURL.startsWith(proxyUrl)) {
                config.baseURL = proxyUrl;
            }
            if (key) {
                // Axios v1 headers are AxiosHeaders; guard just in case
                config.headers = (_a = config.headers) !== null && _a !== void 0 ? _a : {};
                config.headers.set ? config.headers.set('x-api-key', key) : (config.headers['x-api-key'] = key);
            }
            // Only try to set User-Agent in Node (browser disallows it)
            const isNode = typeof process !== 'undefined' && !!((_b = process.versions) === null || _b === void 0 ? void 0 : _b.node);
            if (isNode && ((_c = config.url) === null || _c === void 0 ? void 0 : _c.includes('anify'))) {
                config.headers = (_d = config.headers) !== null && _d !== void 0 ? _d : {};
                config.headers.set
                    ? config.headers.set('User-Agent', 'consumet')
                    : (config.headers['User-Agent'] = 'consumet');
            }
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