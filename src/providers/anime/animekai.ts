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
  MediaStatus,
  Intro,
} from '../../models';

import { MegaUp } from '../../extractors';

const { GenerateToken, DecodeIframeData } = new MegaUp();

/**
 * Parses an AJAX response that may come as:
 * 1. A parsed JSON object (axios auto-parsed)
 * 2. A raw JSON string
 * 3. An HTML-wrapped JSON string (e.g. <html>...<pre>{JSON}</pre>...</html>)
 *
 * @param data The raw response data from axios
 * @returns The parsed JSON object, or undefined if parsing failed
 */
function parseAjaxResponse(data: any): any {
  if (typeof data === 'object') return data;

  if (typeof data === 'string') {
    let jsonStr = data;

    if (jsonStr.trimStart().startsWith('<')) {
      const $ = load(jsonStr);
      jsonStr = $('pre').text();
    }

    try {
      return JSON.parse(jsonStr);
    } catch {
      return undefined;
    }
  }

  return undefined;
}

/**
 * Checks if the response HTML is a Cloudflare access denied / challenge page.
 * Throws a descriptive error so callers know the issue is Cloudflare, not a bug.
 */
function assertNotCloudflareBlock(html: string, context: string): void {
  if (
    typeof html === 'string' &&
    (html.includes('Access denied') || html.includes('Just a moment')) &&
    html.includes('Cloudflare')
  ) {
    throw new Error(
      `[${context}] Cloudflare blocked the request. The response is a challenge/block page, not the actual site content.`
    );
  }
}

class AnimeKai extends AnimeParser {
  override readonly name = 'AnimeKai';
  protected override baseUrl = 'https://anikai.to';
  protected override logo =
    'https://anikai.to/assets/uploads/37585a3ffa8ec292ee9e2255f3f63b48ceca17ef2a0386.png';
  protected override classPath = 'ANIME.AnimeKai';

