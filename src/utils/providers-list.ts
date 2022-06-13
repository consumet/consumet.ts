import { ANIME, MANGA, BOOKS, COMICS, LIGHT_NOVEL } from '../providers';

/**
 * List of providers
 *
 * add new providers here
 */
export const PROVIDERS_LIST = {
  ANIME: [new ANIME.en.Gogoanime(), new ANIME.en.NineAnime()],
  MANGA: [new MANGA.all.MangaDex()],
  BOOKS: [new BOOKS.Libgen()],
  COMICS: [new COMICS.GetComics()],
  LIGHT_NOVELS: [new LIGHT_NOVEL.en.ReadLightNovels()],
  OTHERS: [],
};
