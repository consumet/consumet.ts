"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const proxy_1 = __importDefault(require("./proxy"));
class BaseProvider extends proxy_1.default {
    constructor() {
        super(...arguments);
        /**
         * Most providers are english based, but if the provider is not english based override this value.
         * must be in [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) format
         */
        this.languages = 'en';
        /**
         * override as `true` if the provider **only** supports NSFW content
         */
        this.isNSFW = false;
        /**
         * override as `false` if the provider is **down** or **not working**
         */
        this.isWorking = true;
    }
    /**
     * returns provider stats
     */
    get toString() {
        return {
            name: this.name,
            baseUrl: this.baseUrl,
            lang: this.languages,
            isNSFW: this.isNSFW,
            logo: this.logo,
            classPath: this.classPath,
            isWorking: this.isWorking,
        };
    }
}
exports.default = BaseProvider;
//# sourceMappingURL=base-provider.js.map