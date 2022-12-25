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
  SubOrSub,
  IEpisodeServer,
  Genres,
  MangaParser,
  IMangaChapterPage,
  IMangaInfo,
  IMangaResult,
  IMangaChapter,
  ProxyConfig,
  MediaFormat,
  ITitle,
  FuzzyDate,
} from '../../models';
import { substringAfter, substringBefore, compareTwoStrings, kitsuSearchQuery, range } from '../../utils';
import Gogoanime from '../anime/gogoanime';
import Zoro from '../anime/zoro';
import Crunchyroll from '../anime/crunchyroll';
import Enime from '../anime/enime';
import Bilibili from '../anime/bilibili';

class Kitsu extends AnimeParser {
  fetchEpisodeSources(episodeId: string, ...args: any): Promise<ISource> {
    throw new Error('Method not implemented.');
  }
  fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]> {
    throw new Error('Method not implemented.');
  }
  override readonly name = 'Kitsu';
  protected override baseUrl = 'https://kitsu.io/api/edge/';
  protected override logo =
    'https://play-lh.googleusercontent.com/fJbHIg6QrqzVD18nUvHXDHA-l3X9FVz5qUNhESnKKRdCspaUnXt4L83eD7nnWZZyzw';
  protected override classPath = 'META.Kitsu';
  provider: AnimeParser;

  /**
   * This class maps Kitsu to kitsu with any other anime provider.
   * kitsu is used for episode images, titles and description.
   * @param provider anime provider (optional) default: Gogoanime
   */
  constructor(provider?: AnimeParser) {
    super();
    this.provider = provider || new Crunchyroll();
  }

  private kitsuStatusToMediaStatus(status: string): MediaStatus {
    if (status == 'current') return MediaStatus.ONGOING;
    else if (status == 'finished') return MediaStatus.COMPLETED;
    else if (status == 'unreleased') return MediaStatus.NOT_YET_AIRED;
    return MediaStatus.UNKNOWN;
  }

  private kitsuTypeToMediaType(type: string): MediaFormat {
    if (type == 'TV') return MediaFormat.TV;
    else if (type == 'ONA') return MediaFormat.ONA;
    else if (type == 'OVA') return MediaFormat.OVA;
    else if (type == 'movie') return MediaFormat.MOVIE;
    else if (type == 'music') return MediaFormat.MUSIC;
    else if (type == 'special') return MediaFormat.SPECIAL;
    return MediaFormat.TV;
  }

  async search(query: string): Promise<unknown> {
    const data = await (await axios.get(`${this.baseUrl}anime?filter[text]=${query}`)).data;

    const results: any[] = [];
    data.data.forEach((anime: any) => {
      results.push({
        id: anime.id,
        title: {
          english: anime.attributes.titles.en,
          native: anime.attributes.titles.ja_jp,
          romaji: anime.attributes.titles.en_jp,
        } as ITitle,
        synonyms: [anime.attributes.abbreviatedTitles],
        ageRating: anime.attributes.ageRating,
        ageRatingGuide: anime.attributes.ageRatingGuide,
        image: anime.attributes.posterImage != null ? anime.attributes.posterImage.original : '',
        cover: anime.attributes.coverImage != null ? anime.attributes.coverImage.original : '',
        popularity: anime.attributes.pupularityRank,
        description: anime.attributes.description,
        status: this.kitsuStatusToMediaStatus(anime.attributes.status),
        releaseDate: anime.attributes.startDate.split('-')[0],
        startDate: {
          year: parseInt(anime.attributes.startDate.split('-')[0]),
          month: parseInt(anime.attributes.startDate.split('-')[1]),
          day: parseInt(anime.attributes.startDate.split('-')[2]),
        },
        endDate: {
          year: parseInt(anime.attributes.endDate.split('-')[0]),
          month: parseInt(anime.attributes.endDate.split('-')[1]),
          day: parseInt(anime.attributes.endDate.split('-')[2]),
        },
        totalEpisodes: anime.attributes.episodeCount,
        rating: parseInt(parseInt(anime.attributes.averageRating).toFixed(0)) / 10,
        duration: anime.attributes.episodeLength,
        type: this.kitsuTypeToMediaType(anime.attributes.showType),
      });
    });

    return {
      currentPage: 1,
      hasNextPage: false,
      results: results,
    };
  }

  /**
   *
   * @param animeId anime id
   * @param fetchFiller fetch filler episodes
   */
  fetchAnimeInfo = async (
    animeId: string,
    dub: boolean = false,
    fetchFiller: boolean = false
  ): Promise<IAnimeInfo> => {
    try {
      const data = await (await axios.get(`${this.baseUrl}anime/${animeId}`)).data.data;
      const mappingsData = await (await axios.get(`${this.baseUrl}anime/${animeId}/mappings`)).data.data;
      const genresData = await (await axios.get(`${this.baseUrl}anime/${animeId}/genres`)).data.data;

      const mappings = Object.assign(
        {},
        ...mappingsData.map((m: any) => ({
          [m.attributes.externalSite.split('/')[0]]: m.attributes.externalId,
        }))
      );

      const genres = genresData.map((g: any) => {
        return g.attributes.name;
      });

      const animeData: IAnimeInfo = {
        id: animeId,
        title: {
          english: data.attributes.titles.en,
          native: data.attributes.titles.ja_jp,
          romaji: data.attributes.titles.en_jp,
        } as ITitle,
        mappings: mappings,
        synonyms: data.attributes.abbreviatedTitles,
        ageRating: data.attributes.ageRating,
        ageRatingGuide: data.attributes.ageRatingGuide,
        image: data.attributes.posterImage.original,
        cover: data.attributes.coverImage.original,
        popularity: data.attributes.pupularityRank,
        description: data.attributes.description,
        status: this.kitsuStatusToMediaStatus(data.attributes.status),
        releaseDate: data.attributes.startDate.split('-')[0],
        startDate: {
          year: parseInt(data.attributes.startDate.split('-')[0]),
          month: parseInt(data.attributes.startDate.split('-')[1]),
          day: parseInt(data.attributes.startDate.split('-')[2]),
        },
        endDate: {
          year: parseInt(data.attributes.endDate.split('-')[0]),
          month: parseInt(data.attributes.endDate.split('-')[1]),
          day: parseInt(data.attributes.endDate.split('-')[2]),
        },
        totalEpisodes: data.attributes.episodeCount,
        rating: parseInt(parseInt(data.attributes.averageRating).toFixed(0)) / 10,
        duration: data.attributes.episodeLength,
        genres: genres,
        type: this.kitsuTypeToMediaType(data.attributes.showType),
      };

      return animeData;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
}

export default Kitsu;

(async () => {
  const kitsu = new Kitsu(new Crunchyroll());
  console.log(await kitsu.fetchAnimeInfo('13503'));
})();
