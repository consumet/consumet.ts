"use strict";
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
        this.isWorking = true;
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:101.0) Gecko/20100101 Firefox/101.0',
        };
        this.search = async (bookTitle, page = 1) => {
            var _a;
            bookTitle = encodeURIComponent(bookTitle);
            if (page > 10 || page < 1) {
                return;
            }
            const { data } = await get(`${this.baseUrl}/s/${bookTitle}?page=${page}`, {
                headers: this.headers,
            });
            const $ = (0, cheerio_1.load)(data);
            const containers = [];
            $('div.resItemBox').each((i, e) => {
                var _a, _b;
                const container = new models_1.ZLibraryObject();
                const html = $(e).html() || '';
                container.image =
                    $((0, utils_1.genElement)('div table tbody tr td div div a img', html)).attr('data-src')[0] == 'h' &&
                        $((0, utils_1.genElement)('div table tbody tr td div div a img', html)).attr('data-src')[1] == 't' &&
                        $((0, utils_1.genElement)('div table tbody tr td div div a img', html)).attr('data-src')[2] == 't' &&
                        $((0, utils_1.genElement)('div table tbody tr td div div a img', html)).attr('data-src')[3] == 'p'
                        ? `${$((0, utils_1.genElement)('div table tbody tr td div div a img', html)).attr('data-src')}`
                        : `${this.baseUrl}${$((0, utils_1.genElement)('div table tbody tr td div div a img', html)).attr('data-src')}`;
                container.title = $((0, utils_1.genElement)('div table tbody tr td:eq(1) table tbody tr td h3 a', html))
                    .text()
                    .trim();
                container.publisher =
                    (0, utils_1.countDivs)((_a = $((0, utils_1.genElement)('div table tbody tr td:eq(1) table tbody tr td', html)).html()) !== null && _a !== void 0 ? _a : '') == 2
                        ? $((0, utils_1.genElement)('div table tbody tr td:eq(1) table tbody tr td div:eq(0) a', html)).text()
                        : '';
                container.authors =
                    (0, utils_1.countDivs)((_b = $((0, utils_1.genElement)('div table tbody tr td:eq(1) table tbody tr td', html)).html()) !== null && _b !== void 0 ? _b : '') == 2
                        ? $((0, utils_1.genElement)('div table tbody tr td:eq(1) table tbody tr td div:eq(1) a', html))
                            .text()
                            .split(', ')
                        : $((0, utils_1.genElement)('div table tbody tr td:eq(1) table tbody tr td div:eq(0) a', html))
                            .text()
                            .split(', ');
                container.link = `${this.baseUrl}${$((0, utils_1.genElement)('div table tbody tr td:eq(1) table tbody tr td h3 a', html)).attr('href')}`;
                container.year = $((0, utils_1.genElement)('div table tbody tr td:eq(1) table tbody tr:eq(1) td div:eq(1) div div:eq(1)', html)).text();
                container.language = $((0, utils_1.genElement)('div table tbody tr td:eq(1) table tbody tr:eq(1) td div:eq(1) div:eq(1) div:eq(1)', html)).text();
                container.size = $((0, utils_1.genElement)('div table tbody tr td:eq(1) table tbody tr:eq(1) td div:eq(1) div:eq(2) div:eq(1)', html)).text();
                container.bookRating = $((0, utils_1.genElement)('div table tbody tr td:eq(1) table tbody tr:eq(1) td div:eq(1) div:eq(4) div span:eq(0)', html))
                    .text()
                    .trim();
                container.bookQuality = $((0, utils_1.genElement)('div table tbody tr td:eq(1) table tbody tr:eq(1) td div:eq(1) div:eq(4) div span:eq(1)', html))
                    .text()
                    .trim();
                containers.push(container);
            });
            for (let c of containers) {
                const { data } = await get(c.link, {
                    headers: this.headers,
                });
                const $ = (0, cheerio_1.load)(data);
                c.description = $('#bookDescriptionBox').text().trim();
                c.isbn = [
                    $('.property_isbn.10 .property_value').text().trim(),
                    $('.property_isbn.13 .property_value').text().trim(),
                ];
                c.edition = $('.property_edition .property_value').text().trim();
                c.pages = $('.property_pages .property_value').text().trim();
                c.link = (_a = $('.addDownloadedBook').attr('href')) !== null && _a !== void 0 ? _a : '';
            }
            return {
                containers,
                page,
            };
        };
    }
}
exports.default = Zlibrary;
//# sourceMappingURL=zLibrary.js.map