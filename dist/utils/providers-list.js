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
        new providers_1.ANIME.NineAnime(),
        new providers_1.ANIME.AnimeFox(),
        new providers_1.ANIME.AnimePahe(),
        new providers_1.ANIME.Bilibili(),
        new providers_1.ANIME.Crunchyroll(),
        new providers_1.ANIME.Anify(),
        new providers_1.ANIME.Gogoanime(),
        new providers_1.ANIME.Zoro(),
        new providers_1.ANIME.Marin(),
    ],
    MANGA: [
        new providers_1.MANGA.MangaDex(),
        new providers_1.MANGA.MangaHere(),
        new providers_1.MANGA.MangaKakalot(),
        new providers_1.MANGA.Mangapark(),
        new providers_1.MANGA.MangaPill(),
        new providers_1.MANGA.MangaReader(),
        new providers_1.MANGA.Mangasee123(),
        new providers_1.MANGA.ComicK(),
        new providers_1.MANGA.FlameScans(),
        new providers_1.MANGA.MangaHost(),
        new providers_1.MANGA.BRMangas(),
    ],
    BOOKS: [new providers_1.BOOKS.Libgen()],
    COMICS: [new providers_1.COMICS.GetComics()],
    LIGHT_NOVELS: [new providers_1.LIGHT_NOVELS.ReadLightNovels()],
    MOVIES: [
        new providers_1.MOVIES.DramaCool(),
        new providers_1.MOVIES.FlixHQ(),
        new providers_1.MOVIES.Fmovies(),
        new providers_1.MOVIES.Goku(),
        new providers_1.MOVIES.KissAsian(),
        new providers_1.MOVIES.MovieHdWatch(),
        new providers_1.MOVIES.ViewAsian(),
    ],
    NEWS: [new providers_1.NEWS.ANN()],
    META: [new providers_1.META.Anilist(), new providers_1.META.TMDB(), new providers_1.META.Myanimelist()],
    OTHERS: [],
};
//# sourceMappingURL=providers-list.js.map