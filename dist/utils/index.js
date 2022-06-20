"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genElement = exports.splitStar = exports.getSize = exports.parsePostInfo = exports.formatTitle = exports.floorID = exports.splitAuthor = exports.StreamSB = exports.GogoCDN = exports.USER_AGENT = void 0;
const extractors_1 = require("./extractors");
Object.defineProperty(exports, "GogoCDN", { enumerable: true, get: function () { return extractors_1.GogoCDN; } });
Object.defineProperty(exports, "StreamSB", { enumerable: true, get: function () { return extractors_1.StreamSB; } });
const utils_1 = require("./utils");
Object.defineProperty(exports, "USER_AGENT", { enumerable: true, get: function () { return utils_1.USER_AGENT; } });
Object.defineProperty(exports, "splitAuthor", { enumerable: true, get: function () { return utils_1.splitAuthor; } });
Object.defineProperty(exports, "floorID", { enumerable: true, get: function () { return utils_1.floorID; } });
Object.defineProperty(exports, "formatTitle", { enumerable: true, get: function () { return utils_1.formatTitle; } });
Object.defineProperty(exports, "genElement", { enumerable: true, get: function () { return utils_1.genElement; } });
const getComics_1 = require("./getComics");
Object.defineProperty(exports, "parsePostInfo", { enumerable: true, get: function () { return getComics_1.parsePostInfo; } });
const zLibrary_1 = require("./zLibrary");
Object.defineProperty(exports, "getSize", { enumerable: true, get: function () { return zLibrary_1.getSize; } });
Object.defineProperty(exports, "splitStar", { enumerable: true, get: function () { return zLibrary_1.splitStar; } });
//# sourceMappingURL=index.js.map