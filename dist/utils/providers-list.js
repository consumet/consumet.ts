"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROVIDERS_LIST = void 0;
const providers_1 = require("../providers");
/**
 * List of providers
 *
 * add new providers here (order does not matter)
 */
exports.PROVIDERS_LIST = {
    ANIME: [
        new providers_1.ANIME.AnimePahe(),
        new providers_1.ANIME.AnimeKai(),
        new providers_1.ANIME.KickAssAnime(),
        new providers_1.ANIME.AnimeSaturn(),
        new providers_1.ANIME.Bilibili(),
        new providers_1.ANIME.Anify(),
        new providers_1.ANIME.Gogoanime(),
    ],
    MANGA: [
        new providers_1.MANGA.MangaDex(),
        new providers_1.MANGA.MangaHere(),
        new providers_1.MANGA.MangaPill(),
        new providers_1.MANGA.MangaReader(),
        new providers_1.MANGA.ComicK(),
    ],
    // BOOKS: [new BOOKS.Libgen()],
    COMICS: [new providers_1.COMICS.GetComics()],
    LIGHT_NOVELS: [],
    MOVIES: [
        new providers_1.MOVIES.DramaCool(),
        new providers_1.MOVIES.FlixHQ(),
        new providers_1.MOVIES.Goku(),
        new providers_1.MOVIES.SFlix(),
        new providers_1.MOVIES.HiMovies(),
        new providers_1.MOVIES.Turkish(),
    ],
    NEWS: [new providers_1.NEWS.ANN()],
    META: [/* new META.Anilist() ,*/ new providers_1.META.TMDB() /*, new META.Myanimelist() */],
    OTHERS: [],
};
//# sourceMappingURL=providers-list.js.map