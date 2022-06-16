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
const models_1 = require("../../../models");
const utils_1 = require("../../../utils");
const ascii_url_encoder_1 = require("ascii-url-encoder");
const { get } = axios_1.default;
class Libgen extends models_1.BookParser {
    constructor() {
        super(...arguments);
        this.extensions = ['.rs', '.is', '.st'];
        this.baseUrl = 'http://libgen';
        this.name = 'libgen';
        this.downloadIP = 'http://62.182.86.140';
        this.fastSearch = () => { };
        this.search = (query, maxResults) => __awaiter(this, void 0, void 0, function* () {
            let page;
            let workingExtension = this.extensions[0];
            const containers = [];
            for (let extension of this.extensions) {
                workingExtension = extension;
                page = yield get(`${this.baseUrl}${extension}/search.php?req=${query}&view=simple&res=${maxResults > 0 ? maxResults : 25}`);
                if (page.status <= 399)
                    break;
            }
            const $ = (0, cheerio_1.load)(page.data);
            let rawAuthor = '';
            $('table tbody tr').each((i, e) => {
                const container = new models_1.LibgenBookObject();
                $(e.children).each((i, e) => {
                    if ($(e).text() === '\n\t\t\t\t')
                        return;
                    switch (i) {
                        case 0:
                            container.id = $(e).text();
                            break;
                        case 2:
                            rawAuthor = $(e).text();
                            container.authors = (0, utils_1.splitAuthor)(rawAuthor);
                            break;
                        case 4:
                            let potLink = '';
                            $(e)
                                .children()
                                .each((i, el) => {
                                var _a;
                                if (potLink != '') {
                                    return;
                                }
                                if (((_a = $(el).attr('href')) === null || _a === void 0 ? void 0 : _a.at(0)) === 'b') {
                                    potLink = $(el).attr('href') || '';
                                }
                            });
                            container.link = `${this.baseUrl}${workingExtension}/${potLink}`;
                        case 6:
                            container.publisher = $(e).text();
                            break;
                        case 8:
                            container.year = $(e).text();
                            break;
                        case 10:
                            container.pages = $(e).text();
                            break;
                        case 12:
                            container.language = $(e).text();
                            break;
                        case 14:
                            container.size = $(e).text();
                            break;
                        case 16:
                            container.format = $(e).text();
                            break;
                    }
                });
                containers[i] = container;
            });
            containers.shift();
            for (let i = 0; i < containers.length; i++) {
                const data = yield get(containers[i].link);
                const $ = (0, cheerio_1.load)(data.data);
                let tempTitle = '';
                let tempVolume = '';
                $('tbody > tr:eq(1)')
                    .children()
                    .each((i, el) => {
                    switch (i) {
                        case 2:
                            tempTitle = $(el).text();
                            break;
                        case 4:
                            tempVolume = $(el).text();
                    }
                });
                containers[i].title = tempTitle;
                containers[i].volume = tempVolume;
                containers[i].image = `${this.baseUrl}${workingExtension}` + $('img').attr('src');
                let tempIsbn = [];
                $('tbody > tr:eq(15)')
                    .children()
                    .each((i, el) => {
                    switch (i) {
                        case 1:
                            tempIsbn = $(el).text().split(', ');
                            break;
                    }
                });
                containers[i].isbn = tempIsbn;
                containers[i].description = $('tbody > tr:eq(31)').text() || '';
                containers[i].tableOfContents = $('tbody > tr:eq(32)').text() || '';
                let tempSeries = '';
                $('tbody > tr:eq(11)')
                    .children()
                    .each((i, el) => {
                    switch (i) {
                        case 1:
                            tempSeries = $(el).text();
                            break;
                    }
                });
                containers[i].series = tempSeries;
                let tempTopic = '';
                $('tbody > tr:eq(22)')
                    .children()
                    .each((i, el) => {
                    switch (i) {
                        case 1:
                            tempTopic = $(el).text();
                            break;
                    }
                });
                containers[i].topic = tempTopic;
                let tempEdition = '';
                $('tbody > tr:eq(13)')
                    .children()
                    .each((i, el) => {
                    switch (i) {
                        case 3:
                            tempEdition = $(el).text();
                            break;
                    }
                });
                containers[i].edition = tempEdition;
                for (let p = 2; p <= 8; p++) {
                    let temp = '';
                    $(`tbody tr:eq(${p})`)
                        .children()
                        .each((i, el) => {
                        switch (i) {
                            case 1:
                                temp = $(el).text();
                        }
                    });
                    switch (p) {
                        case 2:
                            containers[i].hashes.AICH = temp;
                            break;
                        case 3:
                            containers[i].hashes.CRC32 = temp;
                            break;
                        case 4:
                            containers[i].hashes.eDonkey = temp;
                            break;
                        case 5:
                            containers[i].hashes.MD5 = temp;
                            break;
                        case 6:
                            containers[i].hashes.SHA1 = temp;
                            break;
                        case 7:
                            containers[i].hashes.SHA256 = temp.split(' ');
                            break;
                        case 8:
                            containers[i].hashes.TTH = temp;
                            break;
                    }
                }
                let realLink = '';
                const fakeLink = containers[i].link;
                for (let i = 0; i < fakeLink.length; i++) {
                    if (fakeLink[i] === 'm' &&
                        fakeLink[i + 1] === 'd' &&
                        fakeLink[i + 2] === '5' &&
                        fakeLink[i + 3] === '=') {
                        realLink = fakeLink.substring(i + 4, fakeLink.length);
                        break;
                    }
                }
                containers[i].link = `${this.downloadIP}/main/${(0, utils_1.floorID)(containers[i].id)}/${realLink.toLowerCase()}/${(0, ascii_url_encoder_1.encode)(`${containers[i].series == '' ? '' : `(${containers[i].series})`} ${rawAuthor} - ${containers[i].title}-${containers[i].publisher} (${containers[i].year}).${containers[i].format}`)}`;
            }
            return containers;
        });
        this.fetchBookInfo = (bookUrl) => {
            throw Error('Method not implemneted.');
        };
    }
}
//# sourceMappingURL=libgen.js.map