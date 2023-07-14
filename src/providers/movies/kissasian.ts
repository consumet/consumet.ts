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
import { MixDrop, AsianLoad, StreamTape, StreamSB } from '../../extractors';

class KissAsian extends MovieParser {
  override readonly name = 'KissAsian';
  protected override baseUrl = 'https://kissasian.pe';
  protected override logo = 'https://viewasian.co/images/logo.png';
  protected override classPath = 'MOVIES.KissAsian';
  override supportedTypes = new Set([TvType.MOVIE, TvType.TVSERIES]);

  override search = async (query: string, page: number = 1): Promise<ISearch<IMovieResult>> => {
    try {
      const searchResult: ISearch<IMovieResult> = {
        currentPage: page,
        hasNextPage: false,
        results: [],
      };

      const { data } = await axios.get(
        `${this.baseUrl}/search.html?keyword=${query.replace(/[\W_]+/g, '-')}&page=${page}`
      );
      const $ = load(data);

      searchResult.hasNextPage = $('ul.pagination > li.next').length > 0;

      $('div.list-drama div.item').each((i, el) => {
        searchResult.results.push({
          id: $(el).find('a').attr('href')?.slice(1)!,
          title: $(el).find('.title').text().trim(),
          url: `${this.baseUrl}${$(el).find('a').attr('href')}`,
          image: `https:${$(el).find('img').attr('src')}`,
        });
      });

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

      const { data } = await axios.get(mediaId);
      const $ = load(data);

      mediaInfo.id = realMediaId;
      mediaInfo.title = $('div.barContentInfo > a.bigChar').text().trim();
      mediaInfo.image = `https:${$('div.barContentInfo img').attr('src')}`;
      mediaInfo.otherNames = $('.other-name a')
        .map((i, el) => $(el).attr('title')!.trim())
        .get();
      mediaInfo.description = $('p.des').siblings('p').text().split('Summary:').pop()?.trim();
      mediaInfo.releaseDate = $('div.barContentInfo p.type.Releasea')
        .text()
        .split('Date aired:')
        .pop()
        ?.replace(/\t/g, '')
        .replace(/\n/g, '')
        .trim();
      mediaInfo.genre = $('div.barContentInfo p:contains(Genres:) a')
        .map((i, el) => $(el).text().split(',').join('').trim())
        .get();
      mediaInfo.country = $('div.barContentInfo p:contains(Country) a').text().trim();

      switch ($('div.barContentInfo p:contains(Status:)').text().replace('Status:', '').trim()) {
        case 'Releasing':
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
      $('ul.listing li').each((i, el) => {
        mediaInfo.episodes?.push({
          id: $(el).find('a').attr('href')?.slice(1)!,
          title: $(el).find('a').attr('title')!.trim(),
          episode: $(el).find('a').attr('title')?.split('Episode').pop()?.trim(),
          url: `${this.baseUrl}${$(el).find('a').attr('href')}`,
          releaseDate: $(el).find('span').text().trim(),
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
      const { data } = await axios.get(`${this.baseUrl}/${episodeId}`);
      const $ = load(data);

      const server = `https:${$('select#selectServer option')?.attr('value')}`;

      const serverData = await axios.get(server);
      const $$ = load(serverData.data);

      $$('.list-server-items > .linkserver').map((i, ele) => {
        if ($$(ele).attr('data-status') === '1') {
          epsiodeServers.push({
            name: $$(ele).text().trim(),
            url: $$(ele).attr('data-video')!,
          });
        }
      });

      return epsiodeServers;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  override fetchEpisodeSources = async (
    episodeId: string,
    server: StreamingServers = StreamingServers.MixDrop
  ): Promise<ISource> => {
    if (episodeId.startsWith('http')) {
      const serverUrl = new URL(episodeId);
      switch (server) {
        case StreamingServers.AsianLoad:
          return { ...(await new AsianLoad().extract(serverUrl)) };
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

    try {
      const servers = await this.fetchEpisodeServers(episodeId);
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
