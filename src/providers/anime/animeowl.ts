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

import { Luffy } from '../../utils';

class AnimeOwl extends AnimeParser {
  override readonly name = 'AnimeOwl';
  protected override baseUrl = 'https://animeowl.me';
  protected apiUrl = 'https://animeowl.me/api';
  protected override logo = 'https://animeowl.me/images/favicon-96x96.png';
  protected override classPath = 'ANIME.AnimeOwl';

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
  override search = async (query: string, page: number = 1): Promise<ISearch<IAnimeResult>> => {
    if (0 >= page) {
      page = 1;
    }

    const { data } = await this.client.post(`${this.apiUrl}/advance-search`, {
      clicked: false,
      limit: 24,
      page: page - 1,
      pageCount: 1,
      value: query,
      selected: {
        type: [],
        genre: [],
        year: [],
        country: [],
        season: [],
        status: [],
        sort: [],
        language: [],
      },
      results: [],
      lang22: 3,
      sortt: 4,
    });

    const res: ISearch<IAnimeResult> = {
      currentPage: page,
      hasNextPage: page < Math.ceil(data.total / 24),
      totalPages: Math.ceil(data.total / 24),
      results: [],
    };
    res.results = data.results.map(
      (item: any): IAnimeResult => ({
        id: `${item.anime_slug}$${item.anime_id}`,
        title: item.en_name || item.anime_name,
        url: `${this.baseUrl}/anime/${item.anime_slug}`,
        image:
          `${this.baseUrl}${item.image}` ||
          `${this.baseUrl}${item.thumbnail}` ||
          `${this.baseUrl}${item.webp}`,
        japaneseTitle: item.jp_name,
        sub: parseInt(item.total_episodes) || 0,
        dub: parseInt(item.total_dub_episodes) || 0,
        episodes: parseInt(item.total_episodes) || 0,
      })
    );
    return res;
  };

