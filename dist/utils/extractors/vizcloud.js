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
class VizCloud extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'VizCloud';
        this.sources = [];
        this.host = 'https://vizcloud.site';
        this.keys = {
            cipher: '',
            encrypt: '',
            main: '',
            dashTable: '',
        };
        this.base64Table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+=/_';
        this.extract = (videoUrl, cipher, encrypt) => __awaiter(this, void 0, void 0, function* () {
            const groups = videoUrl.href.split('/');
            this.keys = yield this.fetchKeys();
            const id = encrypt(cipher(groups[4], this.keys.cipher), this.keys.encrypt);
            const url = `${this.host}/mediainfo/${this.dashify(id)}?key=${this.keys.main}`;
            const { data } = yield axios_1.default.get(url, {
                headers: {
                    Referer: videoUrl.href,
                },
            });
            this.sources = data.data.media.sources.map((source) => {
                var _a;
                return ({
                    url: source.file,
                    isM3U8: (_a = source.file) === null || _a === void 0 ? void 0 : _a.includes('.m3u8'),
                });
            });
            return this.sources;
        });
        // lagrad :)
        this.dashify = (id) => {
            const table = this.keys.dashTable.split(' ');
            const dashedId = id
                .split('')
                .map((char, i) => table[this.base64Table.indexOf(char) * 16 + (i % 16)])
                .join('-');
            return dashedId;
        };
        this.fetchKeys = () => __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios_1.default.get('https://raw.githubusercontent.com/chenkaslowankiya/BruhFlow/main/keys.json');
            return data;
        });
    }
}
exports.default = VizCloud;
//# sourceMappingURL=vizcloud.js.map