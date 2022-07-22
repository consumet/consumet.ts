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
import { anilistSearchQuery, anilistMediaDetailQuery, kitsuSearchQuery } from '../../utils';
import Gogoanime from '../../providers/anime/gogoanime';

class Anilist extends AnimeParser {
  override readonly name = 'AnilistWithKitsu';
  protected override baseUrl = 'https://anilist.co/';
  protected override logo = 'https://upload.wikimedia.org/wikipedia/commons/6/61/AniList_logo.svg';
  protected override classPath = 'META.Anilist';

  private readonly anilistGraphqlUrl = 'https://graphql.anilist.co';
  private readonly kitsuGraphqlUrl = 'https://kitsu.io/api/graphql';
  private provider: AnimeParser;

  /**
   * This class maps anilist to kitsu, and anime provider
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
      const { data } = await axios.post(this.anilistGraphqlUrl, options);
      animeInfo.malId = data.data.Media.idMal.toString();
      animeInfo.title = {
        romaji: data.data.Media.title.romaji,
        english: data.data.Media.title.english,
        native: data.data.Media.title.native,
        userPreferred: data.data.Media.title.userPreferred,
      };

      animeInfo.image = data.data.Media.coverImage.large;
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

      const possibleAnimeEpisodes = await this.findAnime(
        { english: animeInfo.title?.english!, romaji: animeInfo.title?.romaji! },
        data.data.Media.season!,
        data.data.Media.startDate.year
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
    startDate: number
  ): Promise<IAnimeEpisode[]> => {
    title.english = title.english || title.romaji;
    title.romaji = title.romaji || title.english;

    title.english = title.english.toLocaleLowerCase();
    title.romaji = title.romaji.toLocaleLowerCase();

    if (title.english === title.romaji) {
      return await this.findAnimeSlug(title.english, season, startDate);
    }

    const romajiAnime = this.findAnimeSlug(title.romaji, season, startDate);
    const englishAnime = this.findAnimeSlug(title.english, season, startDate);

    const episodes = await Promise.all([englishAnime, romajiAnime]).then((r) =>
      r[0].length > 0 ? r[0] : r[1]
    );

    return episodes;
  };

  private findAnimeSlug = async (
    title: string,
    season: string,
    startDate: number
  ): Promise<IAnimeEpisode[]> => {
    const slug = title.replace(/[^0-9a-zA-Z]+/g, ' ');

    const findAnime = (await this.provider.search(slug)) as ISearch<IAnimeResult>;

    if (findAnime.results.length === 0) return [];

    const possibleAnime = (await this.provider.fetchAnimeInfo(findAnime.results[0].id)) as IAnimeInfo;

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

            episodes.forEach((episode: any) => {
              if (episode) {
                const i = episode.number.toString().replace(/"/g, '');
                let name = null;
                let description = null;
                let thumbnail = null;
                if (episode.titles?.canonical) name = episode.titles.canonical.toString().replace(/"/g, '');
                if (episode.description?.en)
                  description = episode.description.en.toString().replace(/"/g, '').replace('\\n', '\n');
                if (episode.thumbnail)
                  thumbnail = episode.thumbnail.original.url.toString().replace(/"/g, '');
                episodesList.set(i, {
                  episodeNum: episode.number.toString().replace(/"/g, ''),
                  title: name,
                  description,
                  thumbnail,
                });
              }
            });
          }
        });
      }
    }
    const newEpisodeList: IAnimeEpisode[] = [];

    if (episodesList.size !== 0 && possibleProviderEpisodes?.length !== 0) {
      possibleProviderEpisodes?.forEach((ep, i) => {
        const j = (i + 1).toString();
        newEpisodeList.push({
          id: ep.id as string,
          title: episodesList.get(j)?.title ?? null,
          image: episodesList.get(j)?.thumbnail ?? null,
          number: ep.number as number,
          description: episodesList.get(j)?.description,
        });
      });
    }
    return newEpisodeList;
  };
}

export default Anilist;
