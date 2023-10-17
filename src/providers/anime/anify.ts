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

class Anify extends AnimeParser {
  override readonly name = 'anify';
  protected override baseUrl = 'https://api.anify.tv';
  protected override classPath = 'ANIME.Anify';

  /**
   * @param query Search query
   * @param page Page number (optional)
   */
  rawSearch = async (query: string, page: number = 1): Promise<any> => {
    const { data } = await this.client.get(`${this.baseUrl}/search/anime/${query}?page=${page}`);

    return data;
  };
  /**
   * @param query Search query
   * @param page Page number (optional)
   */
  override search = async (query: string, page: number = 1): Promise<ISearch<IAnimeResult>> => {
    const res = {
      currentPage: page,
      hasNextPage: false,
      results: [],
    };

    const { data } = await this.client.get(`${this.baseUrl}/search/anime/${query}?page=${page}`);

    // if (data.currentPage !== res.currentPage) res.hasNextPage = true;

    res.results = data?.map(
      (anime: any): IAnimeResult => ({
        id: anime.id,
        anilistId: anime.id,
        title: anime.title.english ?? anime.title.romaji ?? anime.title.native,
        image: anime.coverImage,
        cover: anime.bannerImage,
        releaseDate: anime.year,
        description: anime.description,
        genres: anime.genres,
        rating: anime.rating.anilist,
        status: anime.status as MediaStatus,
        mappings: anime.mappings,
        type: anime.type as MediaFormat,
      })
    );
    return res;
  };

  /**
   * @param id Anime id
   * @param providerId Provider id (optional) default: gogoanime
   */
  override fetchAnimeInfo = async (
    id: string,
    providerId: '9anime' | 'animepahe' | 'zoro' | 'gogoanime' = 'gogoanime'
  ): Promise<IAnimeInfo> => {
    const animeInfo: IAnimeInfo = {
      id: id,
      title: '',
    };

    const { data } = await this.client.get(`${this.baseUrl}/info/${id}`).catch(() => {
      throw new Error('Anime not found. Please use a valid id!');
    });

    animeInfo.anilistId = data.id;
    animeInfo.title = data.title.english ?? data.title.romaji ?? data.title.native;
    animeInfo.image = data.coverImage;
    animeInfo.cover = data.bannerImage;
    animeInfo.season = data.season;
    animeInfo.releaseDate = data.year;
    animeInfo.duration = data.duration;
    animeInfo.popularity = data.popularity.anilist;
    animeInfo.description = data.description;
    animeInfo.genres = data.genres;
    animeInfo.rating = data.rating.anilist;
    animeInfo.status = data.status as MediaStatus;
    animeInfo.synonyms = data.synonyms;
    animeInfo.mappings = data.mappings;
    animeInfo.type = data.type as MediaFormat;
    animeInfo.artwork = data.artwork as {
      type: 'poster' | 'banner' | 'top_banner' | 'poster' | 'icon' | 'clear_art' | 'clear_logo';
      img: string;
      providerId: 'tvdb' | 'kitsu' | 'anilist';
    }[];

    const providerData = data.episodes.data.filter((e: any) => e.providerId === providerId)[0];

    animeInfo.episodes = providerData.episodes.map(
      (episode: any): IAnimeEpisode => ({
        id: episode.id,
        number: episode.number,
        isFiller: episode.isFiller,
        title: episode.title,
        description: episode.description,
        image: episode.img,
        rating: episode.rating,
      })
    );

    return animeInfo;
  };

  fetchAnimeInfoByIdRaw = async (id: string): Promise<any> => {
    const { data } = await this.client.get(`${this.baseUrl}/info/${id}`).catch(err => {
      throw new Error("Backup api seems to be down! Can't fetch anime info");
    });

    return data;
  };

  /**
   * @param id anilist id
   * @param providerId Provider id (optional) default: gogoanime
   */
  fetchAnimeInfoByAnilistId = async (
    id: string,
    providerId: '9anime' | 'animepahe' | 'zoro' | 'gogoanime' = 'gogoanime'
  ): Promise<IAnimeInfo> => {
    const animeInfo: IAnimeInfo = {
      id: id,
      title: '',
    };
    const { data } = await this.client.get(`${this.baseUrl}/mapping/anilist/${id}`).catch(err => {
      throw new Error(err);
    });

    animeInfo.anilistId = data.id;
    animeInfo.title = data.title.english ?? data.title.romaji ?? data.title.native;
    animeInfo.image = data.coverImage;
    animeInfo.cover = data.bannerImage;
    animeInfo.season = data.season;
    animeInfo.releaseDate = data.year;
    animeInfo.duration = data.duration;
    animeInfo.popularity = data.popularity.anilist;
    animeInfo.description = data.description;
    animeInfo.genres = data.genres;
    animeInfo.rating = data.rating.anilist;
    animeInfo.status = data.status as MediaStatus;
    animeInfo.synonyms = data.synonyms;
    animeInfo.mappings = data.mappings;
    animeInfo.type = data.type as MediaFormat;
    animeInfo.artwork = data.artwork as {
      type: 'poster' | 'banner' | 'top_banner' | 'poster' | 'icon' | 'clear_art' | 'clear_logo';
      img: string;
      providerId: 'tvdb' | 'kitsu' | 'anilist';
    }[];

    const providerData = data.episodes.data.filter((e: any) => e.providerId === providerId)[0];

    animeInfo.episodes = providerData.episodes.map(
      (episode: any): IAnimeEpisode => ({
        id: episode.id.split('/').pop().replace('?ep=', '$episode$')! + 'sub',
        number: episode.number,
        isFiller: episode.isFiller,
        title: episode.title,
        description: episode.description,
        image: episode.img,
        rating: episode.rating,
      })
    );

    return animeInfo;
  };

