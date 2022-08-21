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
import { AsianLoad, MixDrop, StreamTape, StreamSB } from '../../utils';
import { Stream } from 'stream';

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
      mediaInfo.title = $('.info > h1:nth-child(1)').text();
      mediaInfo.otherNames = $('.other_name > a')
        .map((i, el) => $(el).text().trim())
        .get();

      mediaInfo.episodes = [];
      $('div.content-left > div.block-tab > div > div > ul > li').each((i, el) => {
        mediaInfo.episodes?.push({
          id: $(el).find('a').attr('href')?.split('.html')[0].slice(1)!,
          title: $(el).find('h3').text().replace(mediaInfo.title.toString(), ''),
          number: parseFloat(
            $(el).find('a').attr('href')?.split('-episode-')[1].split('.html')[0].split('-').join('.')!
          ),
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
    server: StreamingServers = StreamingServers.AsianLoad
  ): Promise<ISource> => {
    if (episodeId.startsWith('http')) {
      const serverUrl = new URL(episodeId);
      switch (server) {
        case StreamingServers.AsianLoad:
          return {
            ...(await new AsianLoad().extract(serverUrl)),
          };
        case StreamingServers.MixDrop:
          return {
            sources: await new MixDrop().extract(serverUrl),
          };
        case StreamingServers.StreamTape:
          return {
            sources: await new StreamTape().extract(serverUrl),
          };
        case StreamingServers.StreamSB:
          return {
            sources: await new StreamSB().extract(serverUrl),
          };
        default:
          throw new Error('Server not supported');
      }
    }
    if (!episodeId.includes('.html')) episodeId = `${this.baseUrl}/${episodeId}.html`;
    try {
      const { data } = await axios.get(episodeId);

      const $ = load(data);

      let serverUrl = '';
      switch (server) {
        // asianload is the same as the standard server
        case StreamingServers.AsianLoad:
          serverUrl = `https:${$('.Standard').attr('data-video')}`;
          if (!serverUrl.includes('dembed2')) throw new Error('Try another server');
          break;
        case StreamingServers.MixDrop:
          serverUrl = $('.mixdrop').attr('data-video')!;
          if (!serverUrl.includes('mixdrop')) throw new Error('Try another server');
          break;
        case StreamingServers.StreamTape:
          serverUrl = $('.streamtape').attr('data-video')!;
          if (!serverUrl.includes('streamtape')) throw new Error('Try another server');
          break;
        case StreamingServers.StreamSB:
          serverUrl = $('.streamsb').attr('data-video')!;
          if (!serverUrl.includes('stream')) throw new Error('Try another server');
          break;
      }

      return await this.fetchEpisodeSources(serverUrl, server);
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  override fetchEpisodeServers = async (mediaLink: string, ...args: any): Promise<IEpisodeServer[]> => {
    throw new Error('Method not implemented.');
  };
}

(async () => {
  const drama = new Dramacool();
  const mediaInfo = await drama.fetchMediaInfo('vincenzo');
  console.log(mediaInfo);
  const sources = await drama.fetchEpisodeSources(mediaInfo.episodes![20].id, StreamingServers.StreamSB);
  console.log(sources);
})();

export default Dramacool;
