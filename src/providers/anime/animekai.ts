import { AxiosAdapter } from 'axios';
import { CheerioAPI, load } from 'cheerio';

import {
  AnimeParser,
  ISearch,
  IAnimeInfo,
  IAnimeResult,
  ISource,
  IEpisodeServer,
  StreamingServers,
  MediaFormat,
  SubOrSub,
  IAnimeEpisode,
  MediaStatus,
  Intro,
} from '../../models';

import { MegaUp } from '../../utils';

const { GenerateToken, DecodeIframeData } = new MegaUp();

class AnimeKai extends AnimeParser {
  override readonly name = 'AnimeKai';
  protected override baseUrl = 'https://animekai.to';
  protected override logo =
    'https://animekai.to/assets/uploads/37585a39fe8c8d8fafaa2c7bfbf5374ecac859ea6a0288a6da2c61f5.png';
  protected override classPath = 'ANIME.AnimeKai';

  constructor(customBaseURL?: string) {
    super(...arguments);
    if (customBaseURL) {
      if (customBaseURL.startsWith('http://') || customBaseURL.startsWith('https://')) {
        this.baseUrl = customBaseURL;
      } else {
        this.baseUrl = `http://${customBaseURL}`;
      }
    } else {
      this.baseUrl = this.baseUrl;
    }
  }

  /**
   * @param query Search query
   * @param page Page number (optional)
   */
  override search(query: string, page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(
      `${this.baseUrl}/browser?keyword=${query.replace(/[\W_]+/g, '+')}&page=${page}`
    );
  }

