import axios from 'axios';

import {
  AnimeParser,
  ISearch,
  IAnimeInfo,
  MediaStatus,
  IAnimeResult,
  ISource,
  IEpisodeServer,
  MediaFormat,
  ProxyConfig,
} from '../../models';

class Animelon extends AnimeParser {
  override readonly name = 'Animelon';
  protected override baseUrl = 'https://animelon.com';
  protected override logo = 'https://animefox.tv/assets/images/logo.png';
  protected override classPath = 'ANIME.AnimeFox';

  constructor(proxyConfig?: ProxyConfig) {
    super('https://animelon.com/', proxyConfig);
  }
  /**
   * @param query Search query
   * @param page Page number (optional)
   */

  override search = async (query: string): Promise<ISearch<IAnimeResult>> => {
    const searchResults: IAnimeResult[] = [];
    const { data } = await this.client.get(
      `/api/series-s/?language=jp&search=${encodeURIComponent(query)}&skip=0&limit=8&listedOnly=true`,
      {
        headers: {
          Referer: `${this.baseUrl}/search?searchTerm=${encodeURIComponent(query)}`,
        },
      }
    );
    const res: SearchResponse = data;
    for (let i = 0; i < res.resArray.length; i++) {
      const element = res.resArray[i];
      searchResults.push({
        id: element._id,
        title: element._id, // _id is the title of the show. Animelon is weird
        type: MediaFormat.TV, // Animelon doesn't have a type field from what I know
        image: element.thumbnail,
        url: `${this.baseUrl}/series/${element._id}`,
        episode: -1, // TBD
      });
    }
    return {
      currentPage: 0,
      hasNextPage: false,
      results: searchResults,
    };
  };

  /**
   * @param id Anime id
   */

  override fetchAnimeInfo = async (id: string): Promise<IAnimeInfo> => {
    const info: IAnimeInfo = {
      id: id,
      title: '',
    };
    const { data } = await this.client.get(`/api/series/${id}/relatedSeries-s/`, {
      headers: {
        Referer: `${this.baseUrl}/series/${id}`,
      },
    });
    const res: InfoResponse = data;
    const show = res.resArray[0];
    info.title = show._id;
    info.image = show.thumbnail;
    info.description = show.description;
    info.releaseDate = String(show.attributes.releaseDate);
    info.status = show.attributes.ongoing ? MediaStatus.ONGOING : MediaStatus.COMPLETED;
    info.hasDub = false;
    info.hasSub = true;

    info.episodes = []; // TBD
    return info;
  };

  /**
   *
   * @param episodeId episode id
   */
  override fetchEpisodeSources = async (episodeId: string): Promise<ISource> => {
    try {
      const result: ISource = {
        sources: [],
        subtitles: [],
      };
      const { data } = await this.client.get(
        `/api/languagevideo/findByVideo?videoId=${episodeId}&learnerLanguage=en&subs=1&cdnLink=1&viewCounter=1`,
        {
          headers: {
            Referer: `${this.baseUrl}/video/${episodeId}`,
          },
        }
      );
      const res: SubResponse = data;
      const videoUrls = res.resObj.video.cdnLink;
      const subtitles = res.resObj.subtitles;

      result.sources = videoUrls.map(url => {
        return {
          url: url,
          isM3U8: url.includes('.m3u8'),
        };
      });

      result.subtitles = subtitles.map(sub => {
        return {
          id: sub._id,
          url: '', // TBD
          lang: sub.content.englishSub ? 'en' : 'jp',
        };
      });
      return result;
    } catch (err) {
      throw new Error('Something went wrong. Please try again later.');
    }
  };

  /**
   * @deprecated Use fetchEpisodeSources instead
   */
  override fetchEpisodeServers = (episodeIs: string): Promise<IEpisodeServer[]> => {
    throw new Error('Method not implemented.');
  };
}

interface SearchResponse {
  status: boolean;
  error: any;
  resArray: [ResArray];
  count: number;
}

interface ResArray {
  _id: string;
  language?: string;
  __v?: number;
  tags: [string];
  locationFilters?: [any];
  listed?: boolean;
  featured?: boolean;
  seasons?: [Season];
  attributes: {
    releaseDate: number;
    ongoing: boolean;
  };
  thumbnailURLS: [string];
  thumbnailMetadata?: [ThumbnailMetadata];
  descriptions: {
    jp: string;
    en: string;
  };
  description?: string;
  creation: number;
  thumbnail: string;
}

interface Season {
  number: number;
  episodes: [string];
  thumbnail?: string;
  description: string;
}

interface ThumbnailMetadata {
  src: string;
  iamgeId: string;
}

interface InfoResponse {
  status: boolean;
  error: any;
  resArray: [ResArray];
}

interface SeasonResponse {
  status: boolean;
  error: any;
  resObj: Season;
}

interface SubResponse {
  status: boolean;
  error: any;
  resObj: ResObj;
}

interface ResObj {
  _id: string;
  title: string;
  video: Video;
  videoLanguage: string;
  learnerLanguage: string;
  __v: number;
  tags: string[];
  subtitles: [Subtitle];
  views: number;
  description: string;
  creation: number;
}

interface Video {
  _id: string;
  videoURLSData: any;
  classification: {
    seriesName: string;
  };
  thumbnailURLS: string[];
  thumbnail: any;
  cdnLink: string[];
  vlID: string;
}

interface Subtitle {
  _id: string;
  title: string;
  video: string;
  type: string;
  timeoffset: number;
  content: {
    englishSub?: string;
    hiraganaSub?: string;
    japaneseSub?: string;
    katakanaSub?: string;
    romajiSub?: string;
    englishAndTimes?: [Time];
    hiraganaAndTimes?: [Time];
    japaneseAndTimes?: [Time];
    katakanaAndTimes?: [Time];
    romajiAndTimes?: [Time];
  };
  __v: number;
  creation: number;
  languageVideos: string[];
}

interface Time {
  startTime: number;
  tokenized?: string;
}

export default Animelon;
