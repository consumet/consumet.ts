"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../../models");
class VidCloud extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'VidCloud';
        this.sources = [];
        this.host = 'https://mzzcloud.life';
        this.host2 = 'https://rabbitstream.net';
        this.extract = (videoUrl, isAlternative = false) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = { sources: [], subtitles: [] };
            try {
                const id = (_a = videoUrl.href.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('?')[0];
                const res = yield axios_1.default.get(`${isAlternative ? this.host2 : this.host}/ajax/embed-4/getSources?id=${id}`, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                const { data: { sources, tracks }, } = res;
                this.sources = sources.map((s) => ({
                    url: s.file,
                    isM3U8: s.file.includes('.m3u8'),
                }));
                result.sources.push(...this.sources);
                result.subtitles = tracks.map((s) => ({
                    url: s.file,
                    lang: s.label,
                }));
                return result;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
    }
}
exports.default = VidCloud;
//# sourceMappingURL=vidcloud.js.map