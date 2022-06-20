"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROVIDERS_LIST = void 0;
const providers_1 = require("../providers");
/**
 * List of providers
 *
 * add new providers here
 */
exports.PROVIDERS_LIST = {
    ANIME: [new providers_1.ANIME.Gogoanime(), new providers_1.ANIME.NineAnime()],
    MANGA: [new providers_1.MANGA.MangaDex()],
    BOOKS: [new providers_1.BOOKS.Libgen()],
    COMICS: [new providers_1.COMICS.GetComics()],
    LIGHT_NOVELS: [new providers_1.LIGHT_NOVELS.ReadLightNovels()],
    OTHERS: [],
};
//# sourceMappingURL=providers-list.js.map