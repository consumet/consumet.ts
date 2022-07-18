import axios from 'axios';
import { load } from 'cheerio';

import {
  AnimeParser,
  ISearch,
  IAnimeInfo,
  MediaStatus,
  IAnimeResult,
  ISource,
  IAnimeEpisode,
  IEpisodeServer,
} from '../../models';

class KickAssAnime extends AnimeParser {
  override readonly name = 'KickAssAnime';
  protected override baseUrl = 'https://www2.kickassanime.ro';
  protected override logo =
    'https://user-images.githubusercontent.com/65111632/95666535-4f6dba80-0ba6-11eb-8583-e3a2074590e9.png';
  protected override classPath = 'ANIME.KickAssAnime';

  /**
   * @param query Search query
   */
  override search = async (query: string): Promise<ISearch<IAnimeResult>> => {
    throw new Error('Not implemented');
  };

  /**
   * @param id Anime id
   */
  override fetchAnimeInfo = async (id: string): Promise<IAnimeInfo> => {
    const animeInfo: IAnimeInfo = {
      id: id,
      title: '',
    };

    throw new Error('Not implemented');
  };

  /**
   *
   * @param episodeId Episode id
   */
  override fetchEpisodeSources = async (episodeId: string): Promise<ISource> => {
    try {
      throw new Error('Not implemented');
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   * @deprecated
   */
  override fetchEpisodeServers = (episodeId: string): Promise<IEpisodeServer[]> => {
    throw new Error('Method not implemented.');
  };
}

export default KickAssAnime;
