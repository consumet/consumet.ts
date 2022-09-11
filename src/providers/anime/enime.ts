import axios from 'axios';
import { load } from 'cheerio';
import anime from '.';

import {
  AnimeParser,
  ISearch,
  IAnimeInfo,
  MediaStatus,
  IAnimeResult,
  ISource,
  IEpisodeServer,
  IAnimeEpisode,
  IVideo,
  MediaFormat,
} from '../../models';

class Enime extends AnimeParser {
  override readonly name = 'Enime';
  protected override baseUrl = 'https://enime.moe';
  protected override logo = 'https://enime.moe/favicon.ico';
  protected override classPath = 'ANIME.Enime';

  private readonly enimeApi = 'https://api.enime.moe';

  /**
   * @param query Search query
   * @param page Page number (optional)
   */
  override search = async (
    query: string,
    page: number = 1,
    perPage: number = 15
  ): Promise<ISearch<IAnimeResult>> => {
    const res = {
      currentPage: page,
      hasNextPage: false,
      results: [],
    };

    const { data } = await axios.get(`${this.enimeApi}/search/${query}?page=${page}&perPage=${perPage}`);

    if (data.currentPage !== res.currentPage) res.hasNextPage = true;

    res.results = data.data.map((anime: any) => ({
      id: anime.id,
      anilistId: anime.anilistId,
      malId: anime.mappings.mal,
      title: anime.title.english ?? anime.title.romaji ?? anime.title.native,
      image: anime.coverImage,
      cover: anime.bannerImage,
      releaseDate: anime.year,
      description: anime.description,
      genres: anime.genre,
      rating: anime.averageScore,
      status: anime.status as MediaStatus,
      mappings: anime.mappings,
      type: anime.format as MediaFormat,
    }));
    return res;
  };

  /**
   * @param id Anime id
   */
  override fetchAnimeInfo = async (id: string): Promise<IAnimeInfo> => {
    const animeInfo: IAnimeInfo = {
      id: id,
      title: '',
    };

    const { data } = await axios.get(`${this.enimeApi}/anime/${id}`).catch(() => {
      throw new Error('Anime not found');
    });

    animeInfo.anilistId = data.anilistId;
    animeInfo.malId = data.mappings.mal;
    animeInfo.title = data.title.english ?? data.title.romaji ?? data.title.native;
    animeInfo.image = data.coverImage;
    animeInfo.cover = data.bannerImage;
    animeInfo.season = data.season;
    animeInfo.releaseDate = data.year;
    animeInfo.duration = data.duration;
    animeInfo.popularity = data.popularity;
    animeInfo.description = data.description;
    animeInfo.genres = data.genre;
    animeInfo.rating = data.averageScore;
    animeInfo.status = data.status as MediaStatus;
    animeInfo.synonyms = data.synonyms;
    animeInfo.mappings = data.mappings;
    animeInfo.type = data.format as MediaFormat;

    data.episodes = data.episodes.sort((a: any, b: any) => b.number - a.number);
    animeInfo.episodes = data.episodes.map(
      (episode: any): IAnimeEpisode => ({
        id: episode.id,
        number: episode.number,
        title: episode.title,
      })
    );

    return animeInfo;
  };

  /**
   * @param id anilist id
   */
  fetchAnimeInfoByAnilistId = async (id: string): Promise<IAnimeInfo> => {
    const animeInfo: IAnimeInfo = {
      id: id,
      title: '',
    };

    const { data } = await axios.get(`${this.enimeApi}/mapping/anilist/${id}`).catch(() => {
      throw new Error('Anime not found');
    });

    animeInfo.anilistId = data.anilistId;
    animeInfo.malId = data.mappings.mal;
    animeInfo.title = data.title.english ?? data.title.romaji ?? data.title.native;
    animeInfo.image = data.coverImage;
    animeInfo.cover = data.bannerImage;
    animeInfo.season = data.season;
    animeInfo.releaseDate = data.year;
    animeInfo.duration = data.duration;
    animeInfo.popularity = data.popularity;
    animeInfo.description = data.description;
    animeInfo.genres = data.genre;
    animeInfo.rating = data.averageScore;
    animeInfo.status = data.status as MediaStatus;
    animeInfo.synonyms = data.synonyms;
    animeInfo.mappings = data.mappings;
    animeInfo.type = data.format as MediaFormat;

    data.episodes = data.episodes.sort((a: any, b: any) => b.number - a.number);

    animeInfo.episodes = data.episodes.map(
      (episode: any): IAnimeEpisode => ({
        id: episode.id,
        slug: episode.sources
          .find((source: any) => source.target.includes('?ep='))
          ?.target.split('/')
          .pop()
          .replace('?ep=', '$episode$')!,
        description: episode.description,
        number: episode.number,
        title: episode.title,
        image: episode?.image ?? animeInfo.image,
      })
    );

    return animeInfo;
  };

  override fetchEpisodeSources = async (episodeId: string, ...args: any): Promise<ISource> => {
    if (episodeId.includes('enime')) return this.fetchSourceFromSourceId(episodeId.replace('-enime', ''));
    return this.fetchSourceFromEpisodeId(episodeId);
  };

  private fetchSourceFromEpisodeId = async (episodeId: string): Promise<ISource> => {
    const res: ISource = {
      headers: {},
      sources: [],
    };

    const { data } = await axios.get(`${this.enimeApi}/episode/${episodeId}`);
    const {
      data: { url, referer },
    } = await axios.get(`${this.enimeApi}/source/${data.sources[0].id!}`);

    res.headers!['Referer'] = referer;
    res.sources.push({
      url: url,
      isM3U8: url.includes('.m3u8'),
    });

    return res;
  };

  private fetchSourceFromSourceId = async (sourceId: string): Promise<ISource> => {
    const res: ISource = {
      headers: {},
      sources: [],
    };

    const {
      data: { url, referer },
    } = await axios.get(`${this.enimeApi}/source/${sourceId}`);

    res.headers!['Referer'] = referer;
    res.sources.push({
      url: url,
      isM3U8: url.includes('.m3u8'),
    });

    return res;
  };

  /**
   * @deprecated
   */
  override fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]> {
    throw new Error('Method not implemented.');
  }
}

export default Enime;