  /**
   * @param page number
   */
  fetchTopAiring(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/trending?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchRecentlyUpdated(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/recent-episode/sub?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchMovie(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/type/movie?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchTV(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/type/tv?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchOVA(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/type/ova?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchONA(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/type/ona?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchSpecial(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/type/special?page=${page}`);
  }

  async fetchGenres(): Promise<string[]> {
    try {
      const res: string[] = [];
      const { data } = await this.client.get(`${this.baseUrl}/home`);
      const $ = load(data);

      $('.nav-genre > .sidebar-grid a').each((i, el) => {
        res.push($(el).text().trim().toLowerCase());
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

  async fetchSpotlight(): Promise<ISearch<IAnimeResult>> {
    try {
      const res: ISearch<IAnimeResult> = { results: [] };
      const { data } = await this.client.get(`${this.baseUrl}/home`);
      const $ = load(data);

      $('.carousel-inner > .carousel-item').each((i, el) => {
        const card = $(el);
        const titleElement = card.find('.slide-title');
        const id = card.find('a.anime-play').attr('href')?.split(`${this.baseUrl}/anime/`)[1]!;
        const img = card.find('img.film-poster-img');
        res.results.push({
          id: id!,
          title: titleElement.text().trim(),
          banner: card
            .find('.main-bg')
            ?.css('background')
            ?.replace(/url\(["']?(.+?)["']?\)/, '$1')
            .trim(),
          url: `${this.baseUrl}/anime/${id}`,
          type: card.find('.anime-type span').text().trim() as MediaFormat,
          duration: card.find('.anime-duration span').first().text().trim(),
          episodes: parseInt(card.find('.anime-duration.bg-purple span').text()) || 0,
          description: card
            .find('.anime-desc')
            .text()
            .replace(/\s*\n\s*/g, ' ')
            .trim(),
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
      const { data } = await this.client.get(`${this.apiUrl}/live-search/${encodedQuery}`);
      const res: ISearch<IAnimeResult> = {
        results: [],
      };
      data.map((item: any) => {
        res.results.push({
          image: `${this.baseUrl}${item.thumbnail}` || `${this.baseUrl}${item.webp}`,
          id: `${item.slug}$${item.id}`!,
          title: item.en_name,
          japaneseTitle: item.anime_name,
          releaseDate: item.year_name,
          url: `${this.baseUrl}/anime/${item.slug}`,
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
      const { data } = await this.client.get(`${this.baseUrl}/anime/${id.split('$')[0]}`);
      const $ = load(data);

      info.title = $('h1.anime-name').text();
      info.japaneseTitle = $('h2.anime-romaji').text();
      info.image = `${this.baseUrl}${$('div.cover-img-container >img').attr('src')}`;
      info.description = $('div.anime-desc')
        .text()
        .replace(/\s*\n\s*/g, ' ')
        .trim();
      // Movie, TV, OVA, ONA, Special, Music
      info.type = $('div.type > a').text().toUpperCase() as MediaFormat;
      info.url = `${this.baseUrl}/anime/${id.split('$')[0]}`;
      // info.recommendations = await this.scrapeCard($);

      const hasSub: boolean =
        $('div#anime-cover-sub-content > div.nav-container > ul#episode-list > li.nav-item').length > 0;
      const hasDub: boolean =
        $('div#anime-cover-dub-content > div.nav-container > ul#episode-list > li.nav-item').length > 0;

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
      $('div.genre')
        .find('a')
        .each(function () {
          const genre = $(this).text().trim();
          if (genre != undefined) info.genres?.push(genre);
        });

      switch ($('div.status > span').text().trim()) {
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

      info.season = $('div.premiered')
        .text()
        .replace(/\s*\n\s*/g, ' ')
        .replace('Premiered: ', '')
        .trim();
      let totalSubEpisodes = parseInt(
        $('div#anime-cover-sub-content > div.nav-container > ul#episode-list > li.nav-item')
          .last()
          .text()
          .split('-')[1]
          .trim()
      );
      let totalDubEpisodes = parseInt(
        $('div#anime-cover-dub-content > div.nav-container > ul#episode-list > li.nav-item')
          .last()
          .text()
          .split('-')[1]
          ?.trim() ?? '0'
      );
      info.totalEpisodes = totalSubEpisodes > totalDubEpisodes ? totalSubEpisodes : totalDubEpisodes;
      info.episodes = [];

      const subEpisodes = this.parseEpisodes($, '#anime-cover-sub-content .episode-node', SubOrSub.SUB);
      const dubEpisodes = this.parseEpisodes($, '#anime-cover-dub-content .episode-node', SubOrSub.DUB);

      const groupedMap = new Map<string, IAnimeEpisode>();

      //passing the anime id with episode id for get request in fetchEpisodeServers
      for (const sub of subEpisodes) {
        groupedMap.set(sub.title!, {
          id: `${id.split('$')[0]}$${sub.id!}`,
          title: sub.title!,
          number: sub.number!,
          url: sub.url,
          isSubbed: true,
          isDubbed: false,
        });
      }

      for (const dub of dubEpisodes) {
        if (groupedMap.has(dub.title!)) {
          const entry = groupedMap.get(dub.title!)!;
          entry.id = `${entry.id}&${dub.id}`; //combining the sub and dub episode ids
          entry.isDubbed = true;
        } else {
          groupedMap.set(dub.title!, {
            id: `${id.split('$')[0]}$${dub.id!}`,
            title: dub.title!,
            number: dub.number!,
            url: dub.url,
            isSubbed: false,
            isDubbed: true,
          });
        }
      }

      info.episodes = Array.from(groupedMap.values());

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
    server: StreamingServers = StreamingServers.Luffy,
    subOrDub: SubOrSub = SubOrSub.SUB
  ): Promise<ISource> => {
    if (episodeId.startsWith('http')) {
      const serverUrl = new URL(episodeId);
      switch (server) {
        case StreamingServers.Luffy:
          return {
            headers: { Referer: serverUrl.href },
            sources: await new Luffy().extract(serverUrl),
          };
        default:
          return {
            headers: { Referer: serverUrl.href },
            sources: await new Luffy().extract(serverUrl),
          };
      }
    }

    try {
      const servers = await this.fetchEpisodeServers(episodeId, subOrDub);
      const i = servers.findIndex(s => s.name.toLowerCase() === server.toLowerCase());

      if (i === -1) {
        throw new Error(`Server ${server} not found`);
      }

      const serverUrl: URL = new URL(servers[i].url);
      const sources = await this.fetchEpisodeSources(serverUrl.href, server, subOrDub);
      return sources;
    } catch (err) {
      throw err;
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
      res.currentPage = parseInt(pagination.find('li.page-item.active')?.text()) || 1;
      const nextPage = pagination.find('li:has(a[aria-label="Next page"])');
      res.hasNextPage = !nextPage.hasClass('disabled');
      let lastPageText = 0;
      pagination.find('li.page-item a').each((_, el) => {
        const text = parseInt($(el).text().trim());
        if (!isNaN(text)) {
          lastPageText = Math.max(lastPageText, text);
        }
      });
      res.totalPages = lastPageText || res.currentPage;

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

      $('#anime-list .recent-anime.anime-vertical').each((i, ele) => {
        const card = $(ele);
        const atag = card.find('a.post-thumb');
        const id = atag.attr('href')?.split(`${this.baseUrl}/anime/`)[1];
        const type = card.find('.anime-type span').text().trim();
        results.push({
          id: id!,
          title: card.find('img')?.attr('alt')!,
          url: `${atag.attr('href')}`,
          image: card.find('img')?.attr('data-src') || card.find('img')?.attr('src'),
          type: type as MediaFormat,
          sub: parseInt(card.find('.misc-info .anime-duration span')?.eq(0).text()) || 0,
          dub: parseInt(card.find('.misc-info .anime-duration span')?.eq(1).text()) || 0,
          episodes: parseInt(card.find('.misc-info .anime-duration span')?.eq(0).text()) || 0,
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
    const subEpisodeId = episodeId.split('$')[1].split('&')[0];
    const dubEpisodeId = episodeId.split('&')[1];
    const id = episodeId.split('$')[0];
    const { data } = await this.client.get(`${this.baseUrl}/anime/${id}`);
    const $ = load(data);
    const subEpisode = this.parseEpisodes($, '#anime-cover-sub-content .episode-node', SubOrSub.SUB).filter(
      item => item.id === subEpisodeId
    );
    const dubEpisode = this.parseEpisodes($, '#anime-cover-dub-content .episode-node', SubOrSub.DUB).filter(
      item => item.id === dubEpisodeId
    );

    let directLink: string | undefined = '';

    if (subOrDub === SubOrSub.SUB) {
      const { data: intermediary } = await this.client.get(subEpisode[0].url!);
      const $ = load(intermediary);
      directLink = $('button#hot-anime-tab')?.attr('data-source');
    }
    if (subOrDub === SubOrSub.DUB) {
      const { data: intermediary } = await this.client.get(dubEpisode[0].url!);
      const $ = load(intermediary);
      directLink = $('button#hot-anime-tab')?.attr('data-source');
    }

    const { data: server } = await this.client.get(`${this.baseUrl}${directLink}`);
    const servers: IEpisodeServer[] = [];
    server['luffy']?.map((item: any) => {
      servers.push({
        name: 'luffy',
        url: `${this.baseUrl}${directLink!}`,
      });
    });

    return servers;
  };

  private parseEpisodes = ($: any, selector: string, subOrDub: SubOrSub): IAnimeEpisode[] => {
    return $(selector)
      .map((idx: number, el: CheerioAPI) => {
        const $el = $(el);
        const title = $el.attr('title') ?? '';
        const id = $el.attr('id') ?? '';
        const url = $el.attr('href')?.startsWith('http') ? $el.attr('href')! : $el.prop('href');
        const episodeNumber = Number(title);

        // Skip if the episode number is a float
        if (!Number.isInteger(episodeNumber)) {
          return null;
        }

        return {
          id: id,
          number: parseInt(title),
          title: `Ep-${title}`,
          url: url || '',
          isSubbed: subOrDub === SubOrSub.SUB,
          isDubbed: subOrDub === SubOrSub.DUB,
        };
      })
      .get()
      .filter(Boolean);
  };
}

(async () => {
  const animeowl = new AnimeOwl();
  const search = await animeowl.fetchSpotlight();
  const info = await animeowl.fetchAnimeInfo(search.results[0].id);
  // const sources = await animeowl.fetchEpisodeSources(info.episodes![0].id,StreamingServers.Luffy, SubOrSub.DUB);
  // console.log(info);
})();

export default AnimeOwl;
