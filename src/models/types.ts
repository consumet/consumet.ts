import { Book, Hashes } from './base-types';

export interface IProviderStats {
  name: string;
  baseUrl: string;
  lang: string[] | string;
  isNSFW: boolean;
}

export interface IAnimeResult {
  id: string;
  title: string;
  url: string;
  image?: string;
  releaseDate?: string;
  [x: string]: unknown; // other fields
}

export interface IAnimeSearch {
  currentPage?: number;
  hasNextPage?: boolean;
  results: IAnimeResult[];
}

export interface IAnimeInfo {
  id: string;
  title: string;
  url: string;
  image?: string;
  releaseDate?: string;
  genres?: string[];
  description?: string;
  type?: string;
  status?: string;
  totalEpisodes?: number;
  episodes?: IAnimeEpisode[];
  [x: string]: unknown; // other fields
}

export interface IAnimeEpisode {
  id: string;
  number: number;
  title?: string;
  url?: string;
  image?: string;
  releaseDate?: string;
  [x: string]: unknown; // other fields
}

export interface IEpisodeServer {
  name: string;
  url: string;
}

export interface IVideo {
  /**
   * The **MAIN URL** of the video provider that should take you to the video
   */
  url: string;
  /**
   * The Quality of the video shouldn't include the `p` suffix
   */
  quality?: string;
  /**
   * make sure to set this to `true` if the video is hls
   */
  isM3U8?: boolean;
  size?: number;
  [x: string]: unknown; // other fields
}

export enum Servers {
  GogoCDN = 'gogocdn',
  StreamSB = 'streamsb',
  Doodstream = 'doodstream',
  Mp4Upload = 'mp4upload',
}

export interface LibgenBook extends Book {
  id: string;
  language: string;
  format: string;
  size: string;
  pages: string;
  image: string;
  description: string;
  tableOfContents: string;
  topic: string;
  hashes: Hashes;
}
