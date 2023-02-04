"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const anilist_1 = __importDefault(require("./anilist"));
const mal_1 = __importDefault(require("./mal"));
const tmdb_1 = __importDefault(require("./tmdb"));
exports.default = { Anilist: anilist_1.default, Myanimelist: mal_1.default, TMDB: tmdb_1.default };
//# sourceMappingURL=index.js.map