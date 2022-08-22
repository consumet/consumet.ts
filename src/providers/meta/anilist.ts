import axios from 'axios';

import {
  AnimeParser,
  ISearch,
  IAnimeInfo,
  MediaStatus,
  IAnimeResult,
  ISource,
  IAnimeEpisode,
  SubOrSub,
  IEpisodeServer,
  Genres,
  MangaParser,
  IMangaChapterPage,
  IMangaInfo,
} from '../../models';
import {
  anilistSearchQuery,
  anilistMediaDetailQuery,
  kitsuSearchQuery,
  anilistTrendingAnimeQuery,
  anilistPopularAnimeQuery,
  anilistAiringScheduleQuery,
  anilistGenresQuery,
  anilistAdvancedQuery,
  anilistSiteStatisticsQuery,
} from '../../utils';
import Gogoanime from '../../providers/anime/gogoanime';
import Enime from '../anime/enime';
import MangaDex from '../manga/mangadex';
import Zoro from '../anime/zoro';

class Anilist extends AnimeParser {
  override readonly name = 'Anilist';
  protected override baseUrl = 'https://anilist.co';
  protected override logo = 'https://upload.wikimedia.org/wikipedia/commons/6/61/AniList_logo.svg';
  protected override classPath = 'META.Anilist';

  private readonly anilistGraphqlUrl = 'https://graphql.anilist.co';
  private readonly kitsuGraphqlUrl = 'https://kitsu.io/api/graphql';
  private readonly malSyncUrl = 'https://api.malsync.moe';
  private readonly enimeUrl = 'https://api.enime.moe';
  provider: AnimeParser;

  /**
   * This class maps anilist to kitsu with any other anime provider.
   * kitsu is used for episode images, titles and description.
   * @param provider anime provider (optional) default: Gogoanime
   */
  constructor(provider?: AnimeParser) {
    super();
    this.provider = provider || new Gogoanime();
  }

  /**
   * @param query Search query
   * @param page Page number (optional)
   * @param perPage Number of results per page (optional) (default: 15) (max: 50)
   */
  override search = async (
    query: string,
    page: number = 1,
    perPage: number = 15
  ): Promise<ISearch<IAnimeResult>> => {
    const options = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      query: anilistSearchQuery(query, page, perPage),
    };

