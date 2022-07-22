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

class Zoro extends AnimeParser {
  override readonly name = 'Zoro.to';
  protected override baseUrl = 'https://zoro.to';
  protected override logo =
    'https://is3-ssl.mzstatic.com/image/thumb/Purple112/v4/7e/91/00/7e9100ee-2b62-0942-4cdc-e9b93252ce1c/source/512x512bb.jpg';
  protected override classPath = 'ANIME.Zoro';

  /**
   * @param query Search query
   * @param page Page number (optional)
   */
  override search = async (query: string, page: number = 1): Promise<ISearch<IAnimeResult>> => {
    const res: ISearch<IAnimeResult> = {
      currentPage: page,
      hasNextPage: false,
      results: [],
    };
    try {
      const { data } = await axios.get(
        `${this.baseUrl}/search?keyword=${decodeURIComponent(query)}&page=${page}`
      );
      const $ = load(data);

      res.hasNextPage =
        $('.pagination > li').length > 0
          ? $('.pagination > li').last().hasClass('active')
            ? false
            : true
          : false;

      $('.film_list-wrap > div.flw-item').each((i, el) => {
        const id = $(el)
          .find('div:nth-child(1) > a.film-poster-ahref')
          .attr('href')
          ?.split('/')[1]
          .split('?')[0];
        const title = $(el).find('div:nth-child(2) > h3:nth-child(1) > a:nth-child(1)').text();
        // Movie, TV, OVA, ONA, Special, Music
        const type = $(el).find('div:nth-child(2) > div:nth-child(2) > span:nth-child(1)').text();
        const image = $(el).find('div:nth-child(1) > img.film-poster-img').attr('data-src');
        const url = this.baseUrl + $(el).find('div:nth-child(1) > a:nth-child(4)').attr('href');

        res.results.push({
          id: id!,
          title: title,
          type: type,
          image: image,
          url: url,
        });
      });

      return res;
    } catch (err: any) {
      throw new Error(err);
    }
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

(async () => {
  const zoro = new Zoro();
  const info = await zoro.fetchAnimeInfo('1');
  console.log(info);
})();

export default Zoro;
