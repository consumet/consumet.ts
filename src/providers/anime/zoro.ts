import { AxiosAdapter } from 'axios';
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
  StreamingServers,
  MediaFormat,
  SubOrSub,
  ProxyConfig,
} from '../../models';

import { StreamSB, RapidCloud, StreamTape } from '../../utils';
import { USER_AGENT } from '../../utils';

class Zoro extends AnimeParser {
  override readonly name = 'Zoro';
  protected override baseUrl = 'https://aniwatch.to';
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
      totalPages: 0,
      results: [],
    };

    try {
      const { data } = await this.client.get(
        `${this.baseUrl}/search?keyword=${decodeURIComponent(query)}&page=${page}`
      );
      const $ = load(data);

      res.hasNextPage =
        $('.pagination > li').length > 0
          ? $('.pagination li.active').length > 0
            ? $('.pagination > li').last().hasClass('active')
              ? false
              : true
            : false
          : false;

      res.totalPages =
        parseInt(
          $('.pagination > .page-item a[title="Last"]')?.attr('href')?.split('=').pop() ??
            $('.pagination > .page-item.active a')?.text()?.trim()
        ) || 0;

      if (res.totalPages === 0 && !res.hasNextPage) res.totalPages = 1;

      $('.film_list-wrap > div.flw-item').each((i, el) => {
        const id = $(el)
          .find('div:nth-child(1) > a.film-poster-ahref')
          .attr('href')
          ?.split('/')[1]
          .split('?')[0];
        const title = $(el).find('div.film-detail > h3.film-name > a.dynamic-name').attr('title')!;
        // Movie, TV, OVA, ONA, Special, Music
        const type = $(el).find('div:nth-child(2) > div:nth-child(2) > span:nth-child(1)').text();
        const image = $(el).find('div:nth-child(1) > img.film-poster-img').attr('data-src');
        const url = this.baseUrl + $(el).find('div:nth-child(1) > a').last().attr('href');

        res.results.push({
          id: id!,
          title: title,
          type: type.toUpperCase() as MediaFormat,
          image: image,
          url: url,
        });
      });

      if (res.results.length === 0) {
        res.totalPages = 0;
        res.hasNextPage = false;
      }

      return res;
    } catch (err: any) {
      throw new Error(err);
    }
  };

  /**
   * @param id Anime id
   */
  override fetchAnimeInfo = async (id: string): Promise<IAnimeInfo> => {
    const info: IAnimeInfo = {
      id: id,
      title: '',
    };
    try {
      const { data } = await this.client.get(`${this.baseUrl}/watch/${id}`);
      const $ = load(data);

      const { mal_id, anilist_id } = JSON.parse($('#syncData').text());
      info.malID = Number(mal_id);
      info.alID = Number(anilist_id);
      info.title = $('h2.film-name > a.text-white').text();
      info.image = $('img.film-poster-img').attr('src');
      info.description = $('div.film-description').text().trim();
      // Movie, TV, OVA, ONA, Special, Music
      info.type = $('span.item').last().prev().prev().text().toUpperCase() as MediaFormat;
      info.url = `${this.baseUrl}/${id}`;

      const hasSub: boolean = $('div.film-stats div.tick div.tick-item.tick-sub').length > 0;
      const hasDub: boolean = $('div.film-stats div.tick div.tick-item.tick-dub').length > 0;

      if (hasSub) {
        info.subOrDub = SubOrSub.SUB;
        info.hasSub = hasSub;
      }
      if (hasDub) {
        info.subOrDub = SubOrSub.DUB;
        info.hasDub = hasDub;
      }
      if (hasSub && hasDub) {
        info.subOrDub = SubOrSub.BOTH;
      }

      const episodesAjax = await this.client.get(
        `${this.baseUrl}/ajax/v2/episode/list/${id.split('-').pop()}`,
        {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            Referer: `${this.baseUrl}/watch/${id}`,
          },
        }
      );

      const $$ = load(episodesAjax.data.html);

      info.totalEpisodes = $$('div.detail-infor-content > div > a').length;
      info.episodes = [];
      $$('div.detail-infor-content > div > a').each((i, el) => {
        const episodeId = $$(el)
          .attr('href')
          ?.split('/')[2]
          ?.replace('?ep=', '$episode$')
          ?.concat(`$${info.subOrDub}`)!;
        const number = parseInt($$(el).attr('data-number')!);
        const title = $$(el).attr('title');
        const url = this.baseUrl + $$(el).attr('href');
        const isFiller = $$(el).hasClass('ssl-item-filler');

        info.episodes?.push({
          id: episodeId,
          number: number,
          title: title,
          isFiller: isFiller,
          url: url,
        });
      });

      return info;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   *
   * @param episodeId Episode id
   */
  override fetchEpisodeSources = async (
    episodeId: string,
    server: StreamingServers = StreamingServers.VidCloud
  ): Promise<ISource> => {
    if (episodeId.startsWith('http')) {
      const serverUrl = new URL(episodeId);
      switch (server) {
        case StreamingServers.VidStreaming:
        case StreamingServers.VidCloud:
          return {
            ...(await new RapidCloud(this.proxyConfig, this.adapter).extract(serverUrl)),
          };
        case StreamingServers.StreamSB:
          return {
            headers: {
              Referer: serverUrl.href,
              watchsb: 'streamsb',
              'User-Agent': USER_AGENT,
            },
            sources: await new StreamSB(this.proxyConfig, this.adapter).extract(serverUrl, true),
          };
        case StreamingServers.StreamTape:
          return {
            headers: { Referer: serverUrl.href, 'User-Agent': USER_AGENT },
            sources: await new StreamTape(this.proxyConfig, this.adapter).extract(serverUrl),
          };
        default:
        case StreamingServers.VidCloud:
          return {
            headers: { Referer: serverUrl.href },
            ...(await new RapidCloud(this.proxyConfig, this.adapter).extract(serverUrl)),
          };
      }
    }
    if (!episodeId.includes('$episode$')) throw new Error('Invalid episode id');

    // Fallback to using sub if no info found in case of compatibility

    // TODO: add both options later
    const subOrDub: 'sub' | 'dub' = episodeId.split('$')?.pop() === 'dub' ? 'dub' : 'sub';

    episodeId = `${this.baseUrl}/watch/${episodeId
      .replace('$episode$', '?ep=')
      .replace(/\$auto|\$sub|\$dub/gi, '')}`;

    try {
      const { data } = await this.client.get(
        `${this.baseUrl}/ajax/v2/episode/servers?episodeId=${episodeId.split('?ep=')[1]}`
      );

      const $ = load(data.html);

      /**
       * vidtreaming -> 4
       * rapidcloud  -> 1
       * streamsb -> 5
       * streamtape -> 3
       */
      let serverId = '';
      try {
        switch (server) {
          case StreamingServers.VidCloud:
            serverId = this.retrieveServerId($, 1, subOrDub);

            // zoro's vidcloud server is rapidcloud
            if (!serverId) throw new Error('RapidCloud not found');
            break;
          case StreamingServers.VidStreaming:
            serverId = this.retrieveServerId($, 4, subOrDub);

            // zoro's vidcloud server is rapidcloud
            if (!serverId) throw new Error('vidtreaming not found');
            break;
          case StreamingServers.StreamSB:
            serverId = this.retrieveServerId($, 5, subOrDub);

            if (!serverId) throw new Error('StreamSB not found');
            break;
          case StreamingServers.StreamTape:
            serverId = this.retrieveServerId($, 3, subOrDub);

            if (!serverId) throw new Error('StreamTape not found');
            break;
        }
      } catch (err) {
        throw new Error("Couldn't find server. Try another server");
      }

      const {
        data: { link },
      } = await this.client.get(`${this.baseUrl}/ajax/v2/episode/sources?id=${serverId}`);
      return await this.fetchEpisodeSources(link, server);
    } catch (err) {
      throw err;
    }
  };

  private retrieveServerId = ($: any, index: number, subOrDub: 'sub' | 'dub') => {
    return $(`div.ps_-block.ps_-block-sub.servers-${subOrDub} > div.ps__-list > div`)
      .map((i: any, el: any) => ($(el).attr('data-server-id') == `${index}` ? $(el) : null))
      .get()[0]
      .attr('data-id')!;
  };

  /**
   * @param page Page number
   */
  fetchRecentEpisodes = async (page: number = 1): Promise<ISearch<IAnimeResult>> => {
    try {
      const { data } = await this.client.get(`${this.baseUrl}/recently-updated?page=${page}`);
      const $ = load(data);

      const hasNextPage =
        $('.pagination > li').length > 0
          ? $('.pagination > li').last().hasClass('active')
            ? false
            : true
          : false;

      const recentEpisodes: IAnimeResult[] = [];

      $('div.film_list-wrap > div').each((i, el) => {
        recentEpisodes.push({
          id: $(el).find('div.film-poster > a').attr('href')?.replace('/', '')!,
          image: $(el).find('div.film-poster > img').attr('data-src')!,
          title: $(el).find('div.film-poster > img').attr('alt')!,
          url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
          episode: parseInt(
            $(el).find('div.tick-eps').text().replace(/\s/g, '').replace('Ep', '').split('/')[0]
          ),
        });
      });

      return {
        currentPage: page,
        hasNextPage: hasNextPage,
        results: recentEpisodes,
      };
    } catch (err) {
      throw new Error('Something went wrong. Please try again later.');
    }
  };
  /**
   * @deprecated
   * @param episodeId Episode id
   */
  override fetchEpisodeServers = (episodeId: string): Promise<IEpisodeServer[]> => {
    throw new Error('Method not implemented.');
  };
}

// (async () => {
//   const zoro = new Zoro();
//   const anime = await zoro.search('classroom of the elite');
//   const info = await zoro.fetchAnimeInfo(anime.results[0].id);
//   const sources = await zoro.fetchEpisodeSources(info.episodes![0].id);
//   console.log(sources);
// })();

export default Zoro;
