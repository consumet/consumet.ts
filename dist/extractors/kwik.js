"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const models_1 = require("../models");
class Kwik extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'kwik';
        this.sources = [];
        this.host = 'https://animepahe.com';
        // private readonly sgProxy = 'https://cors.consumet.stream';
        this.extract = async (videoUrl) => {
            try {
                const { data } = await axios_1.default.get(`${videoUrl.href}`, {
                    headers: { Referer: this.host },
                });
                const match = (0, cheerio_1.load)(data)
                    .html()
                    .match(/p\}.*kwik.*/g);
                if (!match) {
                    throw new Error('Video not found.');
                }
                let arr = match[0].split('return p}(')[1].split(',');
                const l = arr.slice(0, arr.length - 5).join('');
                arr = arr.slice(arr.length - 5, -1);
                arr.unshift(l);
                const [p, a, c, k, e, d] = arr.map(x => x.split('.sp')[0]);
                const formated = this.format(p, a, c, k, e, {});
                const source = formated
                    .match(/source=\\(.*?)\\'/g)[0]
                    .replace(/\'/g, '')
                    .replace(/source=/g, '')
                    .replace(/\\/g, '');
                this.sources.push({
                    url: source,
                    isM3U8: source.includes('.m3u8'),
                });
                return this.sources;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.format = (p, a, c, k, e, d) => {
            k = k.split('|');
            e = (c) => {
                return ((c < a ? '' : e(parseInt((c / a).toString()))) +
                    ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36)));
            };
            if (!''.replace(/^/, String)) {
                while (c--) {
                    d[e(c)] = k[c] || e(c);
                }
                k = [
                    (e) => {
                        return d[e];
                    },
                ];
                e = () => {
                    return '\\w+';
                };
                c = 1;
            }
            while (c--) {
                if (k[c]) {
                    p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]);
                }
            }
            return p;
        };
    }
}
exports.default = Kwik;
//# sourceMappingURL=kwik.js.map