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
import { GogoCDN } from '../../utils';

class AniMixPlay extends AnimeParser {
  override readonly name = 'AniMixPlay';
  protected override baseUrl = 'https://animixplay.to';
  protected override logo = 'https://www.apksforfree.com/wp-content/uploads/2021/10/oie_1413343NvdZCZR5.png';
  protected override classPath = 'ANIME.AniMixPlay';

  override search = async (query: string): Promise<ISearch<IAnimeResult>> => {
    throw new Error('Method not implemented.');
  };

  override fetchAnimeInfo = async (id: string, episodePage: number = -1): Promise<IAnimeInfo> => {
    throw new Error('Not implemented');
  };

  override fetchEpisodeSources = async (episodeId: string): Promise<ISource> => {
    throw new Error('Not implemented');
  };

  override fetchEpisodeServers = (episodeLink: string): Promise<IEpisodeServer[]> => {
    throw new Error('Method not implemented.');
  };
}

export default AniMixPlay;
