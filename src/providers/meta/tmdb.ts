import axios from 'axios';
import { Console } from 'console';
import { type } from 'os';

import {
  ISearch,
  IAnimeInfo,
  IAnimeResult,
  ISource,
  IEpisodeServer,
  MovieParser,
  TvType,
  IMovieResult,
  IMovieInfo,
  ProxyConfig,
  IMovieEpisode,
} from '../../models';
import { compareTwoStrings } from '../../utils';
import FlixHQ from '../movies/flixhq';

class TMDB extends MovieParser {
  override readonly name = 'TMDB';
  protected override baseUrl = 'https://www.themoviedb.org';
  protected apiUrl = 'https://api.themoviedb.org/3';
  protected override logo = 'https://pbs.twimg.com/profile_images/1243623122089041920/gVZIvphd_400x400.jpg';
  protected override classPath = 'MOVIES.TMDB';
  override supportedTypes = new Set([TvType.MOVIE, TvType.TVSERIES, TvType.ANIME]);

  private provider: MovieParser;

  constructor(
    private apiKey: string = '5201b54eb0968700e693a30576d7d4dc',
    provider?: MovieParser,
    proxyConfig?: ProxyConfig
  ) {
    super('https://api.themoviedb.org/3', proxyConfig);
    this.provider = provider || new FlixHQ();
  }

