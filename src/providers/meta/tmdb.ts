import axios from 'axios';

import {
  AnimeParser,
  ISearch,
  IAnimeInfo,
  IAnimeResult,
  ISource,
  IEpisodeServer,
  MovieParser,
  TvType,
  IMovieResult,
  IMovieInfo,
} from '../../models';
import { compareTwoStrings } from '../../utils';
import FlixHQ from '../movies/flixhq';

/**
 * Work in progress
 */
class Tmdb extends MovieParser {
  override readonly name = 'Tmbd';
  protected override baseUrl = 'https://www.themoviedb.org';
  protected apiUrl = 'https://api.themoviedb.org/3';
  protected override logo = 'https://pbs.twimg.com/profile_images/1243623122089041920/gVZIvphd_400x400.jpg';
  protected override classPath = 'MOVIES.Tmbd';
  override supportedTypes = new Set([TvType.MOVIE, TvType.TVSERIES, TvType.ANIME]);

  private api_key = ``;

  private provider: AnimeParser | MovieParser;

  constructor(provider: AnimeParser | MovieParser) {
    super();
    this.provider = provider || new FlixHQ();
  }

  /**
   * @param query search query
   * @param page page number
   */
  override search = async (
    query: string,
    page: number = 1
  ): Promise<ISearch<IMovieResult | IAnimeResult>> => {
    const searchUrl = `${this.baseUrl}/search/multi?api_key=${this.api_key}&language=en-US&page=1&include_adult=false&query=${query}`;

    const search: ISearch<IMovieResult | IAnimeResult> = {
      currentPage: 1,
      results: [],
    };

    try {
      const { data } = await axios.get(searchUrl);

      if (data.results.length > 0) {
        data.results.forEach((result: any) => {
          const date = new Date(result?.release_date || result?.first_air_date);

          const movie: IMovieResult = {
            id: result.id,
            title: result?.title || result?.name,
            poster: {
              path: result?.poster_path,
              low: `https://image.tmdb.org/t/p/w500${result?.poster_path}`,
              high: `https://image.tmdb.org/t/p/w780${result?.poster_path}`,
              hd: `https://image.tmdb.org/t/p/w1280${result?.poster_path}`,
              original: `https://image.tmdb.org/t/p/original${result?.poster_path}`,
            },
            type: result.media_type === 'movie' ? TvType.MOVIE : TvType.TVSERIES,
            rating: result?.vote_average || 0,
            releaseDate: `${date.getFullYear()}` || '0',
          };

          return search.results.push(movie);
        });
      } else {
        throw new Error('No results found');
      }

      return search;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   * @param id media id (anime or movie/tv)
   * @param type movie or tv
   */
  override fetchMediaInfo = async (mediaId: string, type: string): Promise<IMovieInfo | IAnimeInfo> => {
    type = type.toLowerCase() === 'movie' ? 'movie' : 'tv';
    const infoUrl = `${this.apiUrl}/${type}/${mediaId}?api_key=${this.api_key}&language=en-US&append_to_response=release_dates,watch/providers,alternative_titles,credits,external_ids,images,keywords,recommendations,reviews,similar,translations,videos&include_image_language=en`;

    const info: IMovieInfo = {
      id: mediaId,
      title: '',
    };

    try {
      const { data } = await axios.get(infoUrl);
      const providerId = await this.findIdFromTitle(data?.title || data?.name);

      info.providerId = providerId;
      info.title = data?.title || data?.name;
      info.poster = {
        path: data?.poster_path,
        low: `https://image.tmdb.org/t/p/w500${data?.poster_path}`,
        high: `https://image.tmdb.org/t/p/w780${data?.poster_path}`,
        hd: `https://image.tmdb.org/t/p/w1280${data?.poster_path}`,
        original: `https://image.tmdb.org/t/p/original${data?.poster_path}`,
      };
      info.type = type === 'movie' ? TvType.MOVIE : TvType.TVSERIES;
      info.rating = data?.vote_average || 0;
      info.releaseDate = data?.release_date || data?.first_air_date;
      info.description = data?.overview;
      info.genres = data?.genres.map((genre: any) => genre.name);
      info.duration = data?.runtime || data?.episode_run_time[0];
      info.totalEpisodes = data?.number_of_episodes;
      info.totalSeasons = data?.number_of_seasons as number;
      info.directors = data?.credits?.crew
        .filter((crew: any) => crew.job === 'Director')
        .map((crew: any) => crew.name);
      info.writers = data?.credits?.crew
        .filter((crew: any) => crew.job === 'Screenplay')
        .map((crew: any) => crew.name);
      info.actors = data?.credits?.cast.map((cast: any) => cast.name);
      info.trailer = {
        id: data?.videos?.results[0]?.key,
        site: data?.videos?.results[0]?.site,
        url: `https://www.youtube.com/watch?v=${data?.videos?.results[0]?.key}`,
      };
      info.backdrops =
        data?.images?.backdrops?.length <= 0
          ? undefined
          : data?.images?.backdrops.map((backdrop: any) => {
              return {
                path: backdrop.file_path,
                low: `https://image.tmdb.org/t/p/w300${backdrop.file_path}`,
                high: `https://image.tmdb.org/t/p/w780${backdrop.file_path}`,
                hd: `https://image.tmdb.org/t/p/w1280${backdrop.file_path}`,
                original: `https://image.tmdb.org/t/p/original${backdrop.file_path}`,
              };
            });
      info.posters =
        data?.images?.posters?.length <= 0
          ? undefined
          : data?.images?.posters.map((poster: any) => {
              return {
                path: poster.file_path,
                low: `https://image.tmdb.org/t/p/w500${poster.file_path}`,
                high: `https://image.tmdb.org/t/p/w780${poster.file_path}`,
                hd: `https://image.tmdb.org/t/p/w1280${poster.file_path}`,
                original: `https://image.tmdb.org/t/p/original${poster.file_path}`,
              };
            });
      info.similar =
        data?.similar?.results?.length <= 0
          ? undefined
          : data?.similar?.results.map((result: any) => {
              return {
                id: result.id,
                title: result.title || result.name,
                poster: {
                  path: result.poster_path,
                  low: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                  high: `https://image.tmdb.org/t/p/w780${result.poster_path}`,
                  hd: `https://image.tmdb.org/t/p/w1280${result.poster_path}`,
                  original: `https://image.tmdb.org/t/p/original${result.poster_path}`,
                },
                type: type === 'movie' ? TvType.MOVIE : TvType.TVSERIES,
                rating: result.vote_average || 0,
                releaseDate: result.release_date || result.first_air_date,
              };
            });
      info.recommendations =
        data?.recommendations?.results?.length <= 0
          ? undefined
          : data?.recommendations?.results.map((result: any) => {
              return {
                id: result.id,
                title: result.title || result.name,
                poster: {
                  path: result.poster_path,
                  low: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                  high: `https://image.tmdb.org/t/p/w780${result.poster_path}`,
                  hd: `https://image.tmdb.org/t/p/w1280${result.poster_path}`,
                  original: `https://image.tmdb.org/t/p/original${result.poster_path}`,
                },
                type: type === 'movie' ? TvType.MOVIE : TvType.TVSERIES,
                rating: result.vote_average || 0,
                releaseDate: result.release_date || result.first_air_date,
              };
            });

      const totalSeasons = (info?.totalSeasons as number) || 0;
      if (type === 'tv' && totalSeasons > 0) {
        const seasonUrl = (season: string) =>
          `${this.apiUrl}/tv/${mediaId}/season/${season}?api_key=${this.api_key}`;

        info.seasons = [];
        const seasons = info.seasons as any[];
        for (let i = 1; i <= totalSeasons; i++) {
          const { data: seasonData } = await axios.get(seasonUrl(i.toString()));
          const episodes =
            seasonData?.episodes?.length <= 0
              ? undefined
              : seasonData?.episodes.map((episode: any) => {
                  return {
                    id: episode.id,
                    title: episode.name,
                    episodeNumber: episode.episode_number,
                    seasonNumber: episode.season_number,
                    airDate: episode.air_date,
                    overview: episode.overview,
                    img: !episode?.still_path
                      ? undefined
                      : {
                          w300: `https://image.tmdb.org/t/p/w300${episode.still_path}`,
                          w780: `https://image.tmdb.org/t/p/w780${episode.still_path}`,
                          w1280: `https://image.tmdb.org/t/p/w1280${episode.still_path}`,
                          original: `https://image.tmdb.org/t/p/original${episode.still_path}`,
                        },
                  };
                });

          seasons.push({
            season: i,
            poster: !seasonData?.poster_path
              ? undefined
              : {
                  w300: `https://image.tmdb.org/t/p/w300${seasonData.poster_path}`,
                  w780: `https://image.tmdb.org/t/p/w780${seasonData.poster_path}`,
                  w1280: `https://image.tmdb.org/t/p/w1280${seasonData.poster_path}`,
                  original: `https://image.tmdb.org/t/p/original${seasonData.poster_path}`,
                },
            episodes,
          });
        }
      }
    } catch (err) {
      throw new Error((err as Error).message);
    }

    return info;
  };

  // search provider for media
  findIdFromTitle = async (title: string): Promise<string> => {
    //clean title
    title = title.replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase();

    const findMedia = (await this.provider.search(title)) as ISearch<IAnimeResult>;
    if (findMedia.results.length === 0) return '';

    // Sort the retrieved info for more accurate results.
    findMedia.results.sort((a, b) => {
      const targetTitle = title;

      let firstTitle: string;
      let secondTitle: string;

      if (typeof a.title == 'string') firstTitle = a?.title as string;
      else firstTitle = (a?.title as string) ?? '';

      if (typeof b.title == 'string') secondTitle = b.title as string;
      else secondTitle = (b?.title as string) ?? '';

      const firstRating = compareTwoStrings(targetTitle, firstTitle.toLowerCase());
      const secondRating = compareTwoStrings(targetTitle, secondTitle.toLowerCase());

      // Sort in descending order
      return secondRating - firstRating;
    });

    return findMedia.results[0].id;
  };

  /**
   * @param id media id (anime or movie/tv)
   * @param args optional arguments
   */
  override fetchEpisodeSources = async (id: string, ...args: any): Promise<ISource> => {
    return this.provider.fetchEpisodeSources(id, ...args);
  };

  /**
   * @param episodeId episode id
   * @param args optional arguments
   **/
  override fetchEpisodeServers = async (episodeId: string, ...args: any): Promise<IEpisodeServer[]> => {
    return this.provider.fetchEpisodeServers(episodeId, ...args);
  };
}

// (async () => {
//   const tmdb = new Tmdb(new FlixHQ());
//   const search = await tmdb.search('the flash');
//   const info = await tmdb.fetchMediaInfo(search.results![0].id, search.results![0].type as string);
//   // const id = await tmdb.findIdFromTitle('avengers');
//   console.log(info);
// })();

export default Tmdb;
