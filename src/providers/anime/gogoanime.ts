import { AxiosAdapter } from 'axios';
import { load } from 'cheerio';

import {
  AnimeParser,
  ISearch,
  IAnimeInfo,
  IEpisodeServer,
  IVideo,
  StreamingServers,
  MediaStatus,
  SubOrSub,
  IAnimeResult,
  ISource,
  MediaFormat,
  ProxyConfig,
} from '../../models';
import { USER_AGENT } from '../../utils';
import { GogoCDN, StreamSB } from '../../extractors';

class Gogoanime extends AnimeParser {
  override readonly name = 'Gogoanime';
  protected override baseUrl = 'https://gogoanime3.net';
  protected override logo =
    'https://play-lh.googleusercontent.com/MaGEiAEhNHAJXcXKzqTNgxqRmhuKB1rCUgb15UrN_mWUNRnLpO5T1qja64oRasO7mn0';
  protected override classPath = 'ANIME.Gogoanime';
  private readonly ajaxUrl = 'https://ajax.gogo-load.com/ajax';

  /**
   *
   * @param query search query string
   * @param page page number (default 1) (optional)
   */
  override search = async (query: string, page: number = 1): Promise<ISearch<IAnimeResult>> => {
    const searchResult: ISearch<IAnimeResult> = {
      currentPage: page,
      hasNextPage: false,
      results: [],
    };
    try {
      const res = await this.client.get(
        `${this.baseUrl}/filter.html?keyword=${encodeURIComponent(query)}&page=${page}`
      );

      const $ = load(res.data);

      searchResult.hasNextPage =
        $('div.anime_name.new_series > div > div > ul > li.selected').next().length > 0;

      $('div.last_episodes > ul > li').each((i, el) => {
        searchResult.results.push({
          id: $(el).find('p.name > a').attr('href')?.split('/')[2]!,
          title: $(el).find('p.name > a').attr('title')!,
          url: `${this.baseUrl}/${$(el).find('p.name > a').attr('href')}`,
          image: $(el).find('div > a > img').attr('src'),
          releaseDate: $(el).find('p.released').text().trim(),
          subOrDub: $(el).find('p.name > a').text().toLowerCase().includes('dub')
            ? SubOrSub.DUB
            : SubOrSub.SUB,
        });
      });

      return searchResult;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   *
   * @param id anime id
   */
  override fetchAnimeInfo = async (id: string): Promise<IAnimeInfo> => {
    if (!id.includes('gogoanime')) id = `${this.baseUrl}/category/${id}`;

    const animeInfo: IAnimeInfo = {
      id: '',
      title: '',
      url: '',
      genres: [],
      totalEpisodes: 0,
    };
    try {
      const res = await this.client.get(id);

      const $ = load(res.data);

      animeInfo.id = new URL(id).pathname.split('/')[2];
      animeInfo.title = $(
        'section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > h1'
      )
        .text()
        .trim();
      animeInfo.url = id;
      animeInfo.image = $('div.anime_info_body_bg > img').attr('src');
      animeInfo.releaseDate = $('div.anime_info_body_bg > p:nth-child(7)')
        .text()
        .trim()
        .split('Released: ')[1];
      animeInfo.description = $('div.anime_info_body_bg > p:nth-child(5)')
        .text()
        .trim()
        .replace('Plot Summary: ', '');

      animeInfo.subOrDub = animeInfo.title.toLowerCase().includes('dub') ? SubOrSub.DUB : SubOrSub.SUB;

      animeInfo.type = $('div.anime_info_body_bg > p:nth-child(4) > a')
        .text()
        .trim()
        .toUpperCase() as MediaFormat;

      animeInfo.status = MediaStatus.UNKNOWN;

      switch ($('div.anime_info_body_bg > p:nth-child(8) > a').text().trim()) {
        case 'Ongoing':
          animeInfo.status = MediaStatus.ONGOING;
          break;
        case 'Completed':
          animeInfo.status = MediaStatus.COMPLETED;
          break;
        case 'Upcoming':
          animeInfo.status = MediaStatus.NOT_YET_AIRED;
          break;
        default:
          animeInfo.status = MediaStatus.UNKNOWN;
          break;
      }
      animeInfo.otherName = $('div.anime_info_body_bg > p:nth-child(9)')
        .text()
        .replace('Other name: ', '')
        .replace(/;/g, ',');

      $('div.anime_info_body_bg > p:nth-child(6) > a').each((i, el) => {
        animeInfo.genres?.push($(el).attr('title')!.toString());
      });

      const ep_start = $('#episode_page > li').first().find('a').attr('ep_start');
      const ep_end = $('#episode_page > li').last().find('a').attr('ep_end');
      const movie_id = $('#movie_id').attr('value');
      const alias = $('#alias_anime').attr('value');

      const html = await this.client.get(
        `${
          this.ajaxUrl
        }/load-list-episode?ep_start=${ep_start}&ep_end=${ep_end}&id=${movie_id}&default_ep=${0}&alias=${alias}`
      );
      const $$ = load(html.data);

      animeInfo.episodes = [];
      $$('#episode_related > li').each((i, el) => {
        animeInfo.episodes?.push({
          id: $(el).find('a').attr('href')?.split('/')[1]!,
          number: parseFloat($(el).find(`div.name`).text().replace('EP ', '')),
          url: `${this.baseUrl}/${$(el).find(`a`).attr('href')?.trim()}`,
        });
      });
      animeInfo.episodes = animeInfo.episodes.reverse();

      animeInfo.totalEpisodes = parseInt(ep_end ?? '0');

      return animeInfo;
    } catch (err) {
      throw new Error(`failed to fetch anime info: ${err}`);
    }
  };

  /**
   *
   * @param episodeId episode id
   * @param server server type (default 'GogoCDN') (optional)
   */
  override fetchEpisodeSources = async (
    episodeId: string,
    server: StreamingServers = StreamingServers.VidStreaming
  ): Promise<ISource> => {
    if (episodeId.startsWith('http')) {
      const serverUrl = new URL(episodeId);
      switch (server) {
        case StreamingServers.GogoCDN:
          return {
            headers: { Referer: serverUrl.href },
            sources: await new GogoCDN(this.proxyConfig, this.adapter).extract(serverUrl),
            download: `https://gogohd.net/download${serverUrl.search}`,
          };
        case StreamingServers.StreamSB:
          return {
            headers: {
              Referer: serverUrl.href,
              watchsb: 'streamsb',
              'User-Agent': USER_AGENT,
            },
            sources: await new StreamSB(this.proxyConfig, this.adapter).extract(serverUrl),
            download: `https://gogohd.net/download${serverUrl.search}`,
          };
        default:
          return {
            headers: { Referer: serverUrl.href },
            sources: await new GogoCDN(this.proxyConfig, this.adapter).extract(serverUrl),
            download: `https://gogohd.net/download${serverUrl.search}`,
          };
      }
    }

    try {
      const res = await this.client.get(`${this.baseUrl}/${episodeId}`);

      const $ = load(res.data);

      let serverUrl: URL;

      switch (server) {
        case StreamingServers.GogoCDN:
          serverUrl = new URL(`${$('#load_anime > div > div > iframe').attr('src')}`);
          break;
        case StreamingServers.VidStreaming:
          serverUrl = new URL(
            `${$('div.anime_video_body > div.anime_muti_link > ul > li.vidcdn > a').attr('data-video')}`
          );
          break;
        case StreamingServers.StreamSB:
          serverUrl = new URL(
            $('div.anime_video_body > div.anime_muti_link > ul > li.streamsb > a').attr('data-video')!
          );
          break;
        default:
          serverUrl = new URL(`${$('#load_anime > div > div > iframe').attr('src')}`);
          break;
      }

      return await this.fetchEpisodeSources(serverUrl.href, server);
    } catch (err) {
      console.log(err);
      throw new Error('Episode not found.');
    }
  };

  /**
   *
   * @param episodeId episode link or episode id
   */
  override fetchEpisodeServers = async (episodeId: string): Promise<IEpisodeServer[]> => {
    try {
      if (!episodeId.startsWith(this.baseUrl)) episodeId = `${this.baseUrl}/${episodeId}`;

      const res = await this.client.get(episodeId);

      const $ = load(res.data);

      const servers: IEpisodeServer[] = [];

      $('div.anime_video_body > div.anime_muti_link > ul > li').each((i, el) => {
        let url = $(el).find('a').attr('data-video');
        if (!url?.startsWith('http')) url = `https:${url}`;

        servers.push({
          name: $(el).find('a').text().replace('Choose this server', '').trim(),
          url: url,
        });
      });

      return servers;
    } catch (err) {
      throw new Error('Episode not found.');
    }
  };
  /**
   *
   * @param episodeId episode link or episode id
   */
  fetchAnimeIdFromEpisodeId = async (episodeId: string): Promise<string> => {
    try {
      if (!episodeId.startsWith(this.baseUrl)) episodeId = `${this.baseUrl}/${episodeId}`;

      const res = await this.client.get(episodeId);

      const $ = load(res.data);

      return (
        $(
          '#wrapper_bg > section > section.content_left > div:nth-child(1) > div.anime_video_body > div.anime_video_body_cate > div.anime-info > a'
        ).attr('href') as string
      ).split('/')[2];
    } catch (err) {
      throw new Error('Episode not found.');
    }
  };
  /**
   * @param page page number (optional)
   * @param type type of media. (optional) (default `1`) `1`: Japanese with subtitles, `2`: english/dub with no subtitles, `3`: chinese with english subtitles
   */
  fetchRecentEpisodes = async (page: number = 1, type: number = 1): Promise<ISearch<IAnimeResult>> => {
    try {
      const res = await this.client.get(`${this.ajaxUrl}/page-recent-release.html?page=${page}&type=${type}`);

      const $ = load(res.data);

      const recentEpisodes: IAnimeResult[] = [];

      $('div.last_episodes.loaddub > ul > li').each((i, el) => {
        recentEpisodes.push({
          id: $(el).find('a').attr('href')?.split('/')[1]?.split('-episode')[0]!,
          episodeId: $(el).find('a').attr('href')?.split('/')[1]!,
          episodeNumber: parseInt($(el).find('p.episode').text().replace('Episode ', '')),
          title: $(el).find('p.name > a').attr('title')!,
          image: $(el).find('div > a > img').attr('src'),
          url: `${this.baseUrl}${$(el).find('a').attr('href')?.trim()}`,
        });
      });

      const hasNextPage = !$('div.anime_name_pagination.intro > div > ul > li').last().hasClass('selected');

      return {
        currentPage: page,
        hasNextPage: hasNextPage,
        results: recentEpisodes,
      };
    } catch (err) {
      throw new Error('Something went wrong. Please try again later.');
    }
  };

  fetchGenreInfo = async (genre: string, page: number = 1): Promise<ISearch<IAnimeResult>> => {
    try {
      const res = await this.client.get(`${this.baseUrl}/genre/${genre}?page=${page}`);

      const $ = load(res.data);

      const genreInfo: IAnimeResult[] = [];

      $('div.last_episodes > ul > li').each((i, elem) => {
        genreInfo.push({
          id: $(elem).find('p.name > a').attr('href')?.split('/')[2] as string,
          title: $(elem).find('p.name > a').attr('title') as string,
          image: $(elem).find('div > a > img').attr('src'),
          released: $(elem).find('p.released').text().replace('Released: ', '').trim(),
          url: this.baseUrl + '/' + $(elem).find('p.name > a').attr('href'),
        });
      });

      const paginatorDom = $('div.anime_name_pagination > div > ul > li');
      const hasNextPage = paginatorDom.length > 0 && !paginatorDom.last().hasClass('selected');
      return {
        currentPage: page,
        hasNextPage: hasNextPage,
        results: genreInfo,
      };
    } catch (err) {
      throw new Error('Something went wrong. Please try again later.');
    }
  };

  fetchTopAiring = async (page: number = 1): Promise<ISearch<IAnimeResult>> => {
    try {
      const res = await this.client.get(`${this.ajaxUrl}/page-recent-release-ongoing.html?page=${page}`);

      const $ = load(res.data);

      const topAiring: IAnimeResult[] = [];

      $('div.added_series_body.popular > ul > li').each((i, el) => {
        topAiring.push({
          id: $(el).find('a:nth-child(1)').attr('href')?.split('/')[2]!,
          title: $(el).find('a:nth-child(1)').attr('title')!,
          image: $(el).find('a:nth-child(1) > div').attr('style')?.match('(https?://.*.(?:png|jpg))')![0],
          url: `${this.baseUrl}${$(el).find('a:nth-child(1)').attr('href')}`,
          genres: $(el)
            .find('p.genres > a')
            .map((i, el) => $(el).attr('title'))
            .get(),
        });
      });

      const hasNextPage = !$('div.anime_name.comedy > div > div > ul > li').last().hasClass('selected');

      return {
        currentPage: page,
        hasNextPage: hasNextPage,
        results: topAiring,
      };
    } catch (err) {
      throw new Error('Something went wrong. Please try again later.');
    }
  };

  fetchRecentMovies = async (page: number = 1): Promise<ISearch<IAnimeResult>> => {
    try {
      const res = await this.client.get(`${this.baseUrl}/anime-movies.html?aph&page=${page}`);

      const $ = load(res.data);

      const recentMovies: IAnimeResult[] = [];

      $('div.last_episodes > ul > li').each((i, el) => {
        const a = $(el).find('p.name > a');
        const pRelease = $(el).find('p.released');
        const pName = $(el).find('p.name > a');

        recentMovies.push({
          id: a.attr('href')?.replace(`/category/`, '')!,
          title: pName.attr('title')!,
          releaseDate: pRelease.text().replace('Released: ', '').trim(),
          image: $(el).find('div > a > img').attr('src'),
          url: `${this.baseUrl}${a.attr('href')}`,
        });
      });

      const hasNextPage = !$('div.anime_name.anime_movies > div > div > ul > li').last().hasClass('selected');

      return {
        currentPage: page,
        hasNextPage: hasNextPage,
        results: recentMovies,
      };
    } catch (err) {
      console.log(err);
      throw new Error('Something went wrong. Please try again later.');
    }
  };

  fetchPopular = async (page: number = 1): Promise<ISearch<IAnimeResult>> => {
    try {
      const res = await this.client.get(`${this.baseUrl}/popular.html?page=${page}`);

      const $ = load(res.data);

      const recentMovies: IAnimeResult[] = [];

      $('div.last_episodes > ul > li').each((i, el) => {
        const a = $(el).find('p.name > a');
        const pRelease = $(el).find('p.released');
        const pName = $(el).find('p.name > a');

        recentMovies.push({
          id: a.attr('href')?.replace(`/category/`, '')!,
          title: pName.attr('title')!,
          releaseDate: pRelease.text().replace('Released: ', '').trim(),
          image: $(el).find('div > a > img').attr('src'),
          url: `${this.baseUrl}${a.attr('href')}`,
        });
      });

      const hasNextPage = !$('div.anime_name.anime_movies > div > div > ul > li').last().hasClass('selected');

      return {
        currentPage: page,
        hasNextPage: hasNextPage,
        results: recentMovies,
      };
    } catch (err) {
      console.log(err);
      throw new Error('Something went wrong. Please try again later.');
    }
  };

  fetchGenreList = async (): Promise<{ id: string | undefined; title: string | undefined }[]> => {
    const genres: { id: string | undefined; title: string | undefined }[] = [];
    let res = null;
    try {
      res = await this.client.get(`${this.baseUrl}/home.html`);
    } catch (err) {
      try {
        res = await this.client.get(`${this.baseUrl}/`);
      } catch (error) {
        throw new Error('Something went wrong. Please try again later.');
      }
    }
    try {
      const $ = load(res.data);
      $('nav.menu_series.genre.right > ul > li').each((_index, element) => {
        const genre = $(element).find('a');
        genres.push({ id: genre.attr('href')?.replace('/genre/', ''), title: genre.attr('title') }!);
      });
      return genres;
    } catch (err) {
      throw new Error('Something went wrong. Please try again later.');
    }
  };
}

// (async () => {
//   const gogo = new Gogoanime();
//   const search = await gogo.fetchEpisodeSources('jigokuraku-dub-episode-1');
//   console.log(search);
// })();

export default Gogoanime;