    try {
      const { data } = await axios.post(this.anilistGraphqlUrl, options);

      const res: ISearch<IAnimeResult> = {
        currentPage: data.data.Page.pageInfo.currentPage,
        hasNextPage: data.data.Page.pageInfo.hasNextPage,
        results: data.data.Page.media.map((item: any) => ({
          id: item.id.toString(),
          malId: item.idMal,
          title:
            {
              romaji: item.title.romaji,
              english: item.title.english,
              native: item.title.native,
              userPreferred: item.title.userPreferred,
            } || item.title.romaji,
          status:
            item.status == 'RELEASING'
              ? MediaStatus.ONGOING
              : item.status == 'FINISHED'
              ? MediaStatus.COMPLETED
              : item.status == 'NOT_YET_RELEASED'
              ? MediaStatus.NOT_YET_AIRED
              : item.status == 'CANCELLED'
              ? MediaStatus.CANCELLED
              : item.status == 'HIATUS'
              ? MediaStatus.HIATUS
              : MediaStatus.UNKNOWN,
          image: item.coverImage.extraLarge ?? item.coverImage.large ?? item.coverImage.medium,
          rating: item.averageScore,
          format: item.format,
          releaseDate: item.seasonYear,
        })),
      };

      return res;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   *
   * @param query Search query (optional)
   * @param type Media type (optional) (default: `ANIME`) (options: `ANIME`, `MANGA`)
   * @param page Page number (optional)
   * @param perPage Number of results per page (optional) (default: `20`) (max: `50`)
   * @param format Format (optional) (options: `TV`, `TV_SHORT`, `MOVIE`, `SPECIAL`, `OVA`, `ONA`, `MUSIC`)
   * @param sort Sort (optional) (Default: `[POPULARITY_DESC, SCORE_DESC]`) (options: `POPULARITY_DESC`, `POPULARITY`, `TRENDING_DESC`, `TRENDING`, `UPDATED_AT_DESC`, `UPDATED_AT`, `START_DATE_DESC`, `START_DATE`, `END_DATE_DESC`, `END_DATE`, `FAVOURITES_DESC`, `FAVOURITES`, `SCORE_DESC`, `SCORE`, `TITLE_ROMAJI_DESC`, `TITLE_ROMAJI`, `TITLE_ENGLISH_DESC`, `TITLE_ENGLISH`, `TITLE_NATIVE_DESC`, `TITLE_NATIVE`, `EPISODES_DESC`, `EPISODES`, `ID`, `ID_DESC`)
   * @param genres Genres (optional) (options: `Action`, `Adventure`, `Cars`, `Comedy`, `Drama`, `Fantasy`, `Horror`, `Mahou Shoujo`, `Mecha`, `Music`, `Mystery`, `Psychological`, `Romance`, `Sci-Fi`, `Slice of Life`, `Sports`, `Supernatural`, `Thriller`)
   * @param id anilist Id (optional)
   */
  advancedSearch = async (
    query?: string,
    type: string = 'ANIME',
    page: number = 1,
    perPage: number = 20,
    format?: string,
    sort?: string[],
    genres?: Genres[] | string[],
    id?: string | number
  ): Promise<ISearch<IAnimeResult>> => {
    const options = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      query: anilistAdvancedQuery(),
      variables: {
        search: query,
        type: type,
        page: page,
        size: perPage,
        format: format,
        sort: sort,
        genres: genres,
        id: id,
      },
    };

    if (genres) {
      genres.forEach(genre => {
        if (!Object.values(Genres).includes(genre as Genres)) {
          throw new Error(`genre ${genre} is not valid`);
        }
      });
    }

    try {
      const { data } = await axios.post(this.anilistGraphqlUrl, options);

      const res: ISearch<IAnimeResult> = {
        currentPage: data.data.Page.pageInfo.currentPage,
        hasNextPage: data.data.Page.pageInfo.hasNextPage,
        totalPages: data.data.Page.pageInfo.lastPage,
        totalResults: data.data.Page.pageInfo.total,
        results: data.data.Page.media.map((item: any) => ({
          id: item.id.toString(),
          malId: item.idMal,
          title:
            {
              romaji: item.title.romaji,
              english: item.title.english,
              native: item.title.native,
              userPreferred: item.title.userPreferred,
            } || item.title.romaji,
          status:
            item.status == 'RELEASING'
              ? MediaStatus.ONGOING
              : item.status == 'FINISHED'
              ? MediaStatus.COMPLETED
              : item.status == 'NOT_YET_RELEASED'
              ? MediaStatus.NOT_YET_AIRED
              : item.status == 'CANCELLED'
              ? MediaStatus.CANCELLED
              : item.status == 'HIATUS'
              ? MediaStatus.HIATUS
              : MediaStatus.UNKNOWN,
          image: item.coverImage.extraLarge ?? item.coverImage.large ?? item.coverImage.medium,
          rating: item.averageScore,
          format: item.format,
          releaseDate: item.seasonYear,
        })),
      };

      return res;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   *
   * @param id Anime id
   * @param dub to get dubbed episodes (optional) set to `true` to get dubbed episodes. **ONLY WORKS FOR GOGOANIME**
   */
  override fetchAnimeInfo = async (id: string, dub: boolean = false): Promise<IAnimeInfo> => {
    const animeInfo: IAnimeInfo = {
      id: id,
      title: '',
    };

    const options = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      query: anilistMediaDetailQuery(id),
    };

    try {
      const { data } = await axios.post(this.anilistGraphqlUrl, options).catch(() => {
        throw new Error('Media not found');
      });
      animeInfo.malId = data.data.Media.idMal;
      animeInfo.title = {
        romaji: data.data.Media.title.romaji,
        english: data.data.Media.title.english,
        native: data.data.Media.title.native,
        userPreferred: data.data.Media.title.userPreferred,
      };

      if (data.data.Media.trailer?.id) {
        animeInfo.trailer = {
          id: data.data.Media.trailer?.id,
          site: data.data.Media.trailer?.site,
          thumbnail: data.data.Media.trailer?.thumbnail,
        };
      }
      animeInfo.image =
        data.data.Media.coverImage.extraLarge ??
        data.data.Media.coverImage.large ??
        data.data.Media.coverImage.medium;

      animeInfo.color = data.data.Media.coverImage?.color;

      animeInfo.cover = data.data.Media.bannerImage ?? animeInfo.image;
      animeInfo.description = data.data.Media.description;
      switch (data.data.Media.status) {
        case 'RELEASING':
          animeInfo.status = MediaStatus.ONGOING;
          break;
        case 'FINISHED':
          animeInfo.status = MediaStatus.COMPLETED;
          break;
        case 'NOT_YET_RELEASED':
          animeInfo.status = MediaStatus.NOT_YET_AIRED;
          break;
        case 'CANCELLED':
          animeInfo.status = MediaStatus.CANCELLED;
          break;
        case 'HIATUS':
          animeInfo.status = MediaStatus.HIATUS;
        default:
          animeInfo.status = MediaStatus.UNKNOWN;
      }
      animeInfo.releaseDate = data.data.Media.startDate.year;
      if (data.data.Media.nextAiringEpisode?.airingAt)
        animeInfo.nextAiringEpisode = {
          airingTime: data.data.Media.nextAiringEpisode?.airingAt,
          timeUntilAiring: data.data.Media.nextAiringEpisode?.timeUntilAiring,
          episode: data.data.Media.nextAiringEpisode?.episode,
        };
      animeInfo.rating = data.data.Media.averageScore;
      animeInfo.duration = data.data.Media.duration;
      animeInfo.genres = data.data.Media.genres;
      animeInfo.studios = data.data.Media.studios.edges.map((item: any) => item.node.name);
      animeInfo.subOrDub = dub ? SubOrSub.DUB : SubOrSub.SUB;
      animeInfo.recommendations = data.data.Media.recommendations.edges.map((item: any) => ({
        id: item.node.mediaRecommendation.id,
        malId: item.node.mediaRecommendation.idMal,
        title: {
          romaji: item.node.mediaRecommendation.title.romaji,
          english: item.node.mediaRecommendation.title.english,
          native: item.node.mediaRecommendation.title.native,
          userPreferred: item.node.mediaRecommendation.title.userPreferred,
        },
        status:
          item.node.mediaRecommendation.status == 'RELEASING'
            ? MediaStatus.ONGOING
            : item.node.mediaRecommendation.status == 'FINISHED'
            ? MediaStatus.COMPLETED
            : item.node.mediaRecommendation.status == 'NOT_YET_RELEASED'
            ? MediaStatus.NOT_YET_AIRED
            : item.node.mediaRecommendation.status == 'CANCELLED'
            ? MediaStatus.CANCELLED
            : item.node.mediaRecommendation.status == 'HIATUS'
            ? MediaStatus.HIATUS
            : MediaStatus.UNKNOWN,
        episodes: item.node.mediaRecommendation.episodes,
        image:
          item.node.mediaRecommendation.coverImage.extraLarge ??
          item.node.mediaRecommendation.coverImage.large ??
          item.node.mediaRecommendation.coverImage.medium,
        cover:
          item.node.mediaRecommendation.bannerImage ??
          item.node.mediaRecommendation.coverImage.extraLarge ??
          item.node.mediaRecommendation.coverImage.large ??
          item.node.mediaRecommendation.coverImage.medium,
        score: item.node.mediaRecommendation.meanScore,
      }));

      if (
        this.provider instanceof Zoro &&
        !dub &&
        (animeInfo.status === MediaStatus.ONGOING || parseInt(animeInfo.releaseDate!) === 2022)
      ) {
        try {
          animeInfo.episodes = (await new Enime().fetchAnimeInfoByAnilistId(id)).episodes?.map(
            (item: any) => ({
              id: item.slug,
              title: item.title,
              number: item.number,
              image: item.image,
            })
          );
          animeInfo.episodes?.reverse();
        } catch (err) {
          animeInfo.episodes = await this.fetchDefaultEpisodeList(
            {
              idMal: animeInfo.malId! as number,
              season: data.data.Media.season,
              startDate: { year: parseInt(animeInfo.releaseDate!) },
              title: { english: animeInfo.title?.english!, romaji: animeInfo.title?.romaji! },
            },
            dub,
            id
          );

          animeInfo.episodes = animeInfo.episodes?.map((episode: IAnimeEpisode) => {
            if (!episode.image) episode.image = animeInfo.image;

            return episode;
          });

          return animeInfo;
        }
      } else
        animeInfo.episodes = await this.fetchDefaultEpisodeList(
          {
            idMal: animeInfo.malId! as number,
            season: data.data.Media.season,
            startDate: { year: parseInt(animeInfo.releaseDate!) },
            title: { english: animeInfo.title?.english!, romaji: animeInfo.title?.romaji! },
          },
          dub,
          id
        );

      animeInfo.episodes = animeInfo.episodes?.map((episode: IAnimeEpisode) => {
        if (!episode.image) episode.image = animeInfo.image;

        return episode;
      });

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
    if (episodeId.includes('enime')) return new Enime().fetchEpisodeSources(episodeId);
    return this.provider.fetchEpisodeSources(episodeId);
  };

  /**
   *
   * @param episodeId Episode id
   */
  override fetchEpisodeServers = async (episodeId: string): Promise<IEpisodeServer[]> => {
    return this.provider.fetchEpisodeServers(episodeId);
  };

  private findAnime = async (
    title: { romaji: string; english: string },
    season: string,
    startDate: number,
    malId: number,
    dub: boolean,
    anilistId: string
  ): Promise<IAnimeEpisode[]> => {
    title.english = title.english ?? title.romaji;
    title.romaji = title.romaji ?? title.english;

    title.english = title.english.toLowerCase();
    title.romaji = title.romaji.toLowerCase();

    if (title.english === title.romaji) {
      return await this.findAnimeSlug(title.english, season, startDate, malId, dub, anilistId);
    }

    const romajiPossibleEpisodes = this.findAnimeSlug(title.romaji, season, startDate, malId, dub, anilistId);

    if (romajiPossibleEpisodes) {
      return romajiPossibleEpisodes;
    }

    const englishPossibleEpisodes = this.findAnimeSlug(
      title.english,
      season,
      startDate,
      malId,
      dub,
      anilistId
    );
    return englishPossibleEpisodes;
  };

  private findAnimeSlug = async (
    title: string,
    season: string,
    startDate: number,
    malId: number,
    dub: boolean,
    anilistId: string
  ): Promise<IAnimeEpisode[]> => {
    if (this.provider instanceof Enime)
      return (await this.provider.fetchAnimeInfoByAnilistId(anilistId)).episodes!;

    const slug = title.replace(/[^0-9a-zA-Z]+/g, ' ');

    let possibleAnime: any;

    if (malId) {
      const malAsyncReq = await axios({
        method: 'GET',
        url: `${this.malSyncUrl}/mal/anime/${malId}`,
        validateStatus: () => true,
      });

      if (malAsyncReq.status === 200) {
        const sitesT = malAsyncReq.data.Sites as {
          [k: string]: { [k: string]: { url: string; page: string; title: string } };
        };
        let sites = Object.values(sitesT).map((v, i) => {
          const obj = [...Object.values(Object.values(sitesT)[i])];
          const pages = obj.map(v => ({ page: v.page, url: v.url, title: v.title }));
          return pages;
        }) as any[];

        sites = sites.flat();

        const possibleSource = sites.find(
          s =>
            s.page.toLowerCase() === this.provider.name.toLowerCase() &&
            (dub ? s.title.toLowerCase().includes('dub') : !s.title.toLowerCase().includes('dub'))
        );

        if (possibleSource)
          possibleAnime = await this.provider.fetchAnimeInfo(possibleSource.url.split('/').pop()!);
        else possibleAnime = await this.findAnimeRaw(slug);
      } else possibleAnime = await this.findAnimeRaw(slug);
    } else possibleAnime = await this.findAnimeRaw(slug);

    const possibleProviderEpisodes = possibleAnime.episodes;

    const options = {
      headers: { 'Content-Type': 'application/json' },
      query: kitsuSearchQuery(slug),
    };

    const newEpisodeList = await this.findKitsuAnime(possibleProviderEpisodes, options, season, startDate);

    return newEpisodeList;
  };

  private findKitsuAnime = async (
    possibleProviderEpisodes: IAnimeEpisode[],
    options: {},
    season?: string,
    startDate?: number
  ) => {
    const kitsuEpisodes = await axios.post(this.kitsuGraphqlUrl, options);
    const episodesList = new Map();
    if (kitsuEpisodes?.data.data) {
      const { nodes } = kitsuEpisodes.data.data.searchAnimeByTitle;

      if (nodes) {
        nodes.forEach((node: any) => {
          if (node.season === season && node.startDate.trim().split('-')[0] === startDate?.toString()) {
            const episodes = node.episodes.nodes;

            for (const episode of episodes) {
              const i = episode?.number.toString().replace(/"/g, '');
              let name = undefined;
              let description = undefined;
              let thumbnail = undefined;

              if (episode?.description?.en)
                description = episode?.description.en.toString().replace(/"/g, '').replace('\\n', '\n');
              if (episode?.thumbnail)
                thumbnail = episode?.thumbnail.original.url.toString().replace(/"/g, '');

              if (episode) {
                if (episode.titles?.canonical) name = episode.titles.canonical.toString().replace(/"/g, '');
                episodesList.set(i, {
                  episodeNum: episode?.number.toString().replace(/"/g, ''),
                  title: name,
                  description,
                  thumbnail,
                });
                continue;
              }
              episodesList.set(i, {
                episodeNum: undefined,
                title: undefined,
                description: undefined,
                thumbnail,
              });
            }
          }
        });
      }
    }

    const newEpisodeList: IAnimeEpisode[] = [];
    if (possibleProviderEpisodes?.length !== 0) {
      possibleProviderEpisodes?.forEach((ep: any, i: any) => {
        const j = (i + 1).toString();
        newEpisodeList.push({
          id: ep.id as string,
          title: episodesList.get(j)?.title ?? null,
          image: episodesList.get(j)?.thumbnail ?? null,
          number: ep.number as number,
          description: episodesList.get(j)?.description ?? null,
          url: (ep.url as string) ?? null,
        });
      });
    }

    return newEpisodeList;
  };

  /**
   * @param page page number to search for (optional)
   * @param perPage number of results per page (optional)
   */
  fetchTrendingAnime = async (page: number = 1, perPage: number = 10): Promise<ISearch<IAnimeResult>> => {
    const options = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      query: anilistTrendingAnimeQuery(page, perPage),
    };

    try {
      const { data } = await axios.post(this.anilistGraphqlUrl, options);

      const res: ISearch<IAnimeResult> = {
        currentPage: data.data.Page.pageInfo.currentPage,
        hasNextPage: data.data.Page.pageInfo.hasNextPage,
        results: data.data.Page.media.map((item: any) => ({
          id: item.id.toString(),
          malId: item.idMal,
          title:
            {
              romaji: item.title.romaji,
              english: item.title.english,
              native: item.title.native,
              userPreferred: item.title.userPreferred,
            } || item.title.romaji,
          image: item.coverImage.extraLarge ?? item.coverImage.large ?? item.coverImage.medium,
          trailer: {
            id: item.trailer?.id,
            site: item.trailer?.site,
            thumbnail: item.trailer?.thumbnail,
          },
          description: item.description,
          status:
            item.status == 'RELEASING'
              ? MediaStatus.ONGOING
              : item.status == 'FINISHED'
              ? MediaStatus.COMPLETED
              : item.status == 'NOT_YET_RELEASED'
              ? MediaStatus.NOT_YET_AIRED
              : item.status == 'CANCELLED'
              ? MediaStatus.CANCELLED
              : item.status == 'HIATUS'
              ? MediaStatus.HIATUS
              : MediaStatus.UNKNOWN,
          cover:
            item.bannerImage ?? item.coverImage.extraLarge ?? item.coverImage.large ?? item.coverImage.medium,
          rating: item.averageScore,
          releaseDate: item.seasonYear,
          genres: item.genres,
          totalEpisodes: isNaN(item.episodes) ? 0 : item.episodes ?? item.nextAiringEpisode?.episode - 1 ?? 0,
          duration: item.duration,
          type: item.format,
        })),
      };
      return res;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   *
   * @param page page number to search for (optional)
   * @param perPage number of results per page (optional)
   */
  fetchPopularAnime = async (page: number = 1, perPage: number = 10): Promise<ISearch<IAnimeResult>> => {
    const options = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      query: anilistPopularAnimeQuery(page, perPage),
    };

    try {
      const { data } = await axios.post(this.anilistGraphqlUrl, options);

      const res: ISearch<IAnimeResult> = {
        currentPage: data.data.Page.pageInfo.currentPage,
        hasNextPage: data.data.Page.pageInfo.hasNextPage,
        results: data.data.Page.media.map((item: any) => ({
          id: item.id.toString(),
          malId: item.idMal,
          title:
            {
              romaji: item.title.romaji,
              english: item.title.english,
              native: item.title.native,
              userPreferred: item.title.userPreferred,
            } || item.title.romaji,
          image: item.coverImage.extraLarge ?? item.coverImage.large ?? item.coverImage.medium,
          trailer: {
            id: item.trailer?.id,
            site: item.trailer?.site,
            thumbnail: item.trailer?.thumbnail,
          },
          description: item.description,
          status:
            item.status == 'RELEASING'
              ? MediaStatus.ONGOING
              : item.status == 'FINISHED'
              ? MediaStatus.COMPLETED
              : item.status == 'NOT_YET_RELEASED'
              ? MediaStatus.NOT_YET_AIRED
              : item.status == 'CANCELLED'
              ? MediaStatus.CANCELLED
              : item.status == 'HIATUS'
              ? MediaStatus.HIATUS
              : MediaStatus.UNKNOWN,
          cover:
            item.bannerImage ?? item.coverImage.extraLarge ?? item.coverImage.large ?? item.coverImage.medium,
          rating: item.averageScore,
          releaseDate: item.seasonYear,
          genres: item.genres,
          totalEpisodes: isNaN(item.episodes) ? 0 : item.episodes ?? item.nextAiringEpisode?.episode - 1 ?? 0,
          duration: item.duration,
          type: item.format,
        })),
      };
      return res;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   *
   * @param page page number (optional)
   * @param perPage number of results per page (optional)
   * @param weekStart Filter by the time in epoch seconds (optional) eg. if you set weekStart to this week's monday, and set weekEnd to next week's sunday, you will get all the airing anime in between these two dates.
   * @param weekEnd Filter by the time in epoch seconds (optional)
   * @param notYetAired if true will return anime that have not yet aired (optional)
   * @returns the next airing episodes
   */
  fetchAiringSchedule = async (
    page: number = 1,
    perPage: number = 20,
    weekStart: number = Math.floor(
      new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)).getTime() / 1000
    ),
    weekEnd: number = Math.floor(
      (new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)).getTime() + 6.048e8) /
        1000
    ),
    notYetAired: boolean = false
  ): Promise<ISearch<IAnimeResult>> => {
    const options = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      query: anilistAiringScheduleQuery(page, perPage, weekStart, weekEnd, notYetAired),
    };

    try {
      const { data } = await axios.post(this.anilistGraphqlUrl, options);

      const res: ISearch<IAnimeResult> = {
        currentPage: data.data.Page.pageInfo.currentPage,
        hasNextPage: data.data.Page.pageInfo.hasNextPage,
        results: data.data.Page.airingSchedules.map((item: any) => ({
          id: item.media.id.toString(),
          malId: item.media.idMal,
          episode: item.episode,
          airingAt: item.airingAt,
          title:
            {
              romaji: item.media.title.romaji,
              english: item.media.title.english,
              native: item.media.title.native,
              userPreferred: item.media.title.userPreferred,
            } || item.media.title.romaji,
          country: item.media.countryOfOrigin,
          image:
            item.media.coverImage.extraLarge ?? item.media.coverImage.large ?? item.media.coverImage.medium,
          description: item.media.description,
          cover:
            item.media.bannerImage ??
            item.media.coverImage.extraLarge ??
            item.media.coverImage.large ??
            item.media.coverImage.medium,
          genres: item.genres,
          rating: item.media.averageScore,
          releaseDate: item.media.seasonYear,
          type: item.media.format,
        })),
      };
      return res;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   *
   * @param genres An array of genres to filter by (optional) genres: [`Action`, `Adventure`, `Cars`, `Comedy`, `Drama`, `Fantasy`, `Horror`, `Mahou Shoujo`, `Mecha`, `Music`, `Mystery`, `Psychological`, `Romance`, `Sci-Fi`, `Slice of Life`, `Sports`, `Supernatural`, `Thriller`]
   * @param page page number (optional)
   * @param perPage number of results per page (optional)
   */
  fetchAnimeGenres = async (genres: string[] | Genres[], page: number = 1, perPage: number = 20) => {
    if (genres.length === 0) throw new Error('No genres specified');

    for (const genre of genres)
      if (!Object.values(Genres).includes(genre as Genres)) throw new Error('Invalid genre');

    const options = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      query: anilistGenresQuery(genres, page, perPage),
    };
    try {
      const { data } = await axios.post(this.anilistGraphqlUrl, options);

      const res: ISearch<IAnimeResult> = {
        currentPage: data.data.Page.pageInfo.currentPage,
        hasNextPage: data.data.Page.pageInfo.hasNextPage,
        results: data.data.Page.media.map((item: any) => ({
          id: item.id.toString(),
          malId: item.idMal,
          title:
            {
              romaji: item.title.romaji,
              english: item.title.english,
              native: item.title.native,
              userPreferred: item.title.userPreferred,
            } || item.title.romaji,
          image: item.coverImage.extraLarge ?? item.coverImage.large ?? item.coverImage.medium,
          trailer: {
            id: item.trailer?.id,
            site: item.trailer?.site,
            thumbnail: item.trailer?.thumbnail,
          },
          description: item.description,
          cover:
            item.bannerImage ?? item.coverImage.extraLarge ?? item.coverImage.large ?? item.coverImage.medium,
          rating: item.averageScore,
          releaseDate: item.seasonYear,
          genres: item.genres,
          totalEpisodes: isNaN(item.episodes) ? 0 : item.episodes ?? item.nextAiringEpisode?.episode - 1 ?? 0,
          duration: item.duration,
          type: item.format,
        })),
      };
      return res;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };
  private findAnimeRaw = async (slug: string) => {
    const findAnime = (await this.provider.search(slug)) as ISearch<IAnimeResult>;

    if (findAnime.results.length === 0) return [];

    return (await this.provider.fetchAnimeInfo(findAnime.results[0].id)) as IAnimeInfo;
  };

  /**
   * @returns a random anime
   */
  fetchRandomAnime = async (): Promise<IAnimeInfo> => {
    const options = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      query: anilistSiteStatisticsQuery(),
    };

    try {
      const {
        data: { data },
      } = await axios.post(this.anilistGraphqlUrl, options);

      const selectedAnime = Math.floor(
        Math.random() * data.SiteStatistics.anime.nodes[data.SiteStatistics.anime.nodes.length - 1].count
      );
      const { results } = await this.advancedSearch(undefined, 'ANIME', Math.ceil(selectedAnime / 50), 50);
      return await this.fetchAnimeInfo(results[selectedAnime % 50]!.id);
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   * @param provider The provider to get the episode Ids from (optional) default: `gogoanime` (options: `gogoanime`, `zoro`)
   * @param page page number (optional)
   * @param perPage number of results per page (optional)
   */
  fetchRecentEpisodes = async (
    provider: 'gogoanime' | 'zoro' = 'gogoanime',
    page: number = 1,
    perPage: number = 15
  ): Promise<ISearch<IAnimeResult>> => {
    try {
      const {
        data: { data, meta },
      } = await axios.get(`${this.enimeUrl}/recent?page=${page}&perPage=${perPage}`);

      let results: IAnimeInfo[] = data.map((item: any) => ({
        id: item.anime.anilistId.toString(),
        malId: item.anime.mappings?.mal,
        title: {
          romaji: item.anime.title?.romaji,
          english: item.anime.title?.english,
          native: item.anime.title?.native,
          userPreferred: item.anime.title?.userPreferred,
        },
        image: item.anime.coverImage ?? item.anime.bannerImage,
        rating: item.anime.averageScore,
        episodeId: `${
          provider === 'gogoanime'
            ? item.sources.find((source: any) => source.website.toLowerCase() === 'gogoanime')?.id
            : item.sources.find((source: any) => source.website.toLowerCase() === 'zoro')?.id
        }-enime`,
        episodeTitle: item.title ?? `Episode ${item.number}`,
        episodeNumber: item.number,
        genres: item.anime.genre,
      }));

      results = results.filter(
        (item: any) => item.episodeNumber !== 0 && item.episodeId.replace('-enime', '').length > 0
      );

      return {
        currentPage: page,
        hasNextPage: meta.lastPage !== page,
        totalPages: meta.lastPage,
        totalResults: meta.total,
        results: results,
      };
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  private fetchDefaultEpisodeList = async (
    Media: {
      idMal: number;
      title: { english: string; romaji: string };
      season: string;
      startDate: { year: number };
    },
    dub: boolean,
    id: string
  ) => {
    let episodes: IAnimeEpisode[] = [];

    episodes = await this.findAnime(
      { english: Media.title?.english!, romaji: Media.title?.romaji! },
      Media.season!,
      Media.startDate.year,
      Media.idMal as number,
      dub,
      id
    );

    return episodes;
  };

  /**
   * @param id anilist id
   * @param dub language of the dubbed version (optional) currently only works for gogoanime
   * @returns episode list
   */
  fetchEpisodesListById = async (id: string, dub: boolean = false) => {
    const options = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      query: `query($id: Int = ${id}){ Media(id: $id){ idMal title {romaji english} status season startDate {year} coverImage {extraLarge large medium} } }`,
    };

    const {
      data: {
        data: { Media },
      },
    } = await axios.post(this.anilistGraphqlUrl, options);

    let possibleAnimeEpisodes: IAnimeEpisode[] = [];
    if (
      this.provider instanceof Zoro &&
      !dub &&
      (Media.status === 'RELEASING' || parseInt(Media.startDate?.year!) === 2022)
    ) {
      try {
        possibleAnimeEpisodes = (await new Enime().fetchAnimeInfoByAnilistId(id))
          .episodes!.map((item: any) => ({
            id: item.slug,
            title: item.title,
            number: item.number,
            image: item.image,
          }))
          .reverse();
      } catch (err) {
        return await this.fetchDefaultEpisodeList(Media, dub, id);
      }
    } else possibleAnimeEpisodes = await this.fetchDefaultEpisodeList(Media, dub, id);

    possibleAnimeEpisodes = possibleAnimeEpisodes?.map((episode: IAnimeEpisode) => {
      if (!episode.image)
        episode.image = Media.coverImage.extraLarge ?? Media.coverImage.large ?? Media.coverImage.medium;

      return episode;
    });

    return possibleAnimeEpisodes;
  };

  /**
   * @param id anilist id
   * @returns anilist data for the anime
   */
  fetchAnilistInfoById = async (id: string) => {
    const animeInfo: IAnimeInfo = {
      id: id,
      title: '',
    };

    const options = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      query: anilistMediaDetailQuery(id),
    };

    try {
      const { data } = await axios.post(this.anilistGraphqlUrl, options).catch(() => {
        throw new Error('Media not found');
      });
      animeInfo.malId = data.data.Media.idMal;
      animeInfo.title = {
        romaji: data.data.Media.title.romaji,
        english: data.data.Media.title.english,
        native: data.data.Media.title.native,
        userPreferred: data.data.Media.title.userPreferred,
      };

      if (data.data.Media.trailer?.id) {
        animeInfo.trailer = {
          id: data.data.Media.trailer?.id,
          site: data.data.Media.trailer?.site,
          thumbnail: data.data.Media.trailer?.thumbnail,
        };
      }
      animeInfo.image =
        data.data.Media.coverImage.extraLarge ??
        data.data.Media.coverImage.large ??
        data.data.Media.coverImage.medium;

      animeInfo.cover = data.data.Media.bannerImage ?? animeInfo.image;
      animeInfo.description = data.data.Media.description;
      switch (data.data.Media.status) {
        case 'RELEASING':
          animeInfo.status = MediaStatus.ONGOING;
          break;
        case 'FINISHED':
          animeInfo.status = MediaStatus.COMPLETED;
          break;
        case 'NOT_YET_RELEASED':
          animeInfo.status = MediaStatus.NOT_YET_AIRED;
          break;
        case 'CANCELLED':
          animeInfo.status = MediaStatus.CANCELLED;
          break;
        case 'HIATUS':
          animeInfo.status = MediaStatus.HIATUS;
        default:
          animeInfo.status = MediaStatus.UNKNOWN;
      }
      animeInfo.releaseDate = data.data.Media.startDate.year;
      if (data.data.Media.nextAiringEpisode?.airingAt)
        animeInfo.nextAiringEpisode = {
          airingTime: data.data.Media.nextAiringEpisode?.airingAt,
          timeUntilAiring: data.data.Media.nextAiringEpisode?.timeUntilAiring,
          episode: data.data.Media.nextAiringEpisode?.episode,
        };
      animeInfo.rating = data.data.Media.averageScore;
      animeInfo.duration = data.data.Media.duration;
      animeInfo.genres = data.data.Media.genres;
      animeInfo.studios = data.data.Media.studios.edges.map((item: any) => item.node.name);
      animeInfo.recommendations = data.data.Media.recommendations.edges.map((item: any) => ({
        id: item.node.mediaRecommendation.id,
        malId: item.node.mediaRecommendation.idMal,
        title: {
          romaji: item.node.mediaRecommendation.title.romaji,
          english: item.node.mediaRecommendation.title.english,
          native: item.node.mediaRecommendation.title.native,
          userPreferred: item.node.mediaRecommendation.title.userPreferred,
        },
        status:
          item.node.mediaRecommendation.status == 'RELEASING'
            ? MediaStatus.ONGOING
            : item.node.mediaRecommendation.status == 'FINISHED'
            ? MediaStatus.COMPLETED
            : item.node.mediaRecommendation.status == 'NOT_YET_RELEASED'
            ? MediaStatus.NOT_YET_AIRED
            : item.node.mediaRecommendation.status == 'CANCELLED'
            ? MediaStatus.CANCELLED
            : item.node.mediaRecommendation.status == 'HIATUS'
            ? MediaStatus.HIATUS
            : MediaStatus.UNKNOWN,
        episodes: item.node.mediaRecommendation.episodes,
        image:
          item.node.mediaRecommendation.coverImage.extraLarge ??
          item.node.mediaRecommendation.coverImage.large ??
          item.node.mediaRecommendation.coverImage.medium,
        cover:
          item.node.mediaRecommendation.bannerImage ??
          item.node.mediaRecommendation.coverImage.extraLarge ??
          item.node.mediaRecommendation.coverImage.large ??
          item.node.mediaRecommendation.coverImage.medium,
        score: item.node.mediaRecommendation.meanScore,
      }));

      animeInfo.characters = data.data.Media.characters.edges.map((item: any) => ({
        id: item.node.id,
        role: item.role,
        name: {
          first: item.node.name.first,
          last: item.node.name.last,
          full: item.node.name.full,
          native: item.node.name.native,
          userPreferred: item.node.name.userPreferred,
        },
        image: item.node.image.large ?? item.node.image.medium,
      }));

      animeInfo.relations = data.data.Media.relations.edges.map((item: any) => ({
        id: item.node.id,
        malId: item.node.idMal,
        title: {
          romaji: item.node.title.romaji,
          english: item.node.title.english,
          native: item.node.title.native,
          userPreferred: item.node.title.userPreferred,
        },
        status:
          item.node.status == 'RELEASING'
            ? MediaStatus.ONGOING
            : item.node.status == 'FINISHED'
            ? MediaStatus.COMPLETED
            : item.node.status == 'NOT_YET_RELEASED'
            ? MediaStatus.NOT_YET_AIRED
            : item.node.status == 'CANCELLED'
            ? MediaStatus.CANCELLED
            : item.node.status == 'HIATUS'
            ? MediaStatus.HIATUS
            : MediaStatus.UNKNOWN,
        episodes: item.node.episodes,
        image: item.node.coverImage.extraLarge ?? item.node.coverImage.large ?? item.node.coverImage.medium,
        cover:
          item.node.bannerImage ??
          item.node.coverImage.extraLarge ??
          item.node.coverImage.large ??
          item.node.coverImage.medium,
        score: item.node.meanScore,
      }));

      return animeInfo;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   * Anilist Anime class
   */
  static Anime = this;

  /**
   * TODO: Anilist Manga Class
   */
  static Manga = class Manga {
    provider: MangaParser;

    constructor(provider?: MangaParser) {
      this.provider = provider || new MangaDex();
    }

    search = (query: string, ...args: any[]): Promise<unknown> => {
      throw new Error('Method not implemented.');
    };

    fetchChapterPages = (chapterId: string, ...args: any): Promise<IMangaChapterPage[]> => {
      throw new Error('Method not implemented.');
    };

    fetchMangaInfo = (mangaUrl: string, ...args: any): Promise<IMangaInfo> => {
      throw new Error('Method not implemented.');
    };
  };
}

export default Anilist;
