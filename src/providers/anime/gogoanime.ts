import axios from 'axios';
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
} from '../../models';
import { GogoCDN, StreamSB, USER_AGENT } from '../../utils';

class Gogoanime extends AnimeParser {
  override readonly name = 'Gogoanime';
  protected override baseUrl = 'https://www.gogoanime.dk';
  protected override logo =
    'https://i0.wp.com/cloudfuji.com/wp-content/uploads/2021/12/gogoanime.png?fit=300%2C400&ssl=1';
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
      const res = await axios.get(
        `${this.baseUrl}/search.html?keyword=${encodeURIComponent(query)}&page=${page}`
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
      url: id,
      genres: [],
      totalEpisodes: 0,
    };
    try {
      const res = await axios.get(id);

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

      const html = await axios.get(
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
      throw new Error("Anime doesn't exist.");
    }
  };

  /**
   *
   * @param episodeId episode id
   * @param server server type (default 'GogoCDN') (optional)
   */
  override fetchEpisodeSources = async (
    episodeId: string,
    server: StreamingServers = StreamingServers.GogoCDN
  ): Promise<ISource> => {
    if (episodeId.startsWith('http')) {
      const serverUrl = new URL(episodeId);
      switch (server) {
        case StreamingServers.GogoCDN:
          return {
            headers: { Referer: serverUrl.href },
            sources: await new GogoCDN().extract(serverUrl),
          };
        case StreamingServers.StreamSB:
          return {
            headers: { Referer: serverUrl.href, watchsb: 'streamsb', 'User-Agent': USER_AGENT },
            sources: await new StreamSB().extract(serverUrl),
          };
        default:
          return {
            headers: { Referer: serverUrl.href },
            sources: await new GogoCDN().extract(serverUrl),
          };
      }
    }

    try {
      const res = await axios.get(`${this.baseUrl}/${episodeId}`);

      const $ = load(res.data);

      let serverUrl: URL;

      switch (server) {
        case StreamingServers.GogoCDN:
          serverUrl = new URL(`https:${$('#load_anime > div > div > iframe').attr('src')}`);
          break;
        case StreamingServers.StreamSB:
          serverUrl = new URL(
            $('div.anime_video_body > div.anime_muti_link > ul > li.streamsb > a').attr('data-video')!
          );
          break;
        default:
          serverUrl = new URL(`https:${$('#load_anime > div > div > iframe').attr('src')}`);
          break;
      }

      return await this.fetchEpisodeSources(serverUrl.href, server);
    } catch (err) {
      console.error(err);
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

      const res = await axios.get(episodeId);

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
   * @param page page number (optional)
   * @param type type of media. (optional) (default `1`) `1`: Japanese with subtitles, `2`: english/dub with no subtitles, `3`: chinese with english subtitles
   */
  fetchRecentEpisodes = async (page: number = 1, type: number = 1): Promise<ISearch<IAnimeResult>> => {
    try {
      const res = await axios.get(`${this.ajaxUrl}/page-recent-release.html?page=${page}&type=${type}`);

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

  fetchTopAiring = async (page: number = 1): Promise<ISearch<IAnimeResult>> => {
    try {
      const res = await axios.get(`${this.ajaxUrl}/page-recent-release-ongoing.html?page=${page}`);

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
}

// (async () => {
//   const anime = new Gogoanime();
//   const animeInfo = await anime.fetchEpisodeSources('juuni-taisen-dub-episode-6', StreamingServers.GogoCDN);
//   console.log(animeInfo);
// })();

export default Gogoanime;
