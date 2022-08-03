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

class Tmdb extends MovieParser {
  override readonly name = 'Tmbd';
  protected override baseUrl = 'https://www.themoviedb.org/';
  protected override logo =
    'https://img.flixhq.to/xxrz/400x400/100/ab/5f/ab5f0e1996cc5b71919e10e910ad593e/ab5f0e1996cc5b71919e10e910ad593e.png';
  protected override classPath = 'MOVIES.FlixHQ';
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
    throw new Error('Method not implemented.');
  };

  override fetchMediaInfo = async (mediaId: string): Promise<IMovieInfo | IAnimeInfo> => {
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
