import { ANIME, MANGA, BOOKS, COMICS, LIGHT_NOVELS, MOVIES, META, NEWS } from '../providers';

/**
 * List of providers
 *
 * add new providers here (order does not matter)
 */
export const PROVIDERS_LIST = {
  ANIME: [
    new ANIME.NineAnime(),
    new ANIME.AnimeFox(),
    new ANIME.AnimePahe(),
    new ANIME.Bilibili(),
    new ANIME.Crunchyroll(),
    new ANIME.Enime(),
    new ANIME.Gogoanime(),
    new ANIME.Zoro(),
    new ANIME.Marin(),
  ],
  MANGA: [
    new MANGA.MangaDex(),
    new MANGA.MangaHere(),
    new MANGA.MangaKakalot(),
    new MANGA.Mangapark(),
    new MANGA.MangaPill(),
    new MANGA.MangaReader(),
    new MANGA.Mangasee123(),
    new MANGA.ComicK(),
  ],
  BOOKS: [new BOOKS.Libgen()],
  COMICS: [new COMICS.GetComics()],
  LIGHT_NOVELS: [new LIGHT_NOVELS.ReadLightNovels()],
  MOVIES: [new MOVIES.FlixHQ(), new MOVIES.ViewAsian(), new MOVIES.DramaCool(), new MOVIES.Fmovies()],
  NEWS: [new NEWS.ANN()],
  META: [new META.Anilist(), new META.TMDB(), new META.Myanimelist()],
  OTHERS: [],
};
