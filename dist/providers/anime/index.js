"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gogoanime_1 = __importDefault(require("./gogoanime"));
const animepahe_1 = __importDefault(require("./animepahe"));
const hianime_1 = __importDefault(require("./hianime"));
const anify_1 = __importDefault(require("./anify"));
const bilibili_1 = __importDefault(require("./bilibili"));
const animesaturn_1 = __importDefault(require("./animesaturn"));
const anix_1 = __importDefault(require("./anix"));
const animekai_1 = __importDefault(require("./animekai"));
const kickassanime_1 = __importDefault(require("./kickassanime"));
exports.default = {
    HiAnime: hianime_1.default,
    AnimePahe: animepahe_1.default,
    AnimeKai: animekai_1.default,
    KickAssAnime: kickassanime_1.default,
    AnimeSaturn: animesaturn_1.default,
    Gogoanime: gogoanime_1.default,
    Anify: anify_1.default,
    Bilibili: bilibili_1.default,
    Anix: anix_1.default,
};
//# sourceMappingURL=index.js.map