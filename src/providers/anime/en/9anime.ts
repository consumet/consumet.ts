import { load } from 'cheerio';
import axios from 'axios';
import { encode } from 'ascii-url-encoder';

import {
  AnimeParser,
  IAnimeSearch,
  IAnimeInfo,
  IAnimeEpisode,
  AnimeStatus,
  SubOrSub,
} from '../../../models';

/**
 * @deprecated
 * working on it...
 */
class NineAnime extends AnimeParser {
  override readonly name = '9Anime';
  protected override baseUrl = 'https://9anime.to';

  protected override logo =
    'https://d1nxzqpcg2bym0.cloudfront.net/google_play/com.my.nineanime/87b2fe48-9c36-11eb-8292-21241b1c199b/128x128';
  protected override classPath = 'ANIME.en.NineAnime';

  override isWorking = false;

  private readonly base64 = 'c/aUAorINHBLxWTy3uRiPt8J+vjsOheFG1E0q2X9CYwDZlnmd4Kb5M6gSVzfk7pQ';

  override async search(query: string, page: number = 1): Promise<IAnimeSearch> {
    const searchResult: IAnimeSearch = { currentPage: page, hasNextPage: false, results: [] };

    // MAKE VRF
    try {
      console.log(`query: ${query}, vrf: ${encode(this.getVrf(query))}`);
      const res = await axios.get(
        `${this.baseUrl}/search?keyword=${query}&vrf=iH2V6sFT0eKhzLoOKqxQ%2B&page=${page}`
      );

      const $ = load(res.data);

      searchResult.hasNextPage =
        $(`div.anime-pagination > div.ap_-nav`).children().length > 0
          ? $('div.anime-pagination > div > div.ap__-btn.ap__-btn-next > a')
            ? $('div.anime-pagination > div > div.ap__-btn.ap__-btn-next > a').hasClass('disabled')
              ? false
              : true
            : false
          : false;

      $('.anime-list > li').each((i, el) => {
        const taglist = $(el)
          .find('a:nth-child(1) > div:nth-child(3) > span')
          .map((i, el) => $(el).text())
          .toArray();

        if (!taglist.includes('dub')) taglist.unshift('sub');

        searchResult.results.push({
          id: $(el).find('a:nth-child(1)').attr('href')?.split('/')[2]!,
          title: $(el).find('a:nth-child(2)').text()!,
          url: `${this.baseUrl}${$(el).find('a:nth-child(2)').attr('href')}`,
          image: $(el).find('a:nth-child(1) > img').attr('src'),
          subOrDub: taglist.includes('sub') ? SubOrSub.SUB : SubOrSub.DUB,
          taglist: taglist,
          status: $(el).find('a:nth-child(1) > div:nth-child(2)').text().split('Ep')[1]?.trim(),
        });
      });

      return searchResult;
    } catch (err) {
      console.error(err);
      throw new Error((err as Error).message);
    }
  }

