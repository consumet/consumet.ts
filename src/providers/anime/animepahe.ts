import axios from 'axios';
import { load } from 'cheerio';

import {
  AnimeParser,
  ISearch,
  IAnimeInfo,
  MediaStatus,
  IAnimeResult,
  ISource,
  IAnimeEpisode,
  IEpisodeServer,
  MediaFormat,
  SubOrSub,
} from '../../models';
import { Kwik } from '../../extractors';

class AnimePahe extends AnimeParser {
  override readonly name = 'AnimePahe';
  protected override baseUrl = 'https://animepahe.com';
  protected override logo = 'https://animepahe.com/pikacon.ico';
  protected override classPath = 'ANIME.AnimePahe';

  private readonly sgProxy = 'https://cors.consumet.stream';

  /**
   * @param query Search query
   */
  override search = async (query: string): Promise<ISearch<IAnimeResult>> => {
    try {
      const { data } = await axios.get(
        `${this.sgProxy}/${this.baseUrl}/api?m=search&q=${encodeURIComponent(query)}`
      );

      const res = {
        results: data.data.map((item: any) => ({
          id: item.session,
          title: item.title,
          image: item.poster,
          rating: item.score,
          releaseDate: item.year,
          type: item.type,
        })),
      };

      return res;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   * @param id Anime id
   * @param episodePage Episode page number (optional) default: -1 to get all episodes. number of episode pages can be found in the anime info object
   */
  override fetchAnimeInfo = async (id: string, episodePage: number = -1): Promise<IAnimeInfo> => {
    const animeInfo: IAnimeInfo = {
      id: id,
      title: '',
    };

    if (id.includes('-')) id = `${this.baseUrl}/anime/${id}`;
    else id = `${this.baseUrl}/a/${id}`;

    try {
      const res = await axios.get(`${this.sgProxy}/${id}`);
      const $ = load(res.data);

      const tempId = $('head > meta[property="og:url"]').attr('content')!.split('/').pop()!;

      animeInfo.id = $('head > meta[name="id"]').attr('content')!;
      animeInfo.title = $('div.header-wrapper > header > div > h1 > span').text();
      animeInfo.image = $('header > div > div > div > a > img').attr('data-src');
      animeInfo.cover = `https:${$('body > section > article > div.header-wrapper > div').attr('data-src')}`;
      animeInfo.description = $('div.col-sm-8.anime-summary > div').text();
      // There's no way of knowing if an anime has dub or sub until you try to watch a video unfortunately.
      animeInfo.subOrDub = SubOrSub.BOTH;
      animeInfo.hasSub = true;
      animeInfo.hasDub = true;
      animeInfo.genres = $('div.col-sm-4.anime-info > div > ul > li')
        .map((i, el) => $(el).find('a').attr('title'))
        .get();

      switch ($('div.col-sm-4.anime-info > p:nth-child(4) > a').text().trim()) {
        case 'Currently Airing':
          animeInfo.status = MediaStatus.ONGOING;
          break;
        case 'Finished Airing':
          animeInfo.status = MediaStatus.COMPLETED;
          break;
        default:
          animeInfo.status = MediaStatus.UNKNOWN;
      }
      animeInfo.type = $('div.col-sm-4.anime-info > p:nth-child(2) > a')
        .text()
        .trim()
        .toUpperCase() as MediaFormat;
      animeInfo.releaseDate = $('div.col-sm-4.anime-info > p:nth-child(5)')
        .text()
        .split('to')[0]
        .replace('Aired:', '')
        .trim();
      animeInfo.aired = $('div.col-sm-4.anime-info > p:nth-child(5)')
        .text()
        .replace('Aired:', '')
        .trim()
        .replace('\n', ' ');
      animeInfo.studios = $('div.col-sm-4.anime-info > p:nth-child(7)')
        .text()
        .replace('Studio:', '')
        .trim()
        .split('\n');
      animeInfo.totalEpisodes = parseInt(
        $('div.col-sm-4.anime-info > p:nth-child(3)').text().replace('Episodes:', '')
      );

      animeInfo.episodes = [];
      if (episodePage < 0) {
        const {
          data: { last_page, data },
        } = await axios.get(
          `${this.sgProxy}/${this.baseUrl}/api?m=release&id=${tempId}&sort=episode_asc&page=1`
        );

        animeInfo.episodePages = last_page;

        animeInfo.episodes.push(
          ...data.map(
            (item: any) =>
              ({
                id: item.session,
                number: item.episode,
                title: item.title,
                image: item.snapshot,
                duration: item.duration,
              } as IAnimeEpisode)
          )
        );

        for (let i = 1; i < last_page; i++) {
          animeInfo.episodes.push(...(await this.fetchEpisodes(tempId, i + 1)));
        }
      } else {
        animeInfo.episodes.push(...(await this.fetchEpisodes(tempId, episodePage)));
      }

      return animeInfo;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   *
   * @param episodeId Episode id
   */
  override fetchEpisodeSources = async (episodeId: string): Promise<ISource> => {
    try {
      const { data } = await axios.get(`${this.sgProxy}/${this.baseUrl}/api?m=links&id=${episodeId}`, {
        headers: {
          Referer: `${this.baseUrl}`,
        },
      });

      const links = data.data.map((item: any) => ({
        quality: Object.keys(item)[0],
        iframe: item[Object.keys(item)[0]].kwik,
        size: item[Object.keys(item)[0]].filesize,
        audio: item[Object.keys(item)[0]].audio,
      }));

      //console.log(data.data)

      const iSource: ISource = {
        headers: {
          Referer: 'https://kwik.cx/',
        },
        sources: [],
      };
      for (const link of links) {
        const res = await new Kwik().extract(new URL(link.iframe));
        res[0].quality = link.quality;
        res[0].isDub = link.audio === 'eng';
        res[0].size = link.size;
        iSource.sources.push(res[0]);
      }

      return iSource;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  private fetchEpisodes = async (id: string, page: number): Promise<IAnimeEpisode[]> => {
    const res = await axios.get(
      `${this.sgProxy}/${this.baseUrl}/api?m=release&id=${id}&sort=episode_asc&page=${page}`
    );

    const epData = res.data.data;

    return [
      ...epData.map(
        (item: any): IAnimeEpisode => ({
          id: item.session,
          number: item.episode,
          title: item.title,
          image: item.snapshot,
          duration: item.duration,
        })
      ),
    ] as IAnimeEpisode[];
  };

  /**
   * @deprecated
   * @attention AnimePahe doesn't support this method
   */
  override fetchEpisodeServers = (episodeLink: string): Promise<IEpisodeServer[]> => {
    throw new Error('Method not implemented.');
  };
}

export default AnimePahe;

// (async () => {
//   const animepahe = new AnimePahe();
//
//   const anime = await animepahe.search('Classroom of the elite');
//   const info = await animepahe.fetchAnimeInfo(anime.results[0].id);
//   const sources = await animepahe.fetchEpisodeSources(info.episodes![0].id);
//   console.log(sources);
// })();
