"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROVIDERS_LIST = void 0;
const providers_1 = require("../providers");
// List of providers
exports.PROVIDERS_LIST = {
    ANIME: [
        new providers_1.ANIME.AnimePahe(),
        new providers_1.ANIME.Hianime(),
        new providers_1.ANIME.AnimeKai(),
        new providers_1.ANIME.AnimeUnity(),
        new providers_1.ANIME.KickAssAnime(),
        new providers_1.ANIME.AnimeSaturn(),
    ],
    MANGA: [
        new providers_1.MANGA.WeebCentral(),
        new providers_1.MANGA.MangaHere(),
        new providers_1.MANGA.MangaPill(),
        new providers_1.MANGA.MangaDex(),
        new providers_1.MANGA.MangaReader(),
        new providers_1.MANGA.MangaKakalot(),
        new providers_1.MANGA.ComicK(),
    ],
    BOOKS: [],
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
    META: [new providers_1.META.Anilist(), new providers_1.META.TMDB(), new providers_1.META.Myanimelist()],
    OTHERS: [],
};
//# sourceMappingURL=providers-list.js.map