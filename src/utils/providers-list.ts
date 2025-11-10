import { ANIME, MANGA, BOOKS, COMICS, LIGHT_NOVELS, MOVIES, META, NEWS } from '../providers';

/**
 * List of providers
 *
 * add new providers here (order does not matter)
 */
export const PROVIDERS_LIST = {
  ANIME: [
    new ANIME.Zoro(),
    new ANIME.AnimePahe(),
    new ANIME.AnimeKai(),
    new ANIME.KickAssAnime(),
    new ANIME.AnimeSaturn(),
    new ANIME.Bilibili(),
    new ANIME.Crunchyroll(),
    new ANIME.Anify(),
    new ANIME.Gogoanime(),
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
    new MANGA.FlameScans(),
    new MANGA.MangaHost(),
    new MANGA.BRMangas(),
  ],
  BOOKS: [new BOOKS.Libgen()],
  COMICS: [new COMICS.GetComics()],
  LIGHT_NOVELS: [new LIGHT_NOVELS.ReadLightNovels()],
  MOVIES: [
    new MOVIES.DramaCool(),
    new MOVIES.FlixHQ(),
    new MOVIES.Fmovies(),
    new MOVIES.Goku(),
    new MOVIES.KissAsian(),
    new MOVIES.MovieHdWatch(),
    new MOVIES.ViewAsian(),
    new MOVIES.SFlix(),
    new MOVIES.MultiMovies(),
    new MOVIES.HiMovies(),
  ],
  NEWS: [new NEWS.ANN()],
  META: [new META.Anilist(), new META.TMDB(), new META.Myanimelist()],
  OTHERS: [],
};
