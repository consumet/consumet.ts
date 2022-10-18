import { load } from 'cheerio';
import axios from 'axios';
import { encode, decode } from 'ascii-url-encoder';

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
import { range, StreamTape, USER_AGENT, VizCloud, Filemoon } from '../../utils';

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

  private readonly baseTable = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=_';
  private readonly table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+=/_';
  private cipherKey = '';
  private decipherKey = '';
  private keyMap = '';

  async init() {
    const {
      data: { cipher, decipher, keyMap },
    } = await axios.get('https://raw.githubusercontent.com/AnimeJeff/Brohflow/main/keys.json');
    this.cipherKey = cipher;
    this.decipherKey = decipher;
    this.keyMap = keyMap;
  }

  static async create() {
    const nineanime = new NineAnime();
    await nineanime.init();

    return nineanime;
  }

  override async search(query: string, page: number = 1): Promise<ISearch<IAnimeResult>> {
    const searchResult: ISearch<IAnimeResult> = {
      currentPage: page,
      hasNextPage: false,
      results: [],
    };

    try {
      const res = await axios.get(
        `${this.baseUrl}/filter?keyword=${encode(query).replace(/%20/g, '+')}&vrf=${encode(
          this.ev(query)
        )}&page=${page}`
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

      const {
        data: { result },
      } = await axios.get(`${this.baseUrl}/ajax/episode/list/${id}?vrf=${encode(this.ev(id))}`);

      const $$ = load(result);

      animeInfo.totalEpisodes = $$('div.episodes > ul > li > a').length;
      animeInfo.episodes = [];
      animeInfo.episodes?.push(
        ...$$('div.episodes > ul > li > a').map((i, el): IAnimeEpisode[] => {
          return $$(el)
            .map((i, el): IAnimeEpisode => {
              const possibleIds = $$(el).attr('data-ids')?.split(',')!;
              const id = possibleIds[isDub ? 1 : 0] ?? possibleIds[0];
              const number = parseInt($$(el).attr('data-num')?.toString()!);
              const title = $$(el).find('span').text().length > 0 ? $$(el).find('span').text() : undefined;
              const isFiller = $$(el).hasClass('filler');

              return {
                id: id,
                number: number,
                title: title,
                isFiller: isFiller,
                url: `${this.baseUrl}/ajax/server/list/${id}?vrf=${this.ev(id)}`,
              };
            })
            .get();
        })
      );

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
            sources: await new VizCloud().extract(serverUrl, this.cipher, this.encrypt),
          };
        case StreamingServers.MyCloud:
          return {
            headers: { Referer: serverUrl.href, 'User-Agent': USER_AGENT },
            sources: await new VizCloud().extract(serverUrl, this.cipher, this.encrypt),
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
      const iframe = decode(this.dv(url));

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
    $('.type > ul > li').each((i, el) => {
      const serverId = $(el).attr('data-link-id')!;
      servers.push({
        name: $(el).text().toLocaleLowerCase(),
        url: `${this.baseUrl}/ajax/server/${serverId}?vrf=${encode(this.ev(serverId))}`,
      });
    });

    return servers;
  }

  private ev(query: string): string {
    return this.encrypt(
      this.mapKeys(this.encrypt(this.cipher(encode(query), this.cipherKey), this.baseTable), this.keyMap),
      this.baseTable
    );
  }

  private dv(query: string): string {
    return decode(this.cipher(this.decrypt(query), this.decipherKey));
  }

  private mapKeys(encrypted: string, keyMap: string): string {
    const table = keyMap.split('');
    return encrypted
      .split('')
      .map((c, i) => table[this.table.indexOf(c) * 16 + 1 + (1 % 16)])
      .join('');
  }

  private cipher(query: string, key: string): string {
    let u = 0;
    let v = 0;
    const arr = range({ from: 0, to: 256 });

    for (let i = 0; i < arr.length; i++) {
      u = (u + arr[i] + key.charCodeAt(i % key.length)) % 256;
      v = arr[i];
      arr[i] = arr[u];
      arr[u] = v;
    }
    u = 0;
    let j = 0;

    let res = '';
    for (let i = 0; i < query.length; i++) {
      j = (j + 1) % 256;
      u = (u + arr[j]) % 256;
      v = arr[j];
      arr[j] = arr[u];
      arr[u] = v;
      res += String.fromCharCode(query.charCodeAt(i) ^ arr[(arr[j] + arr[u]) % 256]);
    }
    return res;
  }

  private encrypt(query: string, key: string): string {
    query.split('').forEach(char => {
      if (char.charCodeAt(0) > 255) throw new Error('Invalid character.');
    });

    let res = '';
    for (let i = 0; i < query.length; i += 3) {
      const arr: number[] = Array(4).fill(-1);

      arr[0] = query.charCodeAt(i) >> 2;
      arr[1] = (3 & query.charCodeAt(i)) << 4;

      if (query.length > i + 1) {
        arr[1] = arr[1] | (query.charCodeAt(i + 1) >> 4);
        arr[2] = (15 & query.charCodeAt(i + 1)) << 2;
      }
      if (query.length > i + 2) {
        arr[2] = arr[2] | (query.charCodeAt(i + 2) >> 6);
        arr[3] = 63 & query.charCodeAt(i + 2);
      }

      for (const j of arr) {
        if (j === -1) res += '=';
        else if (range({ from: 0, to: 64 }).includes(j)) res += key.charAt(j);
      }
    }
    return res;
  }

  private decrypt(query: string): string {
    const key = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const p = query?.replace(/[\t\n\f\r]/g, '')?.length % 4 === 0 ? query?.replace(/[==|?|$]/g, '') : query;

    if (p?.length % 4 === 1 || /[^+/0-9A-Za-z]/gm.test(p)) throw new Error('Invalid character.');

    let res = '';
    let i = 0;
    let e = 0;
    let n = 0;
    for (let j = 0; j < p?.length; j++) {
      e = e << 6;
      i = key.indexOf(p[j]);
      e = e | i;
      n += 6;

      if (n === 24) {
        res += String.fromCharCode((16711680 & e) >> 16);
        res += String.fromCharCode((65280 & e) >> 8);
        res += String.fromCharCode(255 & e);
        n = 0;
        e = 0;
      }
    }

    if (12 === n) return res + String.fromCharCode(e >> 4);
    else if (18 === n) {
      e = e >> 2;
      res += String.fromCharCode((65280 & e) >> 8);
      res += String.fromCharCode(255 & e);
    }
    return res;
  }
}

// (async () => {
//   const nineanime = await NineAnime.create();
//   const anime = await nineanime.search('overlord');
//   console.log(anime);
//   const info = await nineanime.fetchAnimeInfo(anime.results[0].id);
//   const episode = await nineanime.fetchEpisodeSources(info.episodes![0].id);
//   console.log(episode);
// })();

export default NineAnime;