  /**
   * @param query search query
   * @param page page number
   */
  override search = async (
    query: string,
    page: number = 1
  ): Promise<ISearch<IMovieResult | IAnimeResult>> => {
    const searchUrl = `/search/multi?api_key=${this.apiKey}&language=en-US&page=${page}&include_adult=false&query=${query}`;

    const search: ISearch<IMovieResult | IAnimeResult> = {
      currentPage: 1,
      results: [],
    };

    try {
      const { data } = await this.client.get(searchUrl);

      if (data.results.length < 1) return search;

      data.results.forEach((result: any) => {
        const date = new Date(result?.release_date || result?.first_air_date);

        const movie: IMovieResult = {
          id: result.id,
          title: result?.title || result?.name,
          image: `https://image.tmdb.org/t/p/original${result?.poster_path}`,
          type: result.media_type === 'movie' ? TvType.MOVIE : TvType.TVSERIES,
          rating: result?.vote_average || 0,
          releaseDate: `${date.getFullYear()}` || '0',
        };

        return search.results.push(movie);
      });

      return search;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   * @param id media id (anime or movie/tv)
   * @param type movie or tv
   */
  override fetchMediaInfo = async (mediaId: string, type: string): Promise<IMovieInfo | IAnimeInfo> => {
    type = type.toLowerCase() === 'movie' ? 'movie' : 'tv';
    const infoUrl = `/${type}/${mediaId}?api_key=${this.apiKey}&language=en-US&append_to_response=release_dates,watch/providers,alternative_titles,credits,external_ids,images,keywords,recommendations,reviews,similar,translations,videos&include_image_language=en`;

    const info: IMovieInfo = {
      id: mediaId,
      title: '',
    };

    try {
      const { data } = await this.client.get(infoUrl);

      //get provider id from title and year (if available) to get the correct provider id for the movie/tv series (e.g. flixhq)
      const providerId = await this.findIdFromTitle(data?.title || data?.name, {
        type: type === 'movie' ? TvType.MOVIE : TvType.TVSERIES,
        totalSeasons: data?.number_of_seasons,
        totalEpisodes: data?.number_of_episodes,
        year: new Date(data?.release_year || data?.first_air_date).getFullYear(),
      });

      info.id = (providerId as string) || mediaId;
      info.title = data?.title || data?.name;
      info.image = `https://image.tmdb.org/t/p/original${data?.poster_path}`;
      info.cover = `https://image.tmdb.org/t/p/original${data?.backdrop_path}`;
      info.type = type === 'movie' ? TvType.MOVIE : TvType.TVSERIES;
      info.rating = data?.vote_average || 0;
      info.releaseDate = data?.release_date || data?.first_air_date;
      info.description = data?.overview;
      info.genres = data?.genres.map((genre: any) => genre.name);
      info.duration = data?.runtime || data?.episode_run_time[0];
      info.totalEpisodes = data?.number_of_episodes;
      info.totalSeasons = data?.number_of_seasons as number;
      info.directors = data?.credits?.crew
        .filter((crew: any) => crew.job === 'Director')
        .map((crew: any) => crew.name);
      info.writers = data?.credits?.crew
        .filter((crew: any) => crew.job === 'Screenplay')
        .map((crew: any) => crew.name);
      info.actors = data?.credits?.cast.map((cast: { name: string }) => cast.name);
      info.trailer = {
        id: data?.videos?.results[0]?.key,
        site: data?.videos?.results[0]?.site,
        url: `https://www.youtube.com/watch?v=${data?.videos?.results[0]?.key}`,
      };

      info.similar =
        data?.similar?.results?.length <= 0
          ? undefined
          : data?.similar?.results.map((result: any) => {
              return {
                id: result.id,
                title: result.title || result.name,
                image: `https://image.tmdb.org/t/p/original${result.poster_path}`,
                type: type === 'movie' ? TvType.MOVIE : TvType.TVSERIES,
                rating: result.vote_average || 0,
                releaseDate: result.release_date || result.first_air_date,
              };
            });
      info.recommendations =
        data?.recommendations?.results?.length <= 0
          ? undefined
          : data?.recommendations?.results.map((result: any) => {
              return {
                id: result.id,
                title: result.title || result.name,
                image: `https://image.tmdb.org/t/p/original${result.poster_path}`,
                type: type === 'movie' ? TvType.MOVIE : TvType.TVSERIES,
                rating: result.vote_average || 0,
                releaseDate: result.release_date || result.first_air_date,
              };
            });

      const totalSeasons = (info?.totalSeasons as number) || 0;
      if (type === 'tv' && totalSeasons > 0) {
        const seasonUrl = (season: string) => `/tv/${mediaId}/season/${season}?api_key=${this.apiKey}`;

        info.seasons = [];
        const seasons = info.seasons as any[];

        const InfoFromProvider = await this.provider.fetchMediaInfo(providerId as string);
        const providerEpisodes = InfoFromProvider?.episodes as any[];

        if (providerEpisodes?.length < 1) return info;

        for (let i = 1; i <= totalSeasons; i++) {
          const { data: seasonData } = await this.client.get(seasonUrl(i.toString()));

          //find season in each episode (providerEpisodes)
          const seasonEpisodes = providerEpisodes?.filter(episode => episode.season === i);
          const episodes =
            seasonData?.episodes?.length <= 0
              ? undefined
              : seasonData?.episodes.map((episode: any): IMovieEpisode => {
                  //find episode in each season (seasonEpisodes)
                  const episodeFromProvider = seasonEpisodes?.find(
                    ep => ep.number === episode.episode_number
                  );

                  return {
                    id: episodeFromProvider?.id,
                    title: episode.name,
                    episode: episode.episode_number,
                    season: episode.season_number,
                    releaseDate: episode.air_date,
                    description: episode.overview,
                    url: episodeFromProvider?.url || undefined,
                    img: !episode?.still_path
                      ? undefined
                      : `https://image.tmdb.org/t/p/original${episode.still_path}`,
                  };
                });

          seasons.push({
            season: i,
            image: !seasonData?.poster_path
              ? undefined
              : `https://image.tmdb.org/t/p/original${seasonData.poster_path}`,
            episodes,
          });
        }
      }
    } catch (err) {
      console.log(err);
      throw new Error((err as Error).message);
    }
    info.seasons?.reverse();
    return info;
  };

  /**
   * Find the id of a media from its title. and extra data. (year, totalSeasons, totalEpisodes)
   * @param title
   * @param extraData
   * @returns id of the media
   */
  private findIdFromTitle = async (
    title: string,
    extraData: {
      type: TvType;
      year?: number;
      totalSeasons?: number;
      totalEpisodes?: number;
      [key: string]: any;
    }
  ): Promise<string | undefined> => {
    //clean title
    title = title.replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase();

    const findMedia = (await this.provider.search(title)) as ISearch<IAnimeResult>;
    if (findMedia.results.length === 0) return '';

    // console.log(findMedia.results);
    // console.log(extraData);

    // Sort the retrieved info for more accurate results.
    findMedia.results.sort((a, b) => {
      const targetTitle = title;

      let firstTitle: string;
      let secondTitle: string;

      if (typeof a.title == 'string') firstTitle = a?.title as string;
      else firstTitle = (a?.title as string) ?? '';

      if (typeof b.title == 'string') secondTitle = b.title as string;
      else secondTitle = (b?.title as string) ?? '';

      const firstRating = compareTwoStrings(targetTitle, firstTitle.toLowerCase());
      const secondRating = compareTwoStrings(targetTitle, secondTitle.toLowerCase());

      // Sort in descending order
      return secondRating - firstRating;
    });

    //remove results that dont match the type
    findMedia.results = findMedia.results.filter(result => {
      if (extraData.type === TvType.MOVIE) return (result.type as string) === TvType.MOVIE;
      else if (extraData.type === TvType.TVSERIES) return (result.type as string) === TvType.TVSERIES;
      else return result;
    });

    // if extraData contains a year, filter out the results that don't match the year
    if (extraData && extraData.year && extraData.type === TvType.MOVIE) {
      findMedia.results = findMedia.results.filter(result => {
        return result.releaseDate?.split('-')[0] === extraData.year;
      });
    }

    // console.log({ test1: findMedia.results });

    // check if the result contains the total number of seasons and compare it to the extraData by 1 up or down and make sure that its a number
    if (extraData && extraData.totalSeasons && extraData.type === TvType.TVSERIES) {
      findMedia.results = findMedia.results.filter(result => {
        const totalSeasons = (result.seasons as number) || 0;
        const extraDataSeasons = (extraData.totalSeasons as number) || 0;
        return (
          totalSeasons === extraDataSeasons ||
          totalSeasons === extraDataSeasons + 1 ||
          totalSeasons === extraDataSeasons - 1
        );
      });
    }

    // console.log(findMedia.results);

    return findMedia?.results[0]?.id || undefined;
  };

  /**
   * @param id media id (anime or movie/tv)
   * @param args optional arguments
   */
  override fetchEpisodeSources = async (id: string, ...args: any): Promise<ISource> => {
    return this.provider.fetchEpisodeSources(id, ...args);
  };

  /**
   * @param episodeId episode id
   * @param args optional arguments
   **/
  override fetchEpisodeServers = async (episodeId: string, ...args: any): Promise<IEpisodeServer[]> => {
    return this.provider.fetchEpisodeServers(episodeId, ...args);
  };
}

// (async () => {
//   const tmdb = new TMDB();
//   const search = await tmdb.search('vincenzo');
//   const info = await tmdb.fetchMediaInfo(search.results[0].id, search.results![0].type as string);
//   console.log(info);
//   //const sources = await tmdb.fetchEpisodeSources((info.seasons as any[])![0].episodes![0].id, info.id);
//   // const id = await tmdb.findIdFromTitle('avengers');
//   //console.log(info);
//   // console.log((info?.seasons as any[])![0].episodes);
// })();

export default TMDB;
