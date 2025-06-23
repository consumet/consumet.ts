"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const node_vm_1 = __importDefault(require("node:vm"));
class Luffy extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'luffy';
        this.sources = [];
        this.host = 'https://animeowl.me';
        this.extract = async (videoUrl) => {
            var _a;
            try {
                const { data: server } = await this.client.get(videoUrl.href);
                const jwtRegex = /([A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+)/;
                const { data: script } = await this.client.get(`${this.host}/players/${videoUrl.href.split('/').pop()}.v2.js`);
                const c = await this.deobfuscateScript(script);
                const jwt = jwtRegex.exec(c)[0];
                (_a = server['luffy']) === null || _a === void 0 ? void 0 : _a.map((item) => {
                    var _a;
                    this.sources.push({
                        quality: (_a = item.url.match(/[?&]resolution=([^&]+)/)) === null || _a === void 0 ? void 0 : _a[1],
                        url: item.url + jwt,
                    });
                });
                return this.sources;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.deobfuscateScript = async (source) => {
            const response = await this.client.get('https://raw.githubusercontent.com/Kohi-den/extensions-source/9328d12fcfca686becfb3068e9d0be95552c536f/lib/synchrony/src/main/assets/synchrony-v2.4.5.1.js');
            let synchronyScript = response.data;
            const regex = /export\{(.*?) as Deobfuscator,(.*?) as Transformer\};/;
            const match = synchronyScript.match(regex);
            if (!match)
                return null;
            const [fullMatch, deob, trans] = match;
            const replacement = `const Deobfuscator = ${deob}, Transformer = ${trans};`;
            synchronyScript = synchronyScript.replace(fullMatch, replacement);
            const context = {
                source,
                result: '',
                console: { log: () => { }, warn: () => { }, error: () => { }, trace: () => { } },
            };
            node_vm_1.default.createContext(context);
            try {
                node_vm_1.default.runInContext(synchronyScript, context);
                context.result = node_vm_1.default.runInContext(`new Deobfuscator().deobfuscateSource(source)`, context);
                return context.result;
            }
            catch (err) {
                console.error('Deobfuscation failed:', err);
                return null;
            }
        };
    }
}
exports.default = Luffy;
//# sourceMappingURL=luffy.js.map