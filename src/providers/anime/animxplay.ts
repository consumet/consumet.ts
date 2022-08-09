import axios from 'axios';
import { load } from 'cheerio';
import FormData from 'form-data';

import {
  AnimeParser,
  ISearch,
  IAnimeInfo,
  MediaStatus,
  IAnimeResult,
  ISource,
  IEpisodeServer,
} from '../../models';
import { GogoCDN, USER_AGENT } from '../../utils';

class AniMixPlay extends AnimeParser {
  override readonly name = 'AniMixPlay';
  protected override baseUrl = 'https://animixplay.to';
  protected override logo = 'https://www.apksforfree.com/wp-content/uploads/2021/10/oie_1413343NvdZCZR5.png';
  protected override classPath = 'ANIME.AniMixPlay';

  private readonly searchUrl = 'https://cachecow.eu/api/search';

  /**
   *
   * @param query search query
   */
  override search = async (query: string): Promise<ISearch<IAnimeResult>> => {
    const formData = new FormData();
    formData.append('qfast', query);
    formData.append('root', 'animixplay.to');

    const {
      data: { result },
    } = await axios.post(this.searchUrl, formData);
    const $ = load(result);

    const results: IAnimeResult[] = [];
    $('a').each((i, el) => {
      const href = `${this.baseUrl}${$(el).attr('href')}`;
      const title = $(el).find('li > div.details > p.name').text();

      results.push({
        id: href.split(this.baseUrl)[1],
        title: title,
        url: href,
      });
    });
    return { results };
  };

  /**
   *
   * @param id anime id
   * @param dub whether to get dub version of the anime
   */
  override fetchAnimeInfo = async (id: string, dub = false): Promise<IAnimeInfo> => {
    if (!id.startsWith('http')) id = `${this.baseUrl}${dub ? `${id}-dub` : id}`;

    const animeInfo: IAnimeInfo = {
      id: id.split(this.baseUrl)[1],
      title: '',
    };
    try {
      const { data } = await axios.get(id, {
        headers: {
          'User-Agent': USER_AGENT,
        },
      });
      const $ = load(data);

      const epObj = JSON.parse($('div#epslistplace').text());

      animeInfo.title = $('#aligncenter > span.animetitle').text();
      animeInfo.genres = $('span#genres > span').text().split(', ');
      animeInfo.status = $('#status').text().split(': ')[1] as MediaStatus;
      animeInfo.totalEpisodes = parseInt(epObj.eptotal);
      animeInfo.episodes = [];

      if ($('div#epslistplace').text().startsWith('{')) {
        const episodes = epObj;

        delete episodes[Object.keys(episodes)[Object.keys(episodes).length - 1]];

        for (const key in episodes) {
          animeInfo.episodes.push({
            id: episodes[key].toString()?.match(/(?<=id=).*(?=&title)/g)[0],
            number: parseInt(key) + 1,
            url: `https:${episodes[key]}`,
          });
        }
      }

      return animeInfo;
    } catch (e) {
      throw new Error((e as Error).message);
    }
  };

  /**
   *
   * @param episodeId episode id
   */
  override fetchEpisodeSources = async (episodeId: string): Promise<ISource> => {
    if (!episodeId.startsWith('http')) episodeId = `https://goload.io/streaming.php?id=${episodeId}`;
    return {
      sources: await new GogoCDN().extract(new URL(episodeId)),
    };
  };

  /**
   * @deprecated Use fetchEpisodeSources instead
   */
  override fetchEpisodeServers = (episodeIs: string): Promise<IEpisodeServer[]> => {
    throw new Error('Method not implemented.');
  };
}

export default AniMixPlay;
