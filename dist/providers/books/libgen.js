"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const utils_1 = require("../../utils");
const ascii_url_encoder_1 = require("ascii-url-encoder");
class Libgen extends models_1.BookParser {
    constructor() {
        super(...arguments);
        this.extensions = ['.rs', '.is', '.st'];
        this.baseUrl = 'http://libgen';
        /**
         * @type {string}
         */
        this.name = 'Libgen';
        this.downloadIP = 'http://62.182.86.140';
        this.logo = 'https://f-droid.org/repo/com.manuelvargastapia.libgen/en-US/icon_TP2ezvMwW5ovE-wixagF1WCThMUohX3T_kzYhuZQ8aY=.png';
        this.classPath = 'BOOKS.Libgen';
        /**
         * scrapes a ligen book page by book page url
         *
         * @param {string} bookUrl - ligen book page url
         * @returns {Promise<LibgenBook>}
         */
        this.scrapeBook = async (bookUrl) => {
            bookUrl = encodeURIComponent(bookUrl);
            const container = new models_1.LibgenBookObject();
            const { data } = await this.client.get(bookUrl);
            const $ = (0, cheerio_1.load)(data);
            let rawAuthor = '';
            $('tbody > tr:eq(10)')
                .children()
                .each((i, el) => {
                switch (i) {
                    case 1:
                        rawAuthor = $(el).text();
                        break;
                }
            });
            container.authors = (0, utils_1.splitAuthor)(rawAuthor);
            let publisher = '';
            $('tbody > tr:eq(12)')
                .children()
                .each((i, el) => {
                switch (i) {
                    case 1:
                        publisher = $(el).text();
                        break;
                }
            });
            container.publisher = publisher;
            let ex = '';
            let size = '';
            $('tbody > tr:eq(18)')
                .children()
                .each((i, el) => {
                switch (i) {
                    case 1:
                        size = $(el).text();
                        break;
                    case 3:
                        ex = $(el).text();
                        break;
                }
            });
            container.format = ex;
            container.size = size;
            let lang = '';
            let page = '';
            $('tbody > tr:eq(14)')
                .children()
                .each((i, el) => {
                switch (i) {
                    case 1:
                        lang = $(el).text();
                        break;
                    case 3:
                        page = $(el).text().split('/')[0];
                        break;
                }
            });
            container.pages = page;
            container.language = lang;
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
            container.title = tempTitle;
            container.volume = tempVolume;
            container.image = `${this.baseUrl}${this.extensions[0]}` + $('img').attr('src');
            let tempIsbn = [];
            let id = '';
            $('tbody > tr:eq(15)')
                .children()
                .each((i, el) => {
                switch (i) {
                    case 1:
                        tempIsbn = $(el).text().split(', ');
                        break;
                    case 3:
                        id = $(el).text();
                        break;
                }
            });
            container.id = id;
            container.isbn = tempIsbn;
            container.description = $('tbody > tr:eq(31)').text() || '';
            container.tableOfContents = $('tbody > tr:eq(32)').text() || '';
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
            container.series = tempSeries;
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
            container.topic = tempTopic;
            let tempEdition = '';
            let year = '';
            $('tbody > tr:eq(13)')
                .children()
                .each((i, el) => {
                switch (i) {
                    case 1:
                        year = $(el).text();
                        break;
                    case 3:
                        tempEdition = $(el).text();
                        break;
                }
            });
            container.year = year;
            container.edition = tempEdition;
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
                        container.hashes.AICH = temp;
                        break;
                    case 3:
                        container.hashes.CRC32 = temp;
                        break;
                    case 4:
                        container.hashes.eDonkey = temp;
                        break;
                    case 5:
                        container.hashes.MD5 = temp;
                        break;
                    case 6:
                        container.hashes.SHA1 = temp;
                        break;
                    case 7:
                        container.hashes.SHA256 = temp.split(' ');
                        break;
                    case 8:
                        container.hashes.TTH = temp;
                        break;
                }
            }
            let realLink = '';
            const fakeLink = bookUrl;
            for (let i = 0; i < fakeLink.length; i++) {
                if (fakeLink[i] === 'm' &&
                    fakeLink[i + 1] === 'd' &&
                    fakeLink[i + 2] === '5' &&
                    fakeLink[i + 3] === '=') {
                    realLink = fakeLink.substring(i + 4, fakeLink.length);
                    break;
                }
            }
            container.link = `${this.downloadIP}/main/${(0, utils_1.floorID)(container.id)}/${realLink.toLowerCase()}/${(0, ascii_url_encoder_1.encode)(`${container.series == '' ? '' : `(${container.series})`} ${rawAuthor} - ${container.title}-${container.publisher} (${container.year}).${container.format}`)}`;
            return container;
        };
        /**
         * scrapes a libgen search page and returns an array of results
         *
         * @param {string} query - the name of the book
         * @param {number} [maxResults=25] - maximum number of results
         * @returns {Promise<LibgenBook[]>}
         */
        this.search = async (query, page = 1) => {
            query = encodeURIComponent(query);
            const workingExtension = this.extensions[0];
            const containers = [];
            const { data } = await this.client.get(`${this.baseUrl}.rs/search.php?req=${query}&view=simple&res=25&sort=def&sortmode=ASC&page=${page}`);
            const $ = (0, cheerio_1.load)(data);
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
            containers.shift();
            containers.shift();
            containers.pop();
            for (let i = 0; i < containers.length; i++) {
                if (containers[i].link == '') {
                    continue;
                }
                const data = await this.client.get(containers[i].link);
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
            return {
                result: containers,
                hasNextPage: $('table:eq(1) tbody tr td:eq(1) font a:eq(0)').text().trim() == '►' ||
                    $('table:eq(1) tbody tr td:eq(1) font a:eq(1)').text().trim() == '►'
                    ? true
                    : false,
            };
        };
    }
}
exports.default = Libgen;
//# sourceMappingURL=libgen.js.map