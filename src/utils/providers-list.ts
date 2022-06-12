import { ANIME, BOOKS, COMICS } from '../providers';

/**
 * List of providers
 *
 * add new providers here
 */
export const PROVIDERS_LIST = {
  ANIME: [new ANIME.en.Gogoanime(), new ANIME.en.NineAnime()],
  MANGA: [],
  BOOKS: [new BOOKS.Libgen()],
  COMICS: [new COMICS.GetComics()],
  OTHERS: [],
};
