"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Topics = exports.PROVIDERS_LIST = exports.NEWS = exports.META = exports.MOVIES = exports.LIGHT_NOVELS = exports.MANGA = exports.COMICS = exports.BOOKS = exports.ANIME = void 0;
const providers_1 = require("./providers");
Object.defineProperty(exports, "ANIME", { enumerable: true, get: function () { return providers_1.ANIME; } });
Object.defineProperty(exports, "BOOKS", { enumerable: true, get: function () { return providers_1.BOOKS; } });
Object.defineProperty(exports, "COMICS", { enumerable: true, get: function () { return providers_1.COMICS; } });
Object.defineProperty(exports, "LIGHT_NOVELS", { enumerable: true, get: function () { return providers_1.LIGHT_NOVELS; } });
Object.defineProperty(exports, "MANGA", { enumerable: true, get: function () { return providers_1.MANGA; } });
Object.defineProperty(exports, "MOVIES", { enumerable: true, get: function () { return providers_1.MOVIES; } });
Object.defineProperty(exports, "META", { enumerable: true, get: function () { return providers_1.META; } });
Object.defineProperty(exports, "NEWS", { enumerable: true, get: function () { return providers_1.NEWS; } });
const providers_list_1 = require("./utils/providers-list");
Object.defineProperty(exports, "PROVIDERS_LIST", { enumerable: true, get: function () { return providers_list_1.PROVIDERS_LIST; } });
const models_1 = require("./models");
Object.defineProperty(exports, "Topics", { enumerable: true, get: function () { return models_1.Topics; } });
//# sourceMappingURL=index.js.map