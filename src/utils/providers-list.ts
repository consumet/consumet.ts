import { ANIME, MANGA, BOOKS, COMICS, LIGHT_NOVELS, MOVIES, META, NEWS } from '../providers';

/**
 * List of providers
 *
 * add new providers here (order does not matter)
 */
export const PROVIDERS_LIST = {
  ANIME: [
    new ANIME.Gogoanime(),
    new ANIME.NineAnime(),
    new ANIME.AnimePahe(),
    new ANIME.Zoro(),
    new ANIME.AniMixPlay(),
    new ANIME.AnimeFox(),
    new ANIME.Enime(),
    new ANIME.Crunchyroll(),
    new ANIME.Bilibili(),
  ],
  MANGA: [
    new MANGA.MangaDex(),
    new MANGA.MangaHere(),
    new MANGA.MangaKakalot(),
    new MANGA.Mangasee123(),
    new MANGA.Mangapark(),
  ],
  BOOKS: [new BOOKS.Libgen()],
  COMICS: [new COMICS.GetComics()],
  LIGHT_NOVELS: [new LIGHT_NOVELS.ReadLightNovels()],
  MOVIES: [new MOVIES.FlixHQ(), new MOVIES.ViewAsian()],
  NEWS: [new NEWS.ANN()],
  META: [new META.Anilist()],
  OTHERS: [],
};
