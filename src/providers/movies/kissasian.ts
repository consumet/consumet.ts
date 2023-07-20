import axios from 'axios';
import { load } from 'cheerio';

import {
  MovieParser,
  TvType,
  IMovieInfo,
  IEpisodeServer,
  StreamingServers,
  ISource,
  IMovieResult,
  ISearch,
  MediaStatus,
} from '../../models';
import { MixDrop, StreamTape, StreamSB, VidMoly } from '../../extractors';
import StreamWish from '../../extractors/streamwish';

class KissAsian extends MovieParser {
  override readonly name = 'KissAsian';
  protected override baseUrl = 'https://kissasian.mx';
  protected override logo = 'https://kissasian.mx/Content/images/logo.png';
  protected override classPath = 'MOVIES.KissAsian';
  override supportedTypes = new Set([TvType.MOVIE, TvType.TVSERIES]);

  override search = async (query: string, page: number = 1): Promise<ISearch<IMovieResult>> => {
    try {
      const searchResult: ISearch<IMovieResult> = {
        currentPage: page,
        hasNextPage: false,
        results: [],
      };

      const response = await axios.post(
        `${this.baseUrl}/Search/Drama`,
        `keyword=${query.replace(/[\W_]+/g, '-')}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      const $ = load(response.data);

      $('div.item-list > div.list').each((i, el) => {
        searchResult.results.push({
          id: $(el).find('div.info > p > a').attr('href')?.slice(1)!,
          title: $(el).find('div.info > p > a').text().trim(),
          url: `${this.baseUrl}${$(el).find('div.info > p > a').attr('href')}`,
          image: `${this.baseUrl}${$(el).find('div.cover > a > img').attr('src')}`,
        });
      });

      if (searchResult.results.length === 0) {
        searchResult.results.push({
          id: response.request.res.responseUrl.replace(/https?:\/\/[^\/]*\/?/i, ''),
          title: $('div.content').first().find('div.heading > h3').text().trim(),
          url: response.request.res.responseUrl,
          image: `${this.baseUrl}${$('div.content').first().find('div.cover > img').attr('src')}`,
        });
      }

      return searchResult;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  override fetchMediaInfo = async (mediaId: string): Promise<IMovieInfo> => {
    try {
      const realMediaId = mediaId;
      if (!mediaId.startsWith(this.baseUrl)) mediaId = `${this.baseUrl}/${mediaId}`;

      const mediaInfo: IMovieInfo = {
        id: '',
        title: '',
      };

      const { data } = await axios.post(mediaId, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const $ = load(data);

      mediaInfo.id = realMediaId;
      mediaInfo.title = $('div.content').first().find('div.heading > h3').text().trim();
      mediaInfo.image = `${this.baseUrl}${$('div.content').first().find('div.cover > img').attr('src')}`;
      mediaInfo.otherNames = $('span:contains(Other name:)')
        .siblings()
        .map((i, el) => $(el).text()!.trim())
        .get();
      mediaInfo.description = $('div.summary1 > p').text().trim();
      mediaInfo.releaseDate = $('span:contains(Date aired:)')
        .parent()
        .text()
        .split('Date aired:')
        .pop()
        ?.replace(/\t/g, '')
        .replace(/\n/g, '')
        .trim();
      mediaInfo.genre = $('span:contains(Genres:)')
        .siblings('a')
        .map((i, el) => $(el).text()!.trim())
        .get();
      mediaInfo.country = $('span:contains(Country:)').siblings('a').text().trim();

      switch ($('span:contains(Status:)').parent().text().split('Status:').pop()?.trim()) {
        case 'Ongoing':
          mediaInfo.status = MediaStatus.ONGOING;
          break;
        case 'Completed':
          mediaInfo.status = MediaStatus.COMPLETED;
          break;
        case 'Cancelled':
          mediaInfo.status = MediaStatus.CANCELLED;
          break;
        case 'Unknown':
          mediaInfo.status = MediaStatus.UNKNOWN;
          break;
        default:
          mediaInfo.status = MediaStatus.UNKNOWN;
          break;
      }

      mediaInfo.episodes = [];
      $('ul.list li.episodeSub').each((i, el) => {
        mediaInfo.episodes?.push({
          id: $(el).find('a').attr('href')?.slice(1)!,
          title: $(el).find('a').text().trim(),
          episode: $(el).find('a').text()?.split('Episode').pop()?.trim(),
          url: `${this.baseUrl}${$(el).find('a').attr('href')}`,
        });
      });
      mediaInfo.episodes.reverse();

      return mediaInfo;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  override async fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]> {
    try {
      const epsiodeServers: IEpisodeServer[] = [];

      const { data } = await axios.post(`${this.baseUrl}/${episodeId}`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const $ = load(data);
      epsiodeServers.push({
        name: $('ul.mirrorTab > li > a.actived').text().trim(),
        url: $('iframe#mVideo').attr('src')!,
      });

      await Promise.all(
        $('ul.mirrorTab > li > a.ign').map(async (i, ele) => {
          const { data } = await axios.post(`${this.baseUrl}${$(ele).attr('href')}`, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          });

          const $$ = load(data);
          if ($$('ul.mirrorTab > li > a.actived').text().trim()) {
            const url = $$('iframe#mVideo').attr('src')!;
            epsiodeServers.push({
              name: $$('ul.mirrorTab > li > a.actived').text().trim(),
              url: url.startsWith('https') ? url : url.replace('//', 'https://'),
            });
          }
        })
      );

      epsiodeServers.map(element => {
        switch (element.name) {
          case 'VM':
            element.name = StreamingServers.VidMoly;
            break;
          case 'SW':
            element.name = StreamingServers.StreamWish;
            break;
          case 'Unknown':
            element.name = StreamingServers.VidMoly;
            break;
          default:
            element.name = element.name;
            break;
        }
      });

      return epsiodeServers;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  override fetchEpisodeSources = async (
    episodeId: string,
    server: StreamingServers = StreamingServers.StreamWish
  ): Promise<ISource> => {
    if (episodeId.startsWith('http')) {
      const serverUrl = new URL(episodeId);
      switch (server) {
        case StreamingServers.VidMoly:
          return {
            sources: await new VidMoly().extract(serverUrl),
          };
        case StreamingServers.StreamWish:
          return {
            sources: await new StreamWish().extract(serverUrl),
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

    try {
      const servers = await this.fetchEpisodeServers(episodeId);
      console.log(servers);
      const i = servers.findIndex(s => s.name.toLowerCase() === server.toLowerCase());

      if (i === -1) {
        throw new Error(`Server ${server} not found`);
      }

      const serverUrl: URL = new URL(
        servers.filter(s => s.name.toLowerCase() === server.toLowerCase())[0].url
      );

      return await this.fetchEpisodeSources(serverUrl.href, server);
    } catch (err) {
      throw err;
    }
  };
}

export default KissAsian;
