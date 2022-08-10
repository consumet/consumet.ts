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
const __1 = require("..");
/**
 * work in progress
 */
class Filemoon extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'Filemoon';
        this.sources = [];
        this.host = 'https://filemoon.sx';
        this.extract = (videoUrl) => __awaiter(this, void 0, void 0, function* () {
            const options = {
                headers: {
                    Referer: videoUrl.href,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': __1.USER_AGENT,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            };
            const { data } = yield axios_1.default.get(videoUrl.href);
            const s = data.substring(data.indexOf('eval(function') + 5, data.lastIndexOf(')))'));
            try {
                const newScript = 'function run(' + s.split('function(')[1] + '))';
            }
            catch (err) { }
            return this.sources;
        });
    }
}
exports.default = Filemoon;
//# sourceMappingURL=filemoon.js.map