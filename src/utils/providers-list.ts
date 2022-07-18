import { ANIME, MANGA, BOOKS, COMICS, LIGHT_NOVELS, MOVIES, META } from '../providers';

/**
 * List of providers
 *
 * add new providers here (order does not matter)
 */
export const PROVIDERS_LIST = {
  ANIME: [new ANIME.Gogoanime(), new ANIME.NineAnime(), new ANIME.AnimePahe()],
  MANGA: [new MANGA.MangaDex(), new MANGA.MangaHere()],
  BOOKS: [new BOOKS.Libgen()],
  COMICS: [new COMICS.GetComics()],
  LIGHT_NOVELS: [new LIGHT_NOVELS.ReadLightNovels()],
  MOVIES: [new MOVIES.FlixHQ()],
  META: [new META.Anilist()],
  OTHERS: [],
};
