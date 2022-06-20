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
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const utils_1 = require("../../utils");
const { get } = axios_1.default;
class Zlibrary extends models_1.BookParser {
    constructor() {
        super(...arguments);
        this.baseUrl = 'https://3lib.net';
        this.name = 'ZLibrary';
        this.classPath = 'BOOKS.Zlibrary';
        this.logo = `${this.baseUrl}/img/logo.zlibrary.png`;
        this.isWorking = false;
        this.search = (bookUrl) => __awaiter(this, void 0, void 0, function* () {
            const { data } = yield get(`${this.baseUrl}/s/${bookUrl}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:101.0) Gecko/20100101 Firefox/101.0',
                },
            });
            const $ = (0, cheerio_1.load)(data);
            const containers = [];
            $('div.resItemBox').each((i, e) => {
                var _a;
                const container = new models_1.ZLibraryObject();
                container.image =
                    (_a = $((0, utils_1.genElement)('div table tbody tr td div div a img', $(e).html() || '')).attr('data-src')) !== null && _a !== void 0 ? _a : '';
                container.title = $((0, utils_1.genElement)('div table tbody tr td:eq(1) table tbody tr td h3 a', $(e).html() || ''))
                    .text()
                    .trim();
                container.publisher = $((0, utils_1.genElement)('div table tbody tr td:eq(1) table tbody tr td div:eq(0) a', $(e).html() || '')).text();
                container.authors = $((0, utils_1.genElement)('div table tbody tr td:eq(1) table tbody tr td div:eq(1)', $(e).html() || ''))
                    .text()
                    .split(', ');
                container.link = `${this.baseUrl}${$((0, utils_1.genElement)('div table tbody tr td:eq(1) table tbody tr td h3 a', $(e).html() || '')).attr('href')}`;
                console.log($(e).children('.property_year').text());
                container.year = $(e).children('.property_year .property_value').text();
                container.language = $(e).children('.property_language .property_value').text();
                container.size = (0, utils_1.getSize)($(e).children('.property__file .property_value').text());
                const { rating, quality } = (0, utils_1.splitStar)($(e).children('.book_rating').text());
                container.bookRating = rating;
                container.bookQuality = quality;
                console.log(container);
            });
        });
    }
}
exports.default = Zlibrary;
//# sourceMappingURL=zLibrary.js.map