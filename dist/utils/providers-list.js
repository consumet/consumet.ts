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
    ANIME: [new providers_1.ANIME.en.Gogoanime(), new providers_1.ANIME.en.NineAnime()],
    MANGA: [new providers_1.MANGA.all.MangaDex()],
    BOOKS: [new providers_1.BOOKS.Libgen()],
    COMICS: [new providers_1.COMICS.GetComics()],
    LIGHT_NOVELS: [new providers_1.LIGHT_NOVELS.en.ReadLightNovels()],
    OTHERS: [],
};
//# sourceMappingURL=providers-list.js.map