  /**
   * @param page number
   */
  fetchLatestCompleted(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/completed?page=${page}`);
  }

  /**
   * @param page number
   */
  fetchRecentlyAdded(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/recent?page=${page}`);
  }

  /**
   * @param page number
   */
  fetchRecentlyUpdated(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/updates?page=${page}`);
  }

  /**
   * @param page number
   */
  fetchNewReleases(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/new-releases?page=${page}`);
  }

  /**
   * @param page number
   */
  fetchMovie(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/movie?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchTV(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/tv?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchOVA(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/ova?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchONA(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/ona?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchSpecial(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/special?page=${page}`);
  }

  async fetchGenres(): Promise<string[]> {
    try {
      const res: string[] = [];
      const { data } = await this.client.get(`${this.baseUrl}/home`, { headers: this.Headers() });
      const $ = load(data);

      const sideBar = $('#menu');
      sideBar.find('ul.c4 li a').each((i, ele) => {
        const genres = $(ele);
        res.push(genres.text().toLowerCase());
      });

      return res;
    } catch (err) {
      throw new Error('Something went wrong. Please try again later.');
    }
  }
  /**
   * @param page number
   */
  genreSearch(genre: string, page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (genre == '') {
      throw new Error('genre is empty');
    }
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/genres/${genre}?page=${page}`);
  }

  /**
   * Fetches the schedule for a given date.
   * @param date The date in format 'YYYY-MM-DD'. Defaults to the current date.
   * @returns A promise that resolves to an object containing the search results.
   */
  async fetchSchedule(date: string = new Date().toISOString().split('T')[0]): Promise<ISearch<IAnimeResult>> {
    try {
      const res: ISearch<IAnimeResult> = {
        results: [],
      };
      const { data } = await this.client.get(
        `${this.baseUrl}/ajax/schedule/items?tz=5.5&time=${Math.floor(
          new Date(`${date}T00:00:00Z`).getTime() / 1000
        )}`,
        { headers: this.Headers() }
      );
      const $ = load(data.result);

      $('ul.collapsed li').each((i, ele) => {
        const card = $(ele);
        const titleElement = card.find('span.title');
        const episodeText = card.find('span').last().text().trim();

        res.results.push({
          id: card.find('a').attr('href')?.split('/')[2]!, // Extract anime ID
          title: titleElement.text().trim(),
          japaneseTitle: titleElement.attr('data-jp'),
          airingTime: card.find('span.time').text().trim(),
          airingEpisode: episodeText.replace('EP ', ''), // Extract episode number
        });
      });

      return res;
    } catch (err) {
      throw new Error('Something went wrong. Please try again later.');
    }
  }

  async fetchSpotlight(): Promise<ISearch<IAnimeResult>> {
    try {
      const res: ISearch<IAnimeResult> = { results: [] };
      const { data } = await this.client.get(`${this.baseUrl}/home`, { headers: this.Headers() });
      const $ = load(data);

      $('div.swiper-wrapper > div.swiper-slide').each((i, el) => {
        const card = $(el);
        const titleElement = card.find('div.detail > p.title');
        const id = card.find('div.swiper-ctrl > a.btn').attr('href')?.replace('/watch/', '')!;
        const img = card.attr('style');
        res.results.push({
          id: id!,
          title: titleElement.text(),
          japaneseTitle: titleElement.attr('data-jp'),
          banner: img?.match(/background-image:\s*url\(["']?(.+?)["']?\)/)?.[1] || null,
          url: `${this.baseUrl}/watch/${id}`,
          type: card.find('div.detail > div.info').children().eq(-2).text().trim() as MediaFormat,
          genres: card
            .find('div.detail > div.info')
            .children()
            .last()
            .text()
            .trim()
            .split(',')
            .map(genre => genre.trim()),
          releaseDate: card
            .find('div.detail > div.mics >div:contains("Release")')
            .children('span')
            .text()
            .trim(),
          quality: card.find('div.detail > div.mics >div:contains("Quality")').children('span').text().trim(),
          sub: parseInt(card.find('div.detail > div.info > span.sub').text().trim()) || 0,
          dub: parseInt(card.find('div.detail > div.info > span.dub').text().trim()) || 0,
          description: card.find('div.detail > p.desc').text().trim(),
        });
      });

      return res;
    } catch (error) {
      throw new Error('Something went wrong. Please try again later.');
    }
  }

  async fetchSearchSuggestions(query: string): Promise<ISearch<IAnimeResult>> {
    try {
      const { data } = await this.client.get(
        `${this.baseUrl}/ajax/anime/search?keyword=${query.replace(/[\W_]+/g, '+')}`,
        { headers: this.Headers() }
      );
      const $ = load(data.result.html);
      const res: ISearch<IAnimeResult> = {
        results: [],
      };

      $('a.aitem').each((i, el) => {
        const card = $(el);
        const image = card.find('.poster img').attr('src');
        const titleElement = card.find('.title');
        const title = titleElement.text().trim();
        const japaneseTitle = titleElement.attr('data-jp');
        const id = card.attr('href')?.split('/')[2];
        const year = card.find('.info').children().eq(-2).text().trim();
        const type = card.find('.info').children().eq(-3).text().trim();
        const sub = parseInt(card.find('.info span.sub')?.text()) || 0;
        const dub = parseInt(card.find('.info span.dub')?.text()) || 0;
        const episodes =
          parseInt(
            card.find('.info').children().eq(-4).text().trim() ?? card.find('.info span.sub')?.text()
          ) || 0;

        res.results.push({
          id: id!,
          title: title,
          url: `${this.baseUrl}/watch/${id}`,
          image: image!,
          japaneseTitle: japaneseTitle || null,
          type: type as MediaFormat,
          year: year,
          sub: sub,
          dub: dub,
          episodes: episodes,
        });
      });

      return res;
    } catch (error) {
      throw new Error('Something went wrong. Please try again later.');
    }
  }

  /**
   * @param id Anime id
   */
  override fetchAnimeInfo = async (id: string): Promise<IAnimeInfo> => {
    const info: IAnimeInfo = {
      id: id,
      title: '',
    };
    try {
      const { data } = await this.client.get(`${this.baseUrl}/watch/${id}`, { headers: this.Headers() });
      const $ = load(data);

      info.title = $('.entity-scroll > .title').text();
      info.japaneseTitle = $('.entity-scroll > .title').attr('data-jp')?.trim();
      info.image = $('div.poster > div >img').attr('src');
      info.description = $('.entity-scroll > .desc').text().trim();
      // Movie, TV, OVA, ONA, Special, Music
      info.type = $('.entity-scroll > .info').children().last().text().toUpperCase() as MediaFormat;
      info.url = `${this.baseUrl}/watch/${id}`;
      info.recommendations = [];
      $('section.sidebar-section:not(#related-anime) .aitem-col .aitem').each((i, ele) => {
        const aTag = $(ele);
        const id = aTag.attr('href')?.replace('/watch/', '');
        info.recommendations?.push({
          id: id!,
          title: aTag.find('.title').text().trim(),
          url: `${this.baseUrl}${aTag.attr('href')}`,
          image: aTag.attr('style')?.match(/background-image:\s*url\('(.+?)'\)/)?.[1],
          japaneseTitle: aTag.find('.title').attr('data-jp')?.trim(),
          type: aTag.find('.info').children().last().text().trim() as MediaFormat,
          sub: parseInt(aTag.find('.info span.sub')?.text()) || 0,
          dub: parseInt(aTag.find('.info span.dub')?.text()) || 0,
          episodes:
            parseInt(
              aTag.find('.info').children().eq(-2).text().trim() ?? aTag.find('.info span.sub')?.text()
            ) || 0,
        });
      });
      info.relations = [];
      $('section#related-anime .tab-body .aitem-col').each((i, ele) => {
        const card = $(ele);
        const aTag = card.find('a.aitem');
        const id = aTag.attr('href')?.replace('/watch/', '');
        info.relations?.push({
          id: id!,
          title: aTag.find('.title').text().trim(),
          url: `${this.baseUrl}${aTag.attr('href')}`,
          image: aTag.attr('style')?.match(/background-image:\s*url\('(.+?)'\)/)?.[1],
          japaneseTitle: aTag.find('.title').attr('data-jp')?.trim(),
          type: card.find('.info').children().eq(-2).text().trim() as MediaFormat,
          sub: parseInt(card.find('.info span.sub')?.text()) || 0,
          dub: parseInt(card.find('.info span.dub')?.text()) || 0,
          relationType: card.find('.info').children().last().text().trim(),
          episodes:
            parseInt(
              card.find('.info').children().eq(-3).text().trim() ?? card.find('.info span.sub')?.text()
            ) || 0,
        });
      });
      const hasSub: boolean = $('.entity-scroll > .info > span.sub').length > 0;
      const hasDub: boolean = $('.entity-scroll > .info > span.dub').length > 0;

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

      info.genres = [];
      $('.entity-scroll > .detail')
        .find('div:contains("Genres")')
        .each(function () {
          const genre = $(this).text().trim();
          if (genre != undefined) info.genres?.push(genre);
        });

      switch ($('.entity-scroll > .detail').find("div:contains('Status') > span").text().trim()) {
        case 'Completed':
          info.status = MediaStatus.COMPLETED;
          break;
        case 'Releasing':
          info.status = MediaStatus.ONGOING;
          break;
        case 'Not yet aired':
          info.status = MediaStatus.NOT_YET_AIRED;
          break;
        default:
          info.status = MediaStatus.UNKNOWN;
          break;
      }

      info.season = $('.entity-scroll > .detail').find("div:contains('Premiered') > span").text().trim();

      const ani_id = $('.rate-box#anime-rating').attr('data-id');
      const episodesAjax = await this.client.get(
        `${this.baseUrl}/ajax/episodes/list?ani_id=${ani_id}&_=${GenerateToken(ani_id!)}`,
        {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            Referer: `${this.baseUrl}/watch/${id}`,
            ...this.Headers(),
          },
        }
      );
      const $$ = load(episodesAjax.data.result);

      info.totalEpisodes = $$('div.eplist > ul > li').length;
      info.episodes = [];

      $$('div.eplist > ul > li > a').each((i, el) => {
        const episodeId = `${info.id}$ep=${$$(el).attr('num')}$token=${$$(el).attr('token')}`; //appending token to episode id, as it is required to fetch servers keeping the structure same as other providers
        const number = parseInt($$(el).attr('num')!);
        const title = $$(el).children('span').text().trim();
        const url = `${this.baseUrl}/watch/${info.id}${$$(el).attr('href')}ep=${$$(el).attr('num')}`;
        const isFiller = $$(el).hasClass('filler');
        const isSubbed = number <= (parseInt($('.entity-scroll > .info > span.sub').text().trim()) || 0);
        const isDubbed = number <= (parseInt($('.entity-scroll > .info > span.dub').text().trim()) || 0);

        info.episodes?.push({
          id: episodeId,
          number: number,
          title: title,
          isFiller: isFiller,
          isSubbed: isSubbed,
          isDubbed: isDubbed,
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
   * @param server server type (default `VidCloud`) (optional)
   * @param subOrDub sub or dub (default `SubOrSub.SUB`) (optional)
   */
  override fetchEpisodeSources = async (
    episodeId: string,
    server: StreamingServers = StreamingServers.MegaUp,
    subOrDub: SubOrSub = SubOrSub.SUB
  ): Promise<ISource> => {
    if (episodeId.startsWith('http')) {
      const serverUrl = new URL(episodeId);
      switch (server) {
        case StreamingServers.MegaUp:
          return {
            headers: { Referer: serverUrl.href },
            ...(await new MegaUp(this.proxyConfig, this.adapter).extract(serverUrl)),
            download: serverUrl.href.replace(/\/e\//, '/download/'),
          };
        default:
          return {
            headers: { Referer: serverUrl.href },
            ...(await new MegaUp(this.proxyConfig, this.adapter).extract(serverUrl)),
            download: serverUrl.href.replace(/\/e\//, '/download/'),
          };
      }
    }

    try {
      const servers = await this.fetchEpisodeServers(episodeId, subOrDub);
      const i = servers.findIndex(s => s.name.toLowerCase().includes(server)); //for now only megaup is available, hence directly using it

      if (i === -1) {
        throw new Error(`Server ${server} not found`);
      }

      const serverUrl: URL = new URL(servers[i].url);
      const sources = await this.fetchEpisodeSources(serverUrl.href, server, subOrDub);
      sources.intro = servers[i]?.intro as Intro;
      sources.outro = servers[i]?.outro as Intro;
      return sources;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   * @param url string
   */
  private scrapeCardPage = async (url: string): Promise<ISearch<IAnimeResult>> => {
    try {
      const res: ISearch<IAnimeResult> = {
        currentPage: 0,
        hasNextPage: false,
        totalPages: 0,
        results: [],
      };
      const { data } = await this.client.get(url, {
        headers: this.Headers(),
      });
      const $ = load(data);

      const pagination = $('ul.pagination');
      res.currentPage = parseInt(pagination.find('.page-item.active span.page-link').text().trim()) || 0;
      const nextPage = pagination
        .find('.page-item.active')
        .next()
        .find('a.page-link')
        .attr('href')
        ?.split('page=')[1];
      if (nextPage != undefined && nextPage != '') {
        res.hasNextPage = true;
      }
      const totalPages = pagination.find('.page-item:last-child a.page-link').attr('href')?.split('page=')[1];
      if (totalPages === undefined || totalPages === '') {
        res.totalPages = res.currentPage;
      } else {
        res.totalPages = parseInt(totalPages) || 0;
      }
      res.results = await this.scrapeCard($);
      if (res.results.length === 0) {
        res.currentPage = 0;
        res.hasNextPage = false;
        res.totalPages = 0;
      }
      return res;
    } catch (err) {
      throw new Error('Something went wrong. Please try again later.');
    }
  };

  /**
   * @param $ cheerio instance
   */
  private scrapeCard = async ($: CheerioAPI): Promise<IAnimeResult[]> => {
    try {
      const results: IAnimeResult[] = [];

      $('.aitem').each((i, ele) => {
        const card = $(ele);
        const atag = card.find('div.inner > a');
        const id = atag.attr('href')?.replace('/watch/', '');
        const type = card.find('.info').children().last()?.text().trim();
        results.push({
          id: id!,
          title: atag.text().trim(),
          url: `${this.baseUrl}${atag.attr('href')}`,
          image: card.find('img')?.attr('data-src') ?? card.find('img')?.attr('src'),
          //   duration: card.find('.fdi-duration')?.text(),
          japaneseTitle: card.find('a.title')?.attr('data-jp')?.trim(),
          type: type as MediaFormat,
          //   nsfw: card.find('.tick-rate')?.text() === '18+' ? true : false,
          sub: parseInt(card.find('.info span.sub')?.text()) || 0,
          dub: parseInt(card.find('.info span.dub')?.text()) || 0,
          episodes:
            parseInt(
              card.find('.info').children().eq(-2).text().trim() ?? card.find('.info span.sub')?.text()
            ) || 0, //if no direct episode count, then just use sub count
        });
      });
      return results;
    } catch (err) {
      throw new Error('Something went wrong. Please try again later.');
    }
  };
  /**
   * @param episodeId Episode id
   * @param subOrDub sub or dub (default `sub`) (optional)
   */
  override fetchEpisodeServers = async (
    episodeId: string,
    subOrDub: SubOrSub = SubOrSub.SUB
  ): Promise<IEpisodeServer[]> => {
    if (!episodeId.startsWith(this.baseUrl + '/ajax'))
      episodeId = `${this.baseUrl}/ajax/links/list?token=${episodeId.split('$token=')[1]}&_=${GenerateToken(
        episodeId.split('$token=')[1]
      )}`;
    try {
      const { data } = await this.client.get(episodeId, { headers: this.Headers() });
      const $ = load(data.result);
      const servers: IEpisodeServer[] = [];
      const serverItems = $(`.server-items.lang-group[data-id="${subOrDub}"] .server`);
      await Promise.all(
        serverItems.map(async (i, server) => {
          const id = $(server).attr('data-lid');
          const { data } = await this.client.get(
            `${this.baseUrl}/ajax/links/view?id=${id}&_=${GenerateToken(id!)}`,
            { headers: this.Headers() }
          );
          const decodedData = JSON.parse(DecodeIframeData(data.result));
          servers.push({
            name: `MegaUp ${$(server).text().trim()}`.toLowerCase()!, //megaup is the only server for now
            url: decodedData.url,
            intro: {
              start: decodedData?.skip.intro[0],
              end: decodedData?.skip.intro[1],
            },
            outro: {
              start: decodedData?.skip.outro[0],
              end: decodedData?.skip.outro[1],
            },
          });
        })
      );
      return servers;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  private Headers(): Record<string, string> {
    return {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0',
      Accept: 'text/html, */*; q=0.01',
      'Accept-Language': 'en-US,en;q=0.5',
      'Sec-GPC': '1',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      Priority: 'u=0',
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache',
      Referer: `${this.baseUrl}/`,
      Cookie:
        'usertype=guest; session=hxYne0BNXguMc8zK1FHqQKXPmmoANzBBOuNPM64a; cf_clearance=WfGWV1bKGAaNySbh.yzCyuobBOtjg0ncfPwMhtsvsrs-1737611098-1.2.1.1-zWHcaytuokjFTKbCAxnSPDc_BWAeubpf9TAAVfuJ2vZuyYXByqZBXAZDl_VILwkO5NOLck8N0C4uQr4yGLbXRcZ_7jfWUvfPGayTADQLuh.SH.7bvhC7DmxrMGZ8SW.hGKEQzRJf8N7h6ZZ27GMyqOfz1zfrOiu9W30DhEtW2N7FAXUPrdolyKjCsP1AK3DqsDtYOiiPNLnu47l.zxK80XogfBRQkiGecCBaeDOJHenjn._Zgykkr.F_2bj2C3AS3A5mCpZSlWK5lqhV6jQSQLF9wKWitHye39V.6NoE3RE',
    };
  }
}

//(async () => {
//  const animekai = new AnimeKai();
//  const anime = await animekai.search('dandadan');
//  const info = await animekai.fetchAnimeInfo('solo-leveling-season-2-arise-from-the-shadow-x7rq');
//  console.log(info.episodes);
//  const sources = await animekai.fetchEpisodeSources(info?.episodes![0].id!);
//  console.log(sources);
//})();

export default AnimeKai;
