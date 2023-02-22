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
  private superSecretAPI = "";
  protected override baseUrl = 'https://9anime.pl';
  protected override logo =
    'https://d1nxzqpcg2bym0.cloudfront.net/google_play/com.my.nineanime/87b2fe48-9c36-11eb-8292-21241b1c199b/128x128';
  protected override classPath = 'ANIME.NineAnime';
  override readonly isWorking = false;

  constructor(nineAnimeBase? : string){
    super();
    this.superSecretAPI = nineAnimeBase ? nineAnimeBase : this.superSecretAPI;
  }

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

  override async fetchAnimeInfo(animeUrl: string, isDub: boolean = true): Promise<IAnimeInfo> {
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
                const possibleIds = $$(el).attr('data-ids')?.split(',')!;
                const id = possibleIds[isDub ? 1 : 0] ?? possibleIds[0];
                const number = parseInt($$(el).attr('data-num')?.toString()!);
                const title = $$(el).find('span').text().length > 0 ? $$(el).find('span').text() : undefined;
                const isFiller = $$(el).hasClass('filler');
    

                episodes.push({
                  id: id,
                  number: number,
                  title: title,
                  isFiller: isFiller,
                  url: `${id}`,
                  // url: `${this.baseUrl}/ajax/server/list/${id}?vrf=${vrf}`,
                });
          }).get();
      })
      animeInfo.episodes?.push(...episodes);

      return animeInfo;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  async extractServerViz(serverID : string){
    const serverVrf = (await axios.get(`${this.superSecretAPI}/vrf?query=${encodeURIComponent(serverID)}`)).data.url;
    const serverSource = (await axios.get(`https://9anime.to/ajax/server/${serverID}?vrf=${serverVrf}`)).data;
    const vidStreamID = (await axios.get(`${this.superSecretAPI}/decrypt?query=${encodeURIComponent(serverSource.result.url)}`)).data.url.split("/").pop();
    const m3u8File = (await axios.get(`${this.superSecretAPI}/getLink?query=${encodeURIComponent(vidStreamID)}`)).data.data.media.sources[0].file;
    return m3u8File;
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
      
      const response : ISource = {
        "sources" : [await this.extractServerViz(s.url)]
      };

      return response;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  override async fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]> {
    if (!episodeId.startsWith(this.baseUrl))
      episodeId = `${this.baseUrl}/ajax/server/list/${episodeId}?vrf=${await this.ev(episodeId)}`;


    const {
      data: { result },
    } = await axios.get(episodeId);

    const $ = load(result);

    const servers: IEpisodeServer[] = [];
    $('.type > ul > li').each((i, el) => {
          const serverId = $(el).attr('data-link-id')!;
          servers.push({
            name: $(el).text().toLocaleLowerCase(),
            url: `${serverId}`,
          });
    });

    return servers;
  }

  private async ev(query: string): Promise<string> {
    const { data } = await axios.get(`${this.superSecretAPI}/vrf?query=${encodeURIComponent(query)}`);
    return data.url;
  }

  private dv(query: string): string {
    return "";
  }
}
``
// let _9 = new NineAnime();
// _9.search("odd taxi").then((x) => console.log(x)).catch((x) => console.error(x));
// _9.fetchAnimeInfo("oddtaxi.3w6y").then((x) => console.log(x)).catch((x) => console.error(x));
// _9.fetchEpisodeSources("152510").then((x) => console.log(x)).catch((x) => console.error(x));
export default NineAnime;
