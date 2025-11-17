import { ANIME, MANGA, /* BOOKS , */ COMICS, LIGHT_NOVELS, MOVIES, META, NEWS } from '../providers';
import movies from '../providers/movies';

/**
 * List of providers
 *
 * add new providers here (order does not matter)
 */
export const PROVIDERS_LIST = {
  ANIME: [
    new ANIME.AnimePahe(),
    new ANIME.AnimeKai(),
    new ANIME.KickAssAnime(),
    new ANIME.AnimeSaturn(),
    new ANIME.Bilibili(),
    new ANIME.Anify(),
    new ANIME.Gogoanime(),
  ],
  MANGA: [
    new MANGA.MangaDex(),
    new MANGA.MangaHere(),
    new MANGA.MangaPill(),
    new MANGA.MangaReader(),
    new MANGA.ComicK(),
  ],
  // BOOKS: [new BOOKS.Libgen()],
  COMICS: [new COMICS.GetComics()],
  LIGHT_NOVELS: [],
  MOVIES: [
    new MOVIES.DramaCool(),
    new MOVIES.FlixHQ(),
    new MOVIES.Goku(),
    new MOVIES.SFlix(),
    new MOVIES.HiMovies(),
    new MOVIES.Turkish(),
  ],
  NEWS: [new NEWS.ANN()],
  META: [/* new META.Anilist() ,*/ new META.TMDB() /*, new META.Myanimelist() */],
  OTHERS: [],
};