  /**
   * @deprecated
   * @param id mal id
   */
  fetchAnimeInfoByMalId = async (id: string, type?: 'gogoanime' | 'zoro'): Promise<IAnimeInfo> => {
    const animeInfo: IAnimeInfo = {
      id: id,
      title: '',
    };
    const { data } = await this.client.get(`${this.baseUrl}/mapping/mal/${id}`).catch(err => {
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

  override fetchEpisodeSources = async (
    episodeId: string,
    episodeNumber: number,
    id: number
  ): Promise<ISource> => {
    const { data } = await this.client.get(
      `${this.baseUrl}/sources?providerId=gogoanime&watchId=${episodeId}&episodeNumber=${episodeNumber}&id=${id}&subType=sub&server=gogocdn`
    );

    return data;
  };

  // private fetchSourceFromEpisodeId = async (episodeId: string): Promise<ISource> => {
  //   const res: ISource = {
  //     headers: {},
  //     sources: [],
  //   };

  //   const { data } = await this.client.get(`${this.baseUrl}/episode/${episodeId}`);
  //   const {
  //     data: { url, referer },
  //   } = await this.client.get(`${this.baseUrl}/source/${data.sources[0].id!}`);

  //   res.headers!['Referer'] = referer;

  //   const resResult = await this.client.get(url);
  //   const resolutions = resResult.data.match(/(RESOLUTION=)(.*)(\s*?)(\s*.*)/g);
  //   resolutions.forEach((ress: string) => {
  //     const index = url.lastIndexOf('/');
  //     const quality = ress.split('\n')[0].split('x')[1].split(',')[0];
  //     const urll = url.slice(0, index);
  //     res.sources.push({
  //       url: urll + '/' + ress.split('\n')[1],
  //       isM3U8: (urll + ress.split('\n')[1]).includes('.m3u8'),
  //       quality: quality + 'p',
  //     });
  //   });

  //   res.sources.push({
  //     url: url,
  //     isM3U8: url.includes('.m3u8'),
  //     quality: 'default',
  //   });

  //   return res;
  // };

  // private fetchSourceFromSourceId = async (sourceId: string): Promise<ISource> => {
  //   const res: ISource = {
  //     headers: {},
  //     sources: [],
  //   };

  //   const {
  //     data: { url, referer, subtitle },
  //   } = await this.client.get(`${this.baseUrl}/source/${sourceId}`);

  //   res.headers!['Referer'] = referer;

  //   const resResult = await this.client.get(url).catch(() => {
  //     throw new Error('Source not found');
  //   });
  //   const resolutions = resResult.data.match(/(RESOLUTION=)(.*)(\s*?)(\s*.*)/g);
  //   resolutions.forEach((ress: string) => {
  //     const index = url.lastIndexOf('/');
  //     const quality = ress.split('\n')[0].split('x')[1].split(',')[0];
  //     const urll = url.slice(0, index);
  //     res.sources.push({
  //       url: urll + '/' + ress.split('\n')[1],
  //       isM3U8: (urll + ress.split('\n')[1]).includes('.m3u8'),
  //       quality: quality + 'p',
  //     });
  //   });

  //   res.sources.push({
  //     url: url,
  //     isM3U8: url.includes('.m3u8'),
  //     quality: 'default',
  //   });

  //   if (subtitle) {
  //     res.subtitles = [
  //       {
  //         url: subtitle,
  //         lang: 'English',
  //       },
  //     ];
  //   }

  //   return res;
  // };

  /**
   * @deprecated
   */
  override fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]> {
    throw new Error('Method not implemented.');
  }
}

// (async () => {
//   const anify = new Anify();
//   const anime = await anify.search('One piece');
//   const info = await anify.fetchAnimeInfo(anime.results[0].id, 'zoro');
//   console.log(info);
// })();

export default Anify;
