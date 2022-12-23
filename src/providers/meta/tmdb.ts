import axios from 'axios';

import {
  AnimeParser,
  ISearch,
  IAnimeInfo,
  MediaStatus,
  IAnimeResult,
  ISource,
  IAnimeEpisode,
  SubOrSub,
  IEpisodeServer,
  MovieParser,
  TvType,
  IMovieResult,
  IMovieInfo,
} from '../../models';
import { anilistSearchQuery, anilistMediaDetailQuery, kitsuSearchQuery } from '../../utils';
import Gogoanime from '../../providers/anime/gogoanime';

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

  private provider: AnimeParser | MovieParser;

  constructor(provider: AnimeParser | MovieParser) {
    super();
    this.provider = provider;
  }

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
              w500: `https://image.tmdb.org/t/p/w500${result?.poster_path}`,
              w780: `https://image.tmdb.org/t/p/w780${result?.poster_path}`,
              w1280: `https://image.tmdb.org/t/p/w1280${result?.poster_path}`,
              original: `https://image.tmdb.org/t/p/original${result?.poster_path}`,
            },
            type: result.media_type === 'movie' ? TvType.MOVIE : TvType.TVSERIES,
            rating: result?.vote_average || 0,
            releaseDate: `${date.getFullYear()}` || '0',
          };
          search.results.push(movie);
        });
      } else {
        throw new Error('No results found');
      }

      return search;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  override fetchMediaInfo = async (mediaId: string, type: string): Promise<IMovieInfo | IAnimeInfo> => {
    const infoUrl = `${this.baseUrl}/${type}/${mediaId}?api_key=${this.api_key}&language=en-US&append_to_response=videos,images,credits,external_ids,recommendations,similar,keywords,release_dates,translations,watch/providers,alternative_titles,changes,lists,account_states,credits,external_ids,images,keywords,rating,recommendations,reviews,similar,translations,videos&include_image_language=en`;
    throw new Error('Not implemented');
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

(async () => {
  const tmdb = new Tmdb(new Gogoanime());
  const search = await tmdb.search('naruto');
  console.log(search.results![0]);
})();

export default Tmdb;
