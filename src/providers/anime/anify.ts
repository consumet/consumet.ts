import {
  AnimeParser,
  ISearch,
  IAnimeInfo,
  MediaStatus,
  IAnimeResult,
  ISource,
  IEpisodeServer,
  IAnimeEpisode,
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

    animeInfo.anilistId = data.mappings.find((m: any) => m.providerId === 'anilist').id;
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

    animeInfo.anilistId = data.mappings.find((m: any) => m.providerId === 'anilist').id;
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

  override fetchEpisodeSources = async (
    episodeId: string,
    episodeNumber: number,
    id: string
  ): Promise<ISource> => {
    const { data } = await this.client.get(
      `${this.baseUrl}/sources?providerId=gogoanime&watchId=${episodeId}&episodeNumber=${episodeNumber}&id=${id}&subType=sub&server=gogocdn`
    );

    return data;
  };

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
