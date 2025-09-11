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
  WatchListType,
} from '../../models';

import { StreamSB, RapidCloud, MegaCloud, StreamTape } from '../../utils';
import { USER_AGENT } from '../../utils';

class Zoro extends AnimeParser {
  override readonly name = 'Zoro';
  protected override baseUrl = 'https://hianime.to';
  protected override logo =
    'https://is3-ssl.mzstatic.com/image/thumb/Purple112/v4/7e/91/00/7e9100ee-2b62-0942-4cdc-e9b93252ce1c/source/512x512bb.jpg';
  protected override classPath = 'ANIME.Zoro';

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
    return this.scrapeCardPage(`${this.baseUrl}/search?keyword=${decodeURIComponent(query)}&page=${page}`);
  }
  /**
   * Fetch advanced anime search results with various filters.
   *
   * @param page Page number (default: 1)
   * @param type One of (Optional): movie, tv, ova, ona, special, music
   * @param status One of (Optional): finished_airing, currently_airing, not_yet_aired
   * @param rated One of (Optional): g, pg, pg_13, r, r_plus, rx
   * @param score Number from 1 to 10 (Optional)
   * @param season One of (Optional): spring, summer, fall, winter
   * @param language One of (Optional): sub, dub, sub_dub
   * @param startDate Start date object { year, month, day } (Optional)
   * @param endDate End date object { year, month, day } (Optional)
   * @param sort One of (Optional): recently_added, recently_updated, score, name_az, released_date, most_watched
   * @param genres Array of genres (Optional): action, adventure, cars, comedy, dementia, demons, mystery, drama, ecchi, fantasy, game, historical, horror, kids, magic, martial_arts, mecha, music, parody, samurai, romance, school, sci_fi, shoujo, shoujo_ai, shounen, shounen_ai, space, sports, super_power, vampire, harem, military, slice_of_life, supernatural, police, psychological, thriller, seinen, isekai, josei
   * @returns A Promise resolving to the search results.
   */
  fetchAdvancedSearch(
    page: number = 1,
    type?: string,
    status?: string,
    rated?: string,
    score?: number,
    season?: string,
    language?: string,
    startDate?: { year: number; month: number; day: number },
    endDate?: { year: number; month: number; day: number },
    sort?: string,
    genres?: string[]
  ): Promise<ISearch<IAnimeResult>> {
    if (page <= 0) page = 1;

    const mappings: Record<string, Record<string, number>> = {
      type: { movie: 1, tv: 2, ova: 3, ona: 4, special: 5, music: 6 },
      status: { finished_airing: 1, currently_airing: 2, not_yet_aired: 3 },
      rated: { g: 1, pg: 2, pg_13: 3, r: 4, r_plus: 5, rx: 6 },
      season: { spring: 1, summer: 2, fall: 3, winter: 4 },
      language: { sub: 1, dub: 2, sub_dub: 3 },
      genre: {
        action: 1,
        adventure: 2,
        cars: 3,
        comedy: 4,
        dementia: 5,
        demons: 6,
        mystery: 7,
        drama: 8,
        ecchi: 9,
        fantasy: 10,
        game: 11,
        historical: 13,
        horror: 14,
        kids: 15,
        magic: 16,
        martial_arts: 17,
        mecha: 18,
        music: 19,
        parody: 20,
        samurai: 21,
        romance: 22,
        school: 23,
        sci_fi: 24,
        shoujo: 25,
        shoujo_ai: 26,
        shounen: 27,
        shounen_ai: 28,
        space: 29,
        sports: 30,
        super_power: 31,
        vampire: 32,
        harem: 35,
        military: 38,
        slice_of_life: 36,
        supernatural: 37,
        police: 39,
        psychological: 40,
        thriller: 41,
        seinen: 42,
        isekai: 44,
        josei: 43,
      },
    };

    const params = new URLSearchParams({ page: page.toString() });

    const addParam = (key: string, value?: string) => {
      if (value) params.append(key, (mappings[key]?.[value] || value).toString());
    };

    addParam('type', type);
    addParam('status', status);
    addParam('rated', rated);
    if (score) params.append('score', score.toString());
    addParam('season', season);
    addParam('language', language);

    if (startDate) {
      params.append('sy', startDate.year.toString());
      params.append('sm', startDate.month.toString());
      params.append('sd', startDate.day.toString());
    }

    if (endDate) {
      params.append('ey', endDate.year.toString());
      params.append('em', endDate.month.toString());
      params.append('ed', endDate.day.toString());
    }

    if (sort) params.append('sort', sort);

    if (genres?.length) {
      const genreIds = genres.map(genre => (mappings.genre[genre] || genre).toString()).join('%2C');
      params.append('genres', genreIds);
    }

    return this.scrapeCardPage(`${this.baseUrl}/filter?${params.toString()}`);
  }

  /**
   * @param page number
   */
  fetchTopAiring(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/top-airing?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchMostPopular(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/most-popular?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchMostFavorite(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/most-favorite?page=${page}`);
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
  fetchRecentlyUpdated(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/recently-updated?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchRecentlyAdded(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/recently-added?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchTopUpcoming(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/top-upcoming?page=${page}`);
  }
  /**
   * @param studio Studio id, e.g. "toei-animation"
   * @param page page number (optional) `default 1`
   */
  fetchStudio(studio: string, page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/producer/${studio}?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchSubbedAnime(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/subbed-anime?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchDubbedAnime(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/dubbed-anime?page=${page}`);
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
      const { data } = await this.client.get(`${this.baseUrl}/home`);
      const $ = load(data);

      const sideBar = $('#main-sidebar');
      sideBar.find('ul.sb-genre-list li a').each((i, ele) => {
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
    return this.scrapeCardPage(`${this.baseUrl}/genre/${genre}?page=${page}`);
  }

  /**
   * Fetches the schedule for a given date.
   * @param date The date in format 'YYYY-MM-DD'. Defaults to the current date.
   * @returns A promise that resolves to an object containing the search results.
   */
  async fetchSchedule(date: string = new Date().toISOString().slice(0, 10)): Promise<ISearch<IAnimeResult>> {
    try {
      const res: ISearch<IAnimeResult> = {
        results: [],
      };
      const {
        data: { html },
      } = await this.client.get(`${this.baseUrl}/ajax/schedule/list?tzOffset=360&date=${date}`);
      const $ = load(html);

      $('li').each((i, ele) => {
        const card = $(ele);
        const title = card.find('.film-name');

        const id = card.find('a.tsl-link').attr('href')?.split('/')[1].split('?')[0];
        const airingTime = card.find('div.time').text().replace('\n', '').trim();
        const airingEpisode = card.find('div.film-detail div.fd-play button').text().replace('\n', '').trim();
        res.results.push({
          id: id!,
          title: title.text(),
          japaneseTitle: title.attr('data-jname'),
          url: `${this.baseUrl}/${id}`,
          airingEpisode: airingEpisode,
          airingTime: airingTime,
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
      const { data } = await this.client.get(`${this.baseUrl}/home`);
      const $ = load(data);

      $('#slider div.swiper-wrapper div.swiper-slide').each((i, el) => {
        const card = $(el);
        const titleElement = card.find('div.desi-head-title');
        const id =
          card
            .find('div.desi-buttons .btn-secondary')
            .attr('href')
            ?.match(/\/([^/]+)$/)?.[1] || null;
        const img = card.find('img.film-poster-img');
        res.results.push({
          id: id!,
          title: titleElement.text(),
          japaneseTitle: titleElement.attr('data-jname'),
          banner: img.attr('data-src') || img.attr('src') || null,
          rank: parseInt(card.find('.desi-sub-text').text().match(/(\d+)/g)?.[0]!),
          url: `${this.baseUrl}/${id}`,
          type: card.find('div.sc-detail .scd-item:nth-child(1)').text().trim() as MediaFormat,
          duration: card.find('div.sc-detail > div:nth-child(2)').text().trim(),
          releaseDate: card.find('div.sc-detail > div:nth-child(3)').text().trim(),
          quality: card.find('div.sc-detail > div:nth-child(4)').text().trim(),
          sub: parseInt(card.find('div.sc-detail div.tick-sub').text().trim()) || 0,
          dub: parseInt(card.find('div.sc-detail div.tick-dub').text().trim()) || 0,
          episodes: parseInt(card.find('div.sc-detail div.tick-eps').text()) || 0,
          description: card.find('div.desi-description').text().trim(),
        });
      });

      return res;
    } catch (error) {
      throw new Error('Something went wrong. Please try again later.');
    }
  }

  async fetchSearchSuggestions(query: string): Promise<ISearch<IAnimeResult>> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const { data } = await this.client.get(`${this.baseUrl}/ajax/search/suggest?keyword=${encodedQuery}`);
      const $ = load(data.html);
      const res: ISearch<IAnimeResult> = {
        results: [],
      };

      $('.nav-item').each((i, el) => {
        const card = $(el);
        if (!card.hasClass('nav-bottom')) {
          const image = card.find('.film-poster img').attr('data-src');
          const title = card.find('.film-name');
          const id = card.attr('href')?.split('/')[1].split('?')[0];

          const duration = card.find('.film-infor span').last().text().trim();
          const releaseDate = card.find('.film-infor span:nth-child(1)').text().trim();
          const type = card.find('.film-infor').find('span, i').remove().end().text().trim();
          res.results.push({
            image: image,
            id: id!,
            title: title.text(),
            japaneseTitle: title.attr('data-jname'),
            aliasTitle: card.find('.alias-name').text(),
            releaseDate: releaseDate,
            type: type as MediaFormat,
            duration: duration,
            url: `${this.baseUrl}/${id}`,
          });
        }
      });

      return res;
    } catch (error) {
      throw new Error('Something went wrong. Please try again later.');
    }
  }

  /**
   * Fetches the list of episodes that the user is currently watching.
   * @param connectSid The session ID of the user. Note: This can be obtained from the browser cookies (needs to be signed in)
   * @returns A promise that resolves to an array of anime episodes.
   */
  async fetchContinueWatching(connectSid: string): Promise<IAnimeEpisode[]> {
    try {
      if (!(await this.verifyLoginState(connectSid))) {
        throw new Error('Invalid session ID');
      }
      const res: IAnimeEpisode[] = [];
      const { data } = await this.client.get(`${this.baseUrl}/user/continue-watching`, {
        headers: {
          Cookie: `connect.sid=${connectSid}`,
        },
      });
      const $ = load(data);
      $('.flw-item').each((i, ele) => {
        const card = $(ele);
        const atag = card.find('.film-name a');
        const id = atag.attr('href')?.replace('/watch/', '')?.replace('?ep=', '$episode$');
        const timeText = card.find('.fdb-time')?.text()?.split('/') ?? [];
        const duration = timeText.pop()?.trim() ?? '';
        const watchedTime = timeText.length > 0 ? timeText[0].trim() : '';
        res.push({
          id: id!,
          title: atag.text(),
          number: parseInt(card.find('.fdb-type').text().replace('EP', '').trim()),
          duration: duration,
          watchedTime: watchedTime,
          url: `${this.baseUrl}${atag.attr('href')}`,
          image: card.find('img')?.attr('data-src'),
          japaneseTitle: atag.attr('data-jname'),
          nsfw: card.find('.tick-rate')?.text() === '18+' ? true : false,
          sub: parseInt(card.find('.tick-item.tick-sub')?.text()) || 0,
          dub: parseInt(card.find('.tick-item.tick-dub')?.text()) || 0,
          episodes: parseInt(card.find('.tick-item.tick-eps')?.text()) || 0,
        });
      });

      return res;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  async fetchWatchList(
    connectSid: string,
    page: number = 1,
    sortListType?: WatchListType
  ): Promise<ISearch<IAnimeResult>> {
    if (!(await this.verifyLoginState(connectSid))) {
      throw new Error('Invalid session ID');
    }
    if (0 >= page) {
      page = 1;
    }
    let type: number = 0;
    switch (sortListType) {
      case WatchListType.WATCHING:
        type = 1;
      case WatchListType.ONHOLD:
        type = 2;
      case WatchListType.PLAN_TO_WATCH:
        type = 3;
      case WatchListType.DROPPED:
        type = 4;
      case WatchListType.COMPLETED:
        type = 5;
    }
    return this.scrapeCardPage(
      `${this.baseUrl}/user/watch-list?page=${page}${type != 0 ? '&type=' + type : ''}`,
      {
        headers: { Cookie: `connect.sid=${connectSid}` },
      }
    );
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
      const { data } = await this.client.get(`${this.baseUrl}/watch/${id}`);
      const $ = load(data);

      const { mal_id, anilist_id } = JSON.parse($('#syncData').text());
      info.malID = Number(mal_id);
      info.alID = Number(anilist_id);
      info.title = $('h2.film-name > a.text-white').text();
      info.japaneseTitle = $('div.anisc-info div:nth-child(2) span.name').text();
      info.image = $('img.film-poster-img').attr('src');
      info.description = $('div.film-description').text().trim();
      // Movie, TV, OVA, ONA, Special, Music
      info.type = $('span.item').last().prev().prev().text().toUpperCase() as MediaFormat;
      info.url = `${this.baseUrl}/${id}`;
      info.recommendations = await this.scrapeCard($);
      info.relatedAnime = [];
      $('#main-sidebar section:nth-child(1) div.anif-block-ul li').each((i, ele) => {
        const card = $(ele);
        const aTag = card.find('.film-name a');
        const id = aTag.attr('href')?.split('/')[1].split('?')[0];
        info.relatedAnime.push({
          id: id!,
          title: aTag.text(),
          url: `${this.baseUrl}${aTag.attr('href')}`,
          image: card.find('img')?.attr('data-src'),
          japaneseTitle: aTag.attr('data-jname'),
          type: card.find('.tick').contents().last()?.text()?.trim() as MediaFormat,
          sub: parseInt(card.find('.tick-item.tick-sub')?.text()) || 0,
          dub: parseInt(card.find('.tick-item.tick-dub')?.text()) || 0,
          episodes: parseInt(card.find('.tick-item.tick-eps')?.text()) || 0,
        });
      });
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

      // ZORO - PAGE INFO
      const zInfo = await this.client.get(info.url);
      const $$$ = load(zInfo.data);

      info.genres = [];
      $$$('.item.item-list')
        .find('a')
        .each(function () {
          const genre = $(this).text().trim();
          if (genre != undefined) info.genres?.push(genre);
        });

      switch (
        $$$('.item.item-title').find("span.item-head:contains('Status')").next('span.name').text().trim()
      ) {
        case 'Finished Airing':
          info.status = MediaStatus.COMPLETED;
          break;
        case 'Currently Airing':
          info.status = MediaStatus.ONGOING;
          break;
        case 'Not yet aired':
          info.status = MediaStatus.NOT_YET_AIRED;
          break;
        default:
          info.status = MediaStatus.UNKNOWN;
          break;
      }

      info.season = $$$('.item.item-title')
        .find("span.item-head:contains('Premiered')")
        .next('span.name')
        .text()
        .trim();

      if (info.japaneseTitle == '' || info.japaneseTitle == undefined) {
        info.japaneseTitle = $$$('.item.item-title')
          .find("span.item-head:contains('Japanese')")
          .next('span.name')
          .text()
          .trim();
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
        const episodeId = $$(el).attr('href')?.split('/')[2]?.replace('?ep=', '$episode$')!;
        const number = parseInt($$(el).attr('data-number')!);
        const title = $$(el).attr('title');
        const url = this.baseUrl + $$(el).attr('href');
        const isFiller = $$(el).hasClass('ssl-item-filler');
        const isSubbed =
          number <= (parseInt($('div.film-stats div.tick div.tick-item.tick-sub').text().trim()) || 0);
        const isDubbed =
          number <= (parseInt($('div.film-stats div.tick div.tick-item.tick-dub').text().trim()) || 0);

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
    server: StreamingServers = StreamingServers.VidCloud,
    subOrDub: SubOrSub = SubOrSub.SUB
  ): Promise<ISource> => {
    if (episodeId.startsWith('http')) {
      const serverUrl = new URL(episodeId);
      switch (server) {
        case StreamingServers.VidStreaming:
        case StreamingServers.VidCloud:
          return {
            headers: { Referer: serverUrl.href },
            ...(await new MegaCloud().extract(serverUrl, this.baseUrl)),
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
            ...(await new MegaCloud().extract(serverUrl, this.baseUrl)),
          };
      }
    }
    if (!episodeId.includes('$episode$')) throw new Error('Invalid episode id');

    // keeping this for future use
    // Fallback to using sub if no info found in case of compatibility

    // TODO: add both options later
    // subOrDub = episodeId.split('$')?.pop() === 'dub' ? 'dub' : 'sub';

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

      return await this.fetchEpisodeSources(link, server, SubOrSub.SUB);
    } catch (err) {
      throw err;
    }
  };

  private verifyLoginState = async (connectSid: string): Promise<boolean> => {
    try {
      const { data } = await this.client.get(`${this.baseUrl}/ajax/login-state`, {
        headers: {
          Cookie: `connect.sid=${connectSid}`,
        },
      });
      return data.is_login;
    } catch (err) {
      return false;
    }
  };

  private retrieveServerId = ($: any, index: number, subOrDub: SubOrSub) => {
    const rawOrSubOrDub = (raw: boolean) =>
      $(`.ps_-block.ps_-block-sub.servers-${raw ? 'raw' : subOrDub} > .ps__-list .server-item`)
        .map((i: any, el: any) => ($(el).attr('data-server-id') == `${index}` ? $(el) : null))
        .get()[0]
        .attr('data-id');
    try {
      // Attempt to get the subOrDub ID
      return rawOrSubOrDub(false);
    } catch (error) {
      // If an error is thrown, attempt to get the raw ID (The raw is the newest episode uploaded to zoro)
      return rawOrSubOrDub(true);
    }
  };

  /**
   * @param url string
   */
  private scrapeCardPage = async (url: string, headers?: object): Promise<ISearch<IAnimeResult>> => {
    try {
      const res: ISearch<IAnimeResult> = {
        currentPage: 0,
        hasNextPage: false,
        totalPages: 0,
        results: [],
      };
      const { data } = await this.client.get(url, headers);
      const $ = load(data);

      const pagination = $('ul.pagination');
      res.currentPage = parseInt(pagination.find('.page-item.active')?.text());
      const nextPage = pagination.find('a[title=Next]')?.attr('href');
      if (nextPage != undefined && nextPage != '') {
        res.hasNextPage = true;
      }
      const totalPages = pagination.find('a[title=Last]').attr('href')?.split('=').pop();
      if (totalPages === undefined || totalPages === '') {
        res.totalPages = res.currentPage;
      } else {
        res.totalPages = parseInt(totalPages);
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

      $('.flw-item').each((i, ele) => {
        const card = $(ele);
        const atag = card.find('.film-name a');
        const id = atag.attr('href')?.split('/')[1].split('?')[0];
        const watchList = card.find('.dropdown-menu .added').text().trim() as WatchListType;
        const type = card
          .find('.fdi-item')
          ?.first()
          ?.text()
          .replace(' (? eps)', '')
          .replace(/\s\(\d+ eps\)/g, '');
        results.push({
          id: id!,
          title: atag.text(),
          url: `${this.baseUrl}${atag.attr('href')}`,
          image: card.find('img')?.attr('data-src'),
          duration: card.find('.fdi-duration')?.text(),
          watchList: watchList || WatchListType.NONE,
          japaneseTitle: atag.attr('data-jname'),
          type: type as MediaFormat,
          nsfw: card.find('.tick-rate')?.text() === '18+' ? true : false,
          sub: parseInt(card.find('.tick-item.tick-sub')?.text()) || 0,
          dub: parseInt(card.find('.tick-item.tick-dub')?.text()) || 0,
          episodes: parseInt(card.find('.tick-item.tick-eps')?.text()) || 0,
        });
      });
      return results;
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
//   const anime = await zoro.search('Dandadan');
//   const info = await zoro.fetchAnimeInfo(anime.results[0].id);
//   const sources = await zoro.fetchEpisodeSources(
//     info.episodes![0].id,
//     StreamingServers.VidCloud,
//     SubOrSub.DUB
//   );
//   console.log(sources);
// })();

export default Zoro;