  override async fetchAnimeInfo(animeUrl: string): Promise<IAnimeInfo> {
    if (!animeUrl.startsWith(this.baseUrl)) animeUrl = `${this.baseUrl}/watch/${animeUrl}`;

    const animeInfo: IAnimeInfo = {
      id: '',
      title: '',
      url: animeUrl,
      genres: [],
      episodes: [],
    };

    try {
      const res = await axios.get(animeUrl);

      const $ = load(res.data);

      animeInfo.id = new URL(animeUrl).pathname.split('/')[2];
      animeInfo.title = $('h2.film-name').text();
      animeInfo.japaneseTitle = $('h2.film-name').attr('data-jname');
      animeInfo.genres = Array.from(
        $('.col1 > div:nth-child(5) > div:nth-child(2) > a').map((i, el) => $(el).text())
      );
      animeInfo.image = $('.anime-poster > div:nth-child(1) > img.film-poster-img').attr('src');
      animeInfo.description = $('.film-description').text()?.trim();
      animeInfo.type = $('.col1 > div:nth-child(1) > div:nth-child(2) > a:nth-child(1)').text();
      animeInfo.studios = Array.from(
        $('.col1 > div:nth-child(2) > div:nth-child(2)').map((i, el) => {
          return {
            id: $(el).find('a').attr('href')?.split('/')[2]!,
            title: $(el).text()?.trim()!,
          };
        })
      );
      animeInfo.releaseDate = $('.col1 > div:nth-child(3) > div:nth-child(2) > span:nth-child(1)')
        .text()
        .trim()
        .split('to')[0]
        ?.trim();

      animeInfo.status = AnimeStatus.UNKNOWN;
      switch ($('.col1 > div:nth-child(4) > div:nth-child(2) > span:nth-child(1)').text()?.trim()) {
        case 'Airing':
          animeInfo.status = AnimeStatus.ONGOING;
          break;
        case 'Completed':
          animeInfo.status = AnimeStatus.COMPLETED;
          break;
        case 'Cancelled':
          animeInfo.status = AnimeStatus.CANCELLED;
          break;
        case 'Unknown':
          animeInfo.status = AnimeStatus.UNKNOWN;
          break;
        default:
          animeInfo.status = AnimeStatus.UNKNOWN;
          break;
      }

      animeInfo.score = parseFloat(
        $('.col2 > div:nth-child(1) > div:nth-child(2) > span:nth-child(1)').text()
      );
      animeInfo.premiered = $(
        '.col2 > div:nth-child(2) > div:nth-child(2) > span:nth-child(1)'
      ).text();
      animeInfo.duration = $(
        '.col2 > div:nth-child(3) > div:nth-child(2) > span:nth-child(1)'
      ).text();
      animeInfo.quality = $(
        '.col2 > div:nth-child(4) > div:nth-child(2) > span:nth-child(1)'
      ).text();
      animeInfo.views = parseInt(
        $('.col2 > div:nth-child(5) > div:nth-child(2) > span:nth-child(1)')
          .text()
          .split(',')
          .join('')
      );
      animeInfo.otherNames = $('.alias')
        .text()
        .split(',')
        .map((name) => name?.trim());
      animeInfo.totalEpisodes = parseInt($('li.ep-page-item').last().text().split('-')[1]?.trim());
      animeInfo.episodes?.push(
        ...Array.from(
          $('section.block_area:nth-child(3) > div:nth-child(2) > div.episodes-ul').map(
            (i, el): IAnimeEpisode[] => {
              return $(el)
                .find('a')
                .map((i, el): IAnimeEpisode => {
                  return {
                    id: $(el).attr('data-id')?.toString()!,
                    number: parseInt($(el).attr('data-number')?.toString()!),
                    title: $(el).attr('title')?.toString()!,
                    url: `${this.baseUrl}${$(el).attr('href')}`,
                  };
                })
                .toArray();
            }
          )
        )
      );

      return animeInfo;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  override async fetchEpisodeSources(episodeLink: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  override async fetchEpisodeServers(episodeLink: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  private getVrf(query: string): string {
    const vrf = this.cypher(encode(query) + '0000000')
      .substring(0, 6)
      .substring(0, 4)
      .split('')
      .reverse()
      .join('');
    return vrf + this.cypher(this.cypherK(vrf, encode(query))).replace(/=/g, '');
  }
  private cypher(query: string): string {
    if (query.length >= 256) throw new Error('Query too long');
    let res = '';
    for (let i = 0; i < query.length; i += 3) {
      const arr: number[] = Array(4).fill(-1);
      arr[0] = query.charCodeAt(i) >> 2;
      arr[1] = (query.charCodeAt(i) & 3) << 4;

      if (i + 1 < query.length) {
        arr[1] |= query.charCodeAt(i + 1) >> 4;
        arr[2] = (query.charCodeAt(i + 1) & 15) << 2;
      }
      if (i + 2 < query.length) {
        arr[2] |= query.charCodeAt(i + 2) >> 6;
        arr[3] = query.charCodeAt(i + 2) & 63;
      }

      for (let j = 0; j < 4; j++) {
        if (arr[j] === -1) res += '=';
        else res += this.base64.charAt(arr[j]);
      }
    }
    return res;
  }

  // todo
  private cypherV2(query: string): string {
    let res = '';

    for (const i of this.base64) {
      const s = (parseInt(i.padEnd(6, '0')) >>> 0).toString(2).padStart(6, '0');
      if (s.length < 6) {
        res += s;
      } else {
        res += (parseInt(i) >>> 0).toString(2);
      }
    }

    return res;
  }

  private cypherK(res: string, query: string): string {
    const arr = Array(256).fill(-1);
    let result = '';
    let i = 0;
    let t = 0;
    for (let j = 0; j < 256; j++) {
      i = (i + arr[j] + res.charCodeAt(j % res.length)) % 256;
      t = arr[j];
      arr[j] = arr[i];
      arr[i] = t;
    }

    i = 0;
    let a = 0;
    for (let k = 0; k < query.length; k++) {
      a = (a + a) % 256;
      i = (i + arr[a]) % 256;
      t = arr[a];
      arr[a] = arr[i];
      arr[i] = t;
      result += String.fromCharCode(query.charCodeAt(k) ^ arr[(arr[i] + arr[a]) % 256]);
    }

    return result;
  }
}

export default NineAnime;
