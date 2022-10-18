import axios from 'axios';

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

class Crunchyroll extends AnimeParser {
  override readonly name = 'Crunchyroll';
  protected override baseUrl = 'https://kamyroll.herokuapp.com';
  protected override logo =
    'https://user-images.githubusercontent.com/65111632/95666535-4f6dba80-0ba6-11eb-8583-e3a2074590e9.png';
  protected override classPath = 'ANIME.Crunchyroll';

  private localeHeader = { locale: 'en-US' };
  private channelHeader = { channel: 'channel_id' };
  private user_agent = 'Kamyroll/3.17.0 Android/7.1.2 okhttp/4.9.1';

  private headers = async () => {
    const { data } = await axios({
      method: 'post',
      url: `${this.baseUrl}/auth/v1/token`,
      data: {
        refresh_token:
          'IV+FtTI+SYR0d5CQy2KOc6Q06S6aEVPIjZdWA6mmO7nDWrMr04cGjSkk4o6urP/6yDmE4yzccSX/rP/OIgDgK4ildzNf2G/pPS9Ze1XbEyJAEUyN+oKT7Gs1PhVTFdz/vYXvxp/oZmLWQGoGgSQLwgoRqnJddWjqk0ageUbgT1FwLazdL3iYYKdNN98BqGFbs/baeqqa8aFre5SzF/4G62y201uLnsElgd07OAh1bnJOy8PTNHpGqEBxxbo1VENqtYilG9ZKY18nEz8vLPQBbin/IIEjKITjSa+LvSDQt/0AaxCkhClNDUX2uUZ8q7fKuSDisJtEyIFDXtuZGFhaaA==',
        grant_type: 'refresh_token',
        scope: 'offline_access',
      },
      headers: {
        'user-agent': this.user_agent,
        authorization:
          'Basic vrvluizpdr2eby+RjSKM17dOLacExxq1HAERdxQDO6+2pHvFHTKKnByPD7b6kZVe1dJXifb6SG5NWMz49ABgJA=',
      },
    });

    return {
      headers: {
        Authorization: `${data.tokenType} ${data.accessToken}`,
      },
    };
  };

  /**
   * @param query Search query
   */
  override search = async (query: string): Promise<ISearch<IAnimeResult>> => {
    const { data } = await axios.get(`${this.baseUrl}/content/v1/search`, {
      params: { channelHeader: this.channelHeader, localeHeader: this.localeHeader, query: query, limit: 20 },
      ...(await this.headers()),
    });

    console.log(data);

    throw new Error('Method not implemented.');
  };

  /**
   * @param id Anime id
   */
  override fetchAnimeInfo = async (id: string): Promise<IAnimeInfo> => {
    throw new Error('Method not implemented.');
  };

  /**
   *
   * @param episodeId Episode id
   */
  override fetchEpisodeSources = async (episodeId: string): Promise<ISource> => {
    throw new Error('Method not implemented.');
  };

  /**
   *
   * @param episodeId Episode id
   */
  override fetchEpisodeServers = (episodeId: string): Promise<IEpisodeServer[]> => {
    throw new Error('Method not implemented.');
  };
}

// (async () => {
//   const anime = new Crunchyroll();
//   await anime.search('naruto');
// })();
export default Crunchyroll;
