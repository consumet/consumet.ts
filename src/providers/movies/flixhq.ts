import { load } from 'cheerio';
import axios, { AxiosResponse } from 'axios';

import {
  MovieParser,
  TvType,
  IMovieInfo,
  IEpisodeServer,
  StreamingServers,
  ISource,
} from '../../models';
import { MixDrop, UpCloud } from '../../utils';

class FlixHQ extends MovieParser {
  override readonly name = 'FlixHQ';
  protected override baseUrl = 'https://flixhq.to';
  protected override logo =
    'https://img.flixhq.to/xxrz/400x400/100/ab/5f/ab5f0e1996cc5b71919e10e910ad593e/ab5f0e1996cc5b71919e10e910ad593e.png';
  protected override classPath = 'MOVIES.FlixHQ';
  protected override supportedTypes = new Set([TvType.MOVIE, TvType.TVSERIES]);

  override search = (query: string, ...args: any[]): Promise<unknown> => {
    throw new Error('Method not implemented.');
  };

  /**
   *
   * @param mediaId media link or id
   */
  override fetchMediaInfo = async (mediaId: string): Promise<IMovieInfo> => {
    if (!mediaId.startsWith(this.baseUrl)) {
      mediaId = `${this.baseUrl}/${mediaId}`;
    }

    const movieInfo: IMovieInfo = {
      id: mediaId.split('to/').pop()!,
      title: '',
      url: mediaId,
    };
    try {
      const { data } = await axios.get(mediaId);
      const $ = load(data);

      const uid = $('.watch_block').attr('data-id')!;
      movieInfo.title = $('.heading-name > a:nth-child(1)').text();
      movieInfo.image = $('.m_i-d-poster > div:nth-child(1) > img:nth-child(1)').attr('src');
      movieInfo.description = $('.description').text();
      movieInfo.type = movieInfo.id.split('/')[0] === 'tv' ? TvType.TVSERIES : TvType.MOVIE;
      movieInfo.releaseDate = $('div.row-line:nth-child(3)')
        .text()
        .replace('Released: ', '')
        .trim();
      movieInfo.genres = $('div.row-line:nth-child(2) > a')
        .map((i, el) => $(el).text().split('&'))
        .get()
        .map((v) => v.trim());
      movieInfo.casts = $('div.row-line:nth-child(5) > a')
        .map((i, el) => $(el).text())
        .get();
      movieInfo.tags = $('div.row-line:nth-child(6) > h2')
        .map((i, el) => $(el).text())
        .get();
      movieInfo.production = $('div.row-line:nth-child(4) > a:nth-child(2)').text();
      movieInfo.duration = $('span.item:nth-child(3)').text();
      movieInfo.rating = parseFloat($('span.item:nth-child(2)').text());

      let ajaxReqUrl = (id: string, type: string, isSeasons: boolean = false) =>
        `${this.baseUrl}/ajax/${type === 'movie' ? type : `v2/${type}`}/${
          isSeasons ? 'seasons' : 'episodes'
        }/${id}`;

      if (movieInfo.type === TvType.TVSERIES) {
        const { data } = await axios.get(ajaxReqUrl(uid, 'tv', true));
        const $$ = load(data);
        const seasonsIds = $$('.dropdown-menu > a')
          .map((i, el) => $(el).attr('data-id'))
          .get();

        movieInfo.episodes = [];
        let season = 1;
        for (const id of seasonsIds) {
          const { data } = await axios.get(ajaxReqUrl(id, 'season'));
          const $$$ = load(data);

          $$$('.nav > li')
            .map((i, el) => {
              const episode = {
                id: $$$(el).find('a').attr('id')!.split('-')[1],
                title: $$$(el).find('a').attr('title')!,
                number: parseInt($$$(el).find('a').attr('title')!.split(':')[0].slice(3).trim()),
                season: season,
                url: `${this.baseUrl}/ajax/v2/episode/servers/${
                  $$$(el).find('a').attr('id')!.split('-')[1]
                }`,
              };
              movieInfo.episodes?.push(episode);
            })
            .get();
          season++;
        }
      } else {
        const { data } = await axios.get(ajaxReqUrl(uid, 'movie'));
        const $$$ = load(data);
        movieInfo.episodes = $$$('.nav > li')
          .map((i, el) => {
            const episode = {
              id: uid,
              title: movieInfo.title + ' Movie',
              url: `${this.baseUrl}/ajax/movie/episodes/${uid}`,
            };
            return episode;
          })
          .get();
      }

      return movieInfo;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   *
   * @param episodeId episode id
   * @param mediaId media id
   * @param server server type (default `MixDrop`) (optional)
   */
  override fetchEpisodeSources = async (
    episodeId: string,
    mediaId: string,
    server: StreamingServers = StreamingServers.MixDrop
  ): Promise<ISource> => {
    if (episodeId.startsWith('http')) {
      const serverUrl = new URL(episodeId);
      switch (server) {
        case StreamingServers.MixDrop:
          return {
            headers: { Referer: serverUrl.href },
            sources: await new MixDrop().extract(serverUrl),
          };
        case StreamingServers.UpCloud:
          return {
            headers: { Referer: serverUrl.href },
            sources: await new UpCloud().extract(serverUrl),
          };
        default:
          return {
            headers: { Referer: serverUrl.href },
            sources: await new MixDrop().extract(serverUrl),
          };
      }
    }

    try {
      const servers = await this.fetchEpisodeServers(episodeId, mediaId);

      const i = servers.findIndex((s) => s.name === server);

      if (i === -1) {
        throw new Error(`Server ${server} not found`);
      }

      const { data } = await axios.get(
        `${this.baseUrl}/ajax/get_link/${servers[i].url.split('.').slice(-1).shift()}`
      );

      const serverUrl: URL = new URL(data.link);

      return await this.fetchEpisodeSources(serverUrl.href, mediaId, server);
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   *
   * @param episodeId takes episode link or movie id
   * @param mediaId takes movie link or id (found on movie info object)
   */
  override fetchEpisodeServers = async (
    episodeId: string,
    mediaId: string
  ): Promise<IEpisodeServer[]> => {
    if (!episodeId.startsWith(this.baseUrl + '/ajax') && !mediaId.includes('movie')) {
      episodeId = `${this.baseUrl}/ajax/v2/episode/servers/${episodeId}`;
    } else {
      episodeId = `${this.baseUrl}/ajax/movie/episodes/${episodeId}`;
    }
    try {
      const { data } = await axios.get(episodeId);
      const $ = load(data);

      const servers = $('.nav > li')
        .map((i, el) => {
          const server = {
            name: mediaId.includes('movie')
              ? $(el).find('a').attr('title')!.toLowerCase()
              : $(el).find('a').attr('title')!.slice(6).trim().toLowerCase(),
            url: `${this.baseUrl}/${mediaId}.${
              !mediaId.includes('movie')
                ? $(el).find('a').attr('data-id')
                : $(el).find('a').attr('data-linkid')
            }`.replace(
              !mediaId.includes('movie') ? /\/tv\// : /\/movie\//,
              !mediaId.includes('movie') ? '/watch-tv/' : '/watch-movie/'
            ),
          };
          return server;
        })
        .get();
      return servers;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };
}

(async () => {
  const flixHQ = new FlixHQ();
  const movieInfo = await flixHQ.fetchMediaInfo('tv/watch-vincenzo-67955');
  const episode1 = await flixHQ.fetchEpisodeSources(
    movieInfo.episodes![1].id,
    movieInfo.id,
    'upcloud' as StreamingServers
  );
  console.log(episode1);
})();

export default FlixHQ;
