import { load } from 'cheerio';
import axios from 'axios';

import {
  MovieParser,
  TvType,
  IMovieInfo,
  IEpisodeServer,
  StreamingServers,
  ISource,
  IMovieResult,
  ISearch,
} from '../../models';
import { MixDrop, VidCloud } from '../../utils';

class Dramacool extends MovieParser {
  override readonly name = 'Dramacool';
  protected override baseUrl = 'https://www1.dramacool.ee';
  protected override logo = 'https://editorialge.com/media/2021/12/Dramacool.jpg';
  protected override classPath = 'MOVIES.Dramacool';
  override supportedTypes = new Set([TvType.MOVIE, TvType.TVSERIES]);

  override search = async (query: string, page: number = 1): Promise<ISearch<IMovieResult>> => {
    throw new Error('Method not implemented.');
  };

  override fetchMediaInfo = async (mediaId: string): Promise<IMovieInfo> => {
    if (!mediaId.includes('drama-detail')) mediaId = `${this.baseUrl}/drama-detail/${mediaId}`;

    const mediaInfo: IMovieInfo = {
      id: '',
      title: '',
    };
    try {
      const { data } = await axios.get(mediaId);

      const $ = load(data);

      mediaInfo.id = mediaId.split('/').pop()!.split('.')[0];

      mediaInfo.episodes = [];
      $('div.content-left > div.block-tab > div > div > ul > li').each((i, el) => {
        mediaInfo.episodes?.push({
          id: $(el).find('a').attr('href')?.split('.html')[0].slice(1)!,
          title: $(el).find('h3').text(),
          number: parseInt($(el).find('a').attr('href')?.split('-episode-')[1].split('.html')[0]!),
          releaseDate: $(el).find('span.time').text(),
          url: `${this.baseUrl}${$(el).find('a').attr('href')}`,
        });
      });

      return mediaInfo;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  override fetchEpisodeSources = async (
    episodeId: string,
    server: StreamingServers = StreamingServers.GogoCDN
  ): Promise<ISource> => {
    if (!episodeId.includes('.html')) episodeId = `${this.baseUrl}/${episodeId}.html`;
    try {
      const { data } = await axios.get(episodeId);

      return {
        sources: [],
      };
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  override fetchEpisodeServers = async (mediaLink: string, ...args: any): Promise<IEpisodeServer[]> => {
    throw new Error('Method not implemented.');
  };
}

// (async () => {
//   const drama = new Dramacool();
//   const mediaInfo = await drama.fetchMediaInfo('vincenzo');
//   console.log(mediaInfo);
// })();

export default Dramacool;
