"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NEWS = exports.META = exports.MOVIES = exports.LIGHT_NOVELS = exports.COMICS = exports.BOOKS = exports.MANGA = exports.ANIME = void 0;
const anime_1 = __importDefault(require("./anime"));
exports.ANIME = anime_1.default;
const manga_1 = __importDefault(require("./manga"));
exports.MANGA = manga_1.default;
const light_novels_1 = __importDefault(require("./light-novels"));
exports.LIGHT_NOVELS = light_novels_1.default;
const books_1 = __importDefault(require("./books"));
exports.BOOKS = books_1.default;
const comics_1 = __importDefault(require("./comics"));
exports.COMICS = comics_1.default;
const movies_1 = __importDefault(require("./movies"));
exports.MOVIES = movies_1.default;
const meta_1 = __importDefault(require("./meta"));
exports.META = meta_1.default;
const news_1 = __importDefault(require("./news"));
exports.NEWS = news_1.default;
//# sourceMappingURL=index.js.map