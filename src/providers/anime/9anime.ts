import { load } from 'cheerio';
import axios from 'axios';

import {
  AnimeParser,
  ISearch,
  IAnimeInfo,
  IAnimeEpisode,
  MediaStatus,
  SubOrSub,
  IAnimeResult,
  IEpisodeServer,
  ISource,
  StreamingServers,
  MediaFormat,
} from '../../models';
import { StreamTape, VizCloud, Filemoon } from '../../extractors';
import { USER_AGENT, range } from '../../utils';

/**
 * **Use at your own risk :)** 9anime devs keep changing the keys every week
 */
class NineAnime extends AnimeParser {
  override readonly name = '9Anime';
  protected override baseUrl = 'https://9anime.pl';
  protected override logo =
    'https://d1nxzqpcg2bym0.cloudfront.net/google_play/com.my.nineanime/87b2fe48-9c36-11eb-8292-21241b1c199b/128x128';
  protected override classPath = 'ANIME.NineAnime';
  override readonly isWorking = false;

  override async search(query: string, page: number = 1): Promise<ISearch<IAnimeResult>> {
    const searchResult: ISearch<IAnimeResult> = {
      currentPage: page,
      hasNextPage: false,
      results: [],
    };

    try {
      const vrf = await this.ev(query);
      const res = await axios.get(
        `${this.baseUrl}/filter?keyword=${query.replace(/%20/g, '+')}&vrf=${vrf}&page=${page}`
      );

      const $ = load(res.data);

      searchResult.hasNextPage =
        $(`ul.pagination`).length > 0
          ? $('ul.pagination > li').last().hasClass('disabled')
            ? false
            : true
          : false;

      $('#list-items > div.item').each((i, el) => {
        const subs = $(el)
          .find('div.ani > a > div.meta > div > div.left > span.ep-status')
          .map((i, el) => {
            if ($(el).hasClass('sub')) {
              return SubOrSub.SUB;
            } else if ($(el).hasClass('dub')) {
              return SubOrSub.DUB;
            }
          })
          .get();

        let type = undefined;
        switch ($(el).find('div > div.ani > a > div.meta > div > div.right').text()!.trim()) {
          case 'MOVIE':
            type = MediaFormat.MOVIE;
            break;
          case 'TV':
            type = MediaFormat.TV;
            break;
          case 'OVA':
            type = MediaFormat.OVA;
            break;
          case 'SPECIAL':
            type = MediaFormat.SPECIAL;
            break;
          case 'ONA':
            type = MediaFormat.ONA;
            break;
          case 'MUSIC':
            type = MediaFormat.MUSIC;
            break;
        }

        searchResult.results.push({
          id: $(el).find('div > div.ani > a').attr('href')?.split('/')[2]!,
          title: $(el).find('div > div.info > div.b1 > a').text()!,
          url: `${this.baseUrl}${$(el).find('div > div.ani > a').attr('href')}`,
          image: $(el).find('div > div.ani > a > img').attr('src'),
          subOrSub: subs.includes(SubOrSub.SUB) && subs.includes(SubOrSub.DUB) ? SubOrSub.BOTH : subs[0],
          type: type,
        });
      });

      return searchResult;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  override async fetchAnimeInfo(animeUrl: string, isDub: boolean = false): Promise<IAnimeInfo> {
    if (!animeUrl.startsWith(this.baseUrl)) animeUrl = `${this.baseUrl}/watch/${animeUrl}`;

    const animeInfo: IAnimeInfo = {
      id: '',
      title: '',
      url: animeUrl,
    };

    try {
      const res = await axios.get(animeUrl);

      const $ = load(res.data);

      animeInfo.id = new URL(animeUrl).pathname.split('/')[2];
      animeInfo.title = $('h1.title').text();
      animeInfo.jpTitle = $('h1.title').attr('data-jp');
      animeInfo.genres = Array.from(
        $('div.meta:nth-child(1) > div:nth-child(5) > span > a').map((i, el) => $(el).text())
      );
      animeInfo.image = $('.binfo > div.poster > span > img').attr('src');
      animeInfo.description = $('.content').text()?.trim();
      switch ($('div.meta:nth-child(1) > div:nth-child(1) > span:nth-child(1) > a').text()) {
        case 'MOVIE':
          animeInfo.type = MediaFormat.MOVIE;
          break;
        case 'TV':
          animeInfo.type = MediaFormat.TV;
          break;
        case 'OVA':
          animeInfo.type = MediaFormat.OVA;
          break;
        case 'SPECIAL':
          animeInfo.type = MediaFormat.SPECIAL;
          break;
        case 'ONA':
          animeInfo.type = MediaFormat.ONA;
          break;
        case 'MUSIC':
          animeInfo.type = MediaFormat.MUSIC;
          break;
      }
      animeInfo.studios = Array.from(
        $('div.meta:nth-child(1) > div:nth-child(2) > span:nth-child(1) > a').map(
          (i, el) => $(el).text()?.trim()!
        )
      );
      animeInfo.releaseDate = $('div.meta:nth-child(1) > div:nth-child(3) > span:nth-child(1)')
        .text()
        .trim()
        .split('to')[0]
        ?.trim();

      switch ($('div.meta:nth-child(1) > div:nth-child(4) > span:nth-child(1)').text()?.trim()) {
        case 'Releasing':
          animeInfo.status = MediaStatus.ONGOING;
          break;
        case 'Completed':
          animeInfo.status = MediaStatus.COMPLETED;
          break;
        case 'Cancelled':
          animeInfo.status = MediaStatus.CANCELLED;
          break;
        case 'Unknown':
          animeInfo.status = MediaStatus.UNKNOWN;
          break;
        default:
          animeInfo.status = MediaStatus.UNKNOWN;
          break;
      }

      animeInfo.score = parseFloat(
        $('.bmeta > div:nth-child(2) > div:nth-child(2) > span:nth-child(1)')?.text().split('by')[0]
      );
      animeInfo.premiered = $(
        '.bmeta > div:nth-child(2) > div:nth-child(3) > span:nth-child(1) > a:nth-child(1)'
      ).text();
      animeInfo.duration = $('.bmeta > div:nth-child(2) > div:nth-child(4) > span:nth-child(1)').text();
      animeInfo.views = parseInt(
        $('.bmeta > div:nth-child(2) > div:nth-child(5) > span:nth-child(1)')
          .text()
          .split('by')
          .join('')
          .split(',')
          .join('')
          .trim()
      );
      animeInfo.otherNames = $('.names')
        .text()
        .split('; ')
        .map(name => name?.trim());

      const id = $('#watch-main').attr('data-id')!;

      const vrf = await this.ev(id);
      const { data: { result } } = await axios.get(`${this.baseUrl}/ajax/episode/list/${id}?vrf=${vrf}`);

      const $$ = load(result);

      animeInfo.totalEpisodes = $$('div.episodes > ul > li > a').length;
      animeInfo.episodes = [];

      const promises = [];
      const episodes:IAnimeEpisode[] = [];
      $$('div.episodes > ul > li > a').map((i, el) => {
        $$(el).map((i, el) => {
            const promise = new Promise(async(resolve, reject) => {
                const possibleIds = $$(el).attr('data-ids')?.split(',')!;
                const id = possibleIds[isDub ? 1 : 0] ?? possibleIds[0];
                const number = parseInt($$(el).attr('data-num')?.toString()!);
                const title = $$(el).find('span').text().length > 0 ? $$(el).find('span').text() : undefined;
                const isFiller = $$(el).hasClass('filler');
    
                const vrf = await this.ev(id);

                episodes.push({
                  id: id,
                  number: number,
                  title: title,
                  isFiller: isFiller,
                  url: `${this.baseUrl}/ajax/server/list/${id}?vrf=${vrf}`,
                });
                resolve(true);
            })
            promises.push(promise);
          }).get();
      })
      animeInfo.episodes?.push(...episodes);

      return animeInfo;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  override async fetchEpisodeSources(
    episodeId: string,
    server: StreamingServers = StreamingServers.VizCloud
  ): Promise<ISource> {
    if (episodeId.startsWith('http')) {
      const serverUrl = new URL(episodeId);
      switch (server) {
        case StreamingServers.StreamTape:
          return {
            headers: { Referer: serverUrl.href, 'User-Agent': USER_AGENT },
            sources: await new StreamTape().extract(serverUrl),
          };
        case StreamingServers.VizCloud:
          return {
            headers: { Referer: serverUrl.href, 'User-Agent': USER_AGENT },
            sources: await new VizCloud().extract(serverUrl, (query, string) => "", (query, string) => ""), // todo
          };
        case StreamingServers.MyCloud:
          return {
            headers: { Referer: serverUrl.href, 'User-Agent': USER_AGENT },
            sources: await new VizCloud().extract(serverUrl, (query, string) => "", (query, string) => ""),
          };
        case StreamingServers.Filemoon:
          return {
            headers: { Referer: serverUrl.href, 'User-Agent': USER_AGENT },
            sources: await new Filemoon().extract(serverUrl),
          };
      }
    }
    try {
      const servers = await this.fetchEpisodeServers(episodeId);

      let s = servers.find(s => s.name === server);
      switch (server) {
        case StreamingServers.VizCloud:
          s = servers.find(s => s.name === 'vidstream')!;
          if (!s) throw new Error('Vidstream server found');
          break;
        case StreamingServers.StreamTape:
          s = servers.find(s => s.name === 'streamtape');
          if (!s) throw new Error('Streamtape server found');
          break;
        case StreamingServers.MyCloud:
          s = servers.find(s => s.name === 'mycloud');
          if (!s) throw new Error('Mycloud server found');
          break;
        case StreamingServers.Filemoon:
          s = servers.find(s => s.name === 'filemoon');
          if (!s) throw new Error('Filemoon server found');
          break;
        default:
          throw new Error('Server not found');
      }
      const {
        data: {
          result: { url },
        },
      } = await axios.get(s.url);
      const iframe = ""; // todo

      return await this.fetchEpisodeSources(`htt${iframe.slice(3)}`, server);
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  override async fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]> {
    if (!episodeId.startsWith(this.baseUrl))
      episodeId = `${this.baseUrl}/ajax/server/list/${episodeId}?vrf=${this.ev(episodeId)}`;

    const {
      data: { result },
    } = await axios.get(episodeId);

    const $ = load(result);

    const servers: IEpisodeServer[] = [];
    const promises = [];
    $('.type > ul > li').each((i, el) => {
        const promise = new Promise(async(resolve, reject) => {
            const serverId = $(el).attr('data-link-id')!;
            const vrf = await this.ev(serverId);

            servers.push({
              name: $(el).text().toLocaleLowerCase(),
              url: `${this.baseUrl}/ajax/server/${serverId}?vrf=${vrf}`,
            });
            resolve(true);
        })
        promises.push(promise);
    });

    return servers;
  }

  private async ev(query: string): Promise<string> {
    const { data } = await axios.get(`https://9anime.anify.tv/vrf?query=${encodeURIComponent(query)}`);
    return data;
  }

  private dv(query: string): string {
    return "";
  }
}

export default NineAnime;
