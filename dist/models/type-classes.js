"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LibgenBookObject = void 0;
class LibgenBookObject {
    constructor() {
        this.title = '';
        this.authors = [];
        this.publisher = '';
        this.year = '';
        this.edition = '';
        this.volume = '';
        this.series = '';
        this.isbn = [];
        this.link = '';
        this.id = '';
        this.language = '';
        this.format = '';
        this.size = '';
        this.pages = '';
        this.image = '';
        this.description = '';
        this.tableOfContents = '';
        this.topic = '';
        this.hashes = new HashesObject();
    }
}
exports.LibgenBookObject = LibgenBookObject;
class HashesObject {
    constructor() {
        this.AICH = '';
        this.CRC32 = '';
        this.eDonkey = '';
        this.MD5 = '';
        this.SHA1 = '';
        this.SHA256 = [];
        this.TTH = '';
    }
}
//# sourceMappingURL=type-classes.js.map