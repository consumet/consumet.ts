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
} from '../../models';
import {
  anilistSearchQuery,
  anilistMediaDetailQuery,
  kitsuSearchQuery,
  anilistTrendingAnimeQuery,
  anilistPopularAnimeQuery,
} from '../../utils';
import Gogoanime from '../../providers/anime/gogoanime';

class Anilist extends AnimeParser {
  override readonly name = 'AnilistWithKitsu';
  protected override baseUrl = 'https://anilist.co/';
  protected override logo = 'https://upload.wikimedia.org/wikipedia/commons/6/61/AniList_logo.svg';
  protected override classPath = 'META.Anilist';

  private readonly anilistGraphqlUrl = 'https://graphql.anilist.co';
  private readonly kitsuGraphqlUrl = 'https://kitsu.io/api/graphql';
  private readonly malSyncUrl = 'https://api.malsync.moe';
  private provider: AnimeParser;

  /**
   * This class maps anilist to kitsu with any other anime provider.
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
          image: item.coverImage.large,
          rating: item.averageScore,
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
      animeInfo.trailer = {
        id: data.data.Media.trailer?.id,
        site: data.data.Media.trailer?.site,
        thumbnail: data.data.Media.trailer?.thumbnail,
      };
      animeInfo.image =
        data.data.Media.coverImage.large ??
        data.data.Media.coverImage.medium ??
        data.data.Media.coverImage.small;

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
        cover: item.node.mediaRecommendation.bannerImage ?? animeInfo.image,
        score: item.node.mediaRecommendation.meanScore,
      }));
      const possibleAnimeEpisodes = await this.findAnime(
        { english: animeInfo.title?.english!, romaji: animeInfo.title?.romaji! },
        data.data.Media.season!,
        data.data.Media.startDate.year,
        animeInfo.malId as number
      );

      if (possibleAnimeEpisodes) {
        animeInfo.episodes = possibleAnimeEpisodes;
        if (this.provider.name === 'Gogoanime' && dub) {
          animeInfo.episodes = animeInfo.episodes.map((episode: IAnimeEpisode) => {
            const [episodeSlug, episodeNumber] = episode.id.split('-episode-')[0];
            episode.id = `${episodeSlug.replace(/-movie$/, '')}-dub-episode-${episodeNumber}`;
            return episode;
          });
        }
      }

      animeInfo.episodes = animeInfo.episodes?.map((episode: IAnimeEpisode) => {
        if (!episode.image) {
          episode.image = animeInfo.image;
        }
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
    malId: number
  ): Promise<IAnimeEpisode[]> => {
    title.english = title.english || title.romaji;
    title.romaji = title.romaji || title.english;

    title.english = title.english.toLocaleLowerCase();
    title.romaji = title.romaji.toLocaleLowerCase();

    if (title.english === title.romaji) {
      return await this.findAnimeSlug(title.english, season, startDate, malId);
    }

    const romajiPossibleEpisodes = this.findAnimeSlug(title.romaji, season, startDate, malId);

    if (romajiPossibleEpisodes) {
      return romajiPossibleEpisodes;
    }

    const englishPossibleEpisodes = this.findAnimeSlug(title.english, season, startDate, malId);
    return englishPossibleEpisodes;
  };

  private findAnimeSlug = async (
    title: string,
    season: string,
    startDate: number,
    malId: number
  ): Promise<IAnimeEpisode[]> => {
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
          [k: string]: { [k: string]: { url: string; page: string } };
        };
        const sites = Object.values(sitesT).map((v, i) => ({
          page: Object.values(Object.values(sitesT)[i])[0]?.page,
          url: Object.values(Object.values(sitesT)[i])[0]?.url,
        }));

        const possibleSource = sites.find(
          (s) => s.page.toLocaleLowerCase() === this.provider.name.toLocaleLowerCase()
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

    const kitsuEpisodes = await axios.post(this.kitsuGraphqlUrl, options);
    const episodesList = new Map();
    if (kitsuEpisodes?.data.data) {
      const { nodes } = kitsuEpisodes.data.data.searchAnimeByTitle;

      if (nodes) {
        nodes.forEach((node: any) => {
          if (node.season === season && node.startDate.trim().split('-')[0] === startDate.toString()) {
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
          image: item.coverImage.large ?? item.coverImage.medium ?? item.coverImage.small,
          trailer: {
            id: item.trailer?.id,
            site: item.trailer?.site,
            thumbnail: item.trailer?.thumbnail,
          },
          description: item.description,
          cover: item.bannerImage ?? item.coverImage.large ?? item.coverImage.medium ?? item.coverImage.small,
          rating: item.averageScore,
          releaseDate: item.seasonYear,
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
          image: item.coverImage.large ?? item.coverImage.medium ?? item.coverImage.small,
          trailer: {
            id: item.trailer?.id,
            site: item.trailer?.site,
            thumbnail: item.trailer?.thumbnail,
          },
          description: item.description,
          cover: item.bannerImage ?? item.coverImage.large ?? item.coverImage.medium ?? item.coverImage.small,
          rating: item.averageScore,
          releaseDate: item.seasonYear,
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
}

export default Anilist;