  /**
   * Search for anime
   * @param query Search query string
   * @param page Page number (default: 1)
   * @returns Promise<ISearch<IAnimeResult>>
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
      if (typeof data === 'string') assertNotCloudflareBlock(data, 'fetchGenres');
      const $ = load(typeof data === 'string' ? data : '');

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

      const parsed = parseAjaxResponse(data);
      let htmlContent = parsed?.result || data;
      if (typeof htmlContent === 'object' && htmlContent.html) {
        htmlContent = htmlContent.html;
      }

      const $ = load(typeof htmlContent === 'string' ? htmlContent : '');

      $('ul li').each((i, ele) => {
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
      if (typeof data === 'string') assertNotCloudflareBlock(data, 'fetchSpotlight');
      const $ = load(typeof data === 'string' ? data : '');

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

      const parsed = parseAjaxResponse(data);
      const $ = load(parsed?.result?.html ?? '');
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
   * Fetch anime information
   * @param id Anime ID/slug
   * @returns Promise<IAnimeInfo>
   */
  override fetchAnimeInfo = async (id: string): Promise<IAnimeInfo> => {
    // Strip episode params ($ep=...,$token=...) if present — only use the anime slug
    const animeSlug = id.split('$')[0];
    const info: IAnimeInfo = {
      id: animeSlug,
      title: '',
    };
    try {
      const { data } = await this.client.get(`${this.baseUrl}/watch/${animeSlug}`, {
        headers: this.Headers(),
      });
      if (typeof data === 'string') assertNotCloudflareBlock(data, 'fetchAnimeInfo');
      const $ = load(typeof data === 'string' ? data : '');

      info.title = $('.entity-scroll > .title').text();
      info.japaneseTitle = $('.entity-scroll > .title').attr('data-jp')?.trim();
      info.image = $('div.poster > div >img').attr('src');
      info.description = $('.entity-scroll > .desc').text().trim();
      // Movie, TV, OVA, ONA, Special, Music
      info.type = $('.entity-scroll > .info').children().last().text().toUpperCase() as MediaFormat;
      info.url = `${this.baseUrl}/watch/${animeSlug}`;

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
      $('section#related-anime .aitem-col a.aitem').each((_, el) => {
        const aTag = $(el);
        const infoBox = aTag.find('.info');

        const id = aTag.attr('href')?.replace('/watch/', '') ?? '';
        const title = aTag.find('.title').text().trim();
        const japaneseTitle = aTag.find('.title').attr('data-jp')?.trim();

        const sub = parseInt(infoBox.find('.sub').text()) || 0;
        const dub = parseInt(infoBox.find('.dub').text()) || 0;

        const bolds = infoBox.find('span > b');

        let episodes = 0;
        let type = '';
        let relationType = '';

        bolds.each((_, b) => {
          const text = $(b).text().trim();

          if ($(b).hasClass('text-muted')) {
            relationType = text;
          } else if (/^\d+$/.test(text)) {
            episodes = parseInt(text);
          } else {
            type = text; // TV, MOVIE, etc
          }
        });

        info.relations?.push({
          id,
          title,
          url: `${this.baseUrl}${aTag.attr('href')}`,
          image: aTag.attr('style')?.match(/background-image:\s*url\('(.+?)'\)/)?.[1],
          japaneseTitle,
          type: type.toUpperCase() as MediaFormat,
          sub,
          dub,
          relationType,
          episodes,
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
        .find('div')
        .each(function () {
          const text = $(this).text().trim();
          if (text.startsWith('Genres:')) {
            const genresText = text.replace('Genres:', '').trim();
            const genres = genresText.split(',').map(g => g.trim());
            info.genres = genres;
          }
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

      info.duration = $('.entity-scroll > .detail').find("div:contains('Duration') > span").text().trim();

      $('.entity-scroll > .detail div')
        .filter((_, el) => $(el).text().includes('Links:'))
        .find('a')
        .each((_, el) => {
          const href = $(el).attr('href') ?? '';

          if (href.includes('myanimelist')) info.malId = href.match(/anime\/(\d+)/)?.[1] ?? '';

          if (href.includes('anilist')) info.anilistId = href.match(/anime\/(\d+)/)?.[1] ?? '';
        });

      const ani_id = $('.rate-box#anime-rating').attr('data-id');

      const episodesAjax = await this.client.get(
        `${this.baseUrl}/ajax/episodes/list?ani_id=${ani_id}&_=${await GenerateToken(ani_id!)}`,
        {
          headers: {
            ...this.Headers(),
            'X-Requested-With': 'XMLHttpRequest',
            Referer: `${this.baseUrl}/watch/${animeSlug}`,
          },
        }
      );

      const episodesParsed = parseAjaxResponse(episodesAjax.data);
      const episodesResult: string | undefined = episodesParsed?.result;

      if (!episodesResult || typeof episodesResult !== 'string') {
        info.totalEpisodes = 0;
        info.episodes = [];
        return info;
      }

      const $$ = load(episodesResult);

      info.totalEpisodes = $$('div.eplist > ul > li').length;
      info.episodes = [];

      $$('div.eplist > ul > li > a').each((i, el) => {
        const episodeId = `${animeSlug}$ep=${$$(el).attr('num')}$token=${$$(el).attr('token')}`; //appending token to episode id, as it is required to fetch servers keeping the structure same as other providers
        const number = parseInt($$(el).attr('num')!);
        const title = $$(el).children('span').text().trim();
        const url = `${this.baseUrl}/watch/${animeSlug}${$$(el).attr('href')}ep=${$$(el).attr('num')}`;
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
   * Fetch episode video sources
   * @param episodeId Episode ID
   * @param server Server type (default: VidCloud)
   * @param subOrDub Sub or dub preference (default: SUB)
   * @returns Promise<ISource>
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
      if (typeof data === 'string') assertNotCloudflareBlock(data, 'scrapeCardPage');
      const $ = load(typeof data === 'string' ? data : '');

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
   * Fetch available episode servers
   * @param episodeId Episode ID
   * @param subOrDub Sub or dub preference (default: SUB)
   * @returns Promise<IEpisodeServer[]>
   */
  override fetchEpisodeServers = async (
    episodeId: string,
    subOrDub: SubOrSub = SubOrSub.SUB
  ): Promise<IEpisodeServer[]> => {
    if (!episodeId.startsWith(this.baseUrl + '/ajax')) {
      const token = episodeId.split('$token=')[1];
      episodeId = `${this.baseUrl}/ajax/links/list?token=${token}&_=${await GenerateToken(token)}`;
    }

    try {
      const { data } = await this.client.get(episodeId, { headers: this.Headers() });

      const parsed = parseAjaxResponse(data);
      const resultHtml: string | undefined = parsed?.result;

      if (!resultHtml || typeof resultHtml !== 'string') {
        return [];
      }

      const $ = load(resultHtml);
      const servers: IEpisodeServer[] = [];
      const subOrDubStr = subOrDub === SubOrSub.SUB ? 'softsub' : 'dub';
      const serverItems = $(`.server-items.lang-group[data-id="${subOrDubStr}"] .server`);

      await Promise.all(
        serverItems.map(async (i, server) => {
          const id = $(server).attr('data-lid');

          const linkResp = await this.client.get(
            `${this.baseUrl}/ajax/links/view?id=${id}&_=${await GenerateToken(id!)}`,
            { headers: this.Headers() }
          );

          const linkParsed = parseAjaxResponse(linkResp.data);
          const decodedIframeData = await DecodeIframeData(linkParsed?.result);

          servers.push({
            name: `MegaUp ${$(server).text().trim()}`.toLowerCase()!, //megaup is the only server for now
            url: decodedIframeData.url,
            intro: {
              start: decodedIframeData?.skip.intro[0],
              end: decodedIframeData?.skip.intro[1],
            },
            outro: {
              start: decodedIframeData?.skip.outro[0],
              end: decodedIframeData?.skip.outro[1],
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
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
      Connection: 'keep-alive',
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
      Cookie: '__p_mov=1; usertype=guest; session=vLrU4aKItp0QltI2asH83yugyWDsSSQtyl9sxWKO',
    };
  }
}

export default AnimeKai;
