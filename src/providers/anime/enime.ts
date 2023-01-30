import axios from 'axios';

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
  rawSearch = async (query: string, page: number = 1, perPage: number = 15): Promise<any> => {
    const { data } = await axios.get(`${this.enimeApi}/search/${query}?page=${page}&perPage=${perPage}`);

    return data;
  };
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

  fetchAnimeInfoByIdRaw = async (id: string): Promise<any> => {
    const { data } = await axios.get(`${this.enimeApi}/mapping/anilist/${id}`).catch(err => {
      throw new Error("Backup api seems to be down! Can't fetch anime info");
    });

    return data;
  };

  /**
   * @param id anilist id
   */
  fetchAnimeInfoByAnilistId = async (
    id: string,
    type: 'gogoanime' | 'zoro' = 'gogoanime'
  ): Promise<IAnimeInfo> => {
    const animeInfo: IAnimeInfo = {
      id: id,
      title: '',
    };
    const { data } = await axios.get(`${this.enimeApi}/mapping/anilist/${id}`).catch(err => {
      throw new Error(err);
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
    animeInfo.mappings = data.mappings;

    data.episodes = data.episodes.sort((a: any, b: any) => b.number - a.number);

    let useType: 'zoro' | 'gogoanime' | undefined = undefined;
    if (
      type == 'gogoanime' &&
      data.episodes.every((e: any) => e.sources.find((s: any) => s.target.includes('episode')))
    )
      useType = 'gogoanime';
    else if (
      type == 'zoro' &&
      data.episodes.every((e: any) => e.sources.find((s: any) => s.target.includes('?ep=')))
    )
      useType = 'zoro';
    else throw new Error('Anime not found on Enime');

    animeInfo.episodes = data.episodes.map(
      (episode: any): IAnimeEpisode => ({
        id: episode.id,
        slug: episode.sources
          .find((source: any) =>
            useType === 'zoro' ? source.target.includes('?ep=') : source.target.includes('episode')
          )
          ?.target.split('/')
          .pop()
          .replace('?ep=', '$episode$')
          ?.concat(useType === 'zoro' ? '$sub' : '')!,
        description: episode.description,
        number: episode.number,
        title: episode.title,
        image: episode?.image ?? animeInfo.image,
        airDate: episode.airedAt,
      })
    );

    return animeInfo;
  };

  /**
   * @param id mal id
   */
  fetchAnimeInfoByMalId = async (id: string, type?: 'gogoanime' | 'zoro'): Promise<IAnimeInfo> => {
    const animeInfo: IAnimeInfo = {
      id: id,
      title: '',
    };
    const { data } = await axios.get(`${this.enimeApi}/mapping/mal/${id}`).catch(err => {
      throw new Error(err);
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

    let useType: 'zoro' | 'gogoanime' | undefined = undefined;
    if (
      type == 'gogoanime' &&
      data.episodes.every((e: any) => e.sources.find((s: any) => s.target.includes('episode')))
    )
      useType = 'gogoanime';
    else if (
      type == 'zoro' &&
      data.episodes.every((e: any) => e.sources.find((s: any) => s.target.includes('?ep=')))
    )
      useType = 'zoro';
    else throw new Error('Anime not found on Enime');

    animeInfo.episodes = data.episodes.map(
      (episode: any): IAnimeEpisode => ({
        id: episode.id,
        slug: episode.sources
          .find((source: any) =>
            useType === 'zoro' ? source.target.includes('?ep=') : source.target.includes('episode')
          )
          ?.target.split('/')
          .pop()
          .replace('?ep=', '$episode$')
          ?.concat(useType === 'zoro' ? '$sub' : '')!,
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

    const resResult = await axios.get(url);
    const resolutions = resResult.data.match(/(RESOLUTION=)(.*)(\s*?)(\s*.*)/g);
    resolutions.forEach((ress: string) => {
      const index = url.lastIndexOf('/');
      const quality = ress.split('\n')[0].split('x')[1].split(',')[0];
      const urll = url.slice(0, index);
      res.sources.push({
        url: urll + '/' + ress.split('\n')[1],
        isM3U8: (urll + ress.split('\n')[1]).includes('.m3u8'),
        quality: quality + 'p',
      });
    });

    res.sources.push({
      url: url,
      isM3U8: url.includes('.m3u8'),
      quality: 'default',
    });

    return res;
  };

  private fetchSourceFromSourceId = async (sourceId: string): Promise<ISource> => {
    const res: ISource = {
      headers: {},
      sources: [],
    };

    const {
      data: { url, referer, subtitle },
    } = await axios.get(`${this.enimeApi}/source/${sourceId}`);

    res.headers!['Referer'] = referer;

    const resResult = await axios.get(url).catch(() => {
      throw new Error('Source not found');
    });
    const resolutions = resResult.data.match(/(RESOLUTION=)(.*)(\s*?)(\s*.*)/g);
    resolutions.forEach((ress: string) => {
      const index = url.lastIndexOf('/');
      const quality = ress.split('\n')[0].split('x')[1].split(',')[0];
      const urll = url.slice(0, index);
      res.sources.push({
        url: urll + '/' + ress.split('\n')[1],
        isM3U8: (urll + ress.split('\n')[1]).includes('.m3u8'),
        quality: quality + 'p',
      });
    });

    res.sources.push({
      url: url,
      isM3U8: url.includes('.m3u8'),
      quality: 'default',
    });

    if (subtitle) {
      res.subtitles = [
        {
          url: subtitle,
          lang: 'English',
        },
      ];
    }

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
