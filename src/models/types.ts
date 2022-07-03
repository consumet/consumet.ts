import { Book, Hashes } from './base-types';

export interface IProviderStats {
  name: string;
  baseUrl: string;
  lang: string[] | string;
  isNSFW: boolean;
  logo: string;
  classPath: string;
  isWorking: boolean;
}

export interface IAnimeResult {
  id: string;
  title: string;
  url: string;
  image?: string;
  releaseDate?: string;
  [x: string]: unknown; // other fields
}

export interface ISearch<T> {
  currentPage?: number;
  hasNextPage?: boolean;
  results: T[];
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
  status?: MediaStatus;
  totalEpisodes?: number;
  subOrDub?: SubOrSub;
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
   * The Quality of the video should include the `p` suffix
   */
  quality?: string;
  /**
   * make sure to set this to `true` if the video is hls
   */
  isM3U8?: boolean;
  size?: number;
  [x: string]: unknown; // other fields
}

export enum StreamingServers {
  GogoCDN = 'gogocdn',
  StreamSB = 'streamsb',
  MixDrop = 'mixdrop',
  UpCloud = 'upcloud',
}

export enum MediaStatus {
  ONGOING = 'Ongoing',
  COMPLETED = 'Completed',
  HIATUS = 'Hiatus',
  CANCELLED = 'Cancelled',
  NOT_YET_AIRED = 'Not yet aired',
  UNKNOWN = 'Unknown',
}

export enum SubOrSub {
  SUB = 'sub',
  DUB = 'dub',
}

export interface IMangaResult {
  id: string;
  title: string | [lang: string][];
  altTitles?: string | [lang: string][];
  image?: string;
  description?: string | [lang: string][] | { [lang: string]: string };
  status?: MediaStatus;
  releaseDate?: number | string;
  [x: string]: unknown; // other fields
}

export interface IMangaChapter {
  id: string;
  title: string;
  volume?: number;
  pages?: number;
}

export interface IMangaInfo extends IMangaResult {
  authors?: string[];
  genres?: string[];
  links?: string[];
  chapters?: IMangaChapter[];
}

export interface IMangaChapterPage {
  img: string;
  page: number;
  [x: string]: unknown; // other fields
}

export interface ILightNovelResult {
  id: string;
  title: string;
  url: string;
  image?: string;
  [x: string]: unknown; // other fields
}

export interface ILightNovelChapter {
  id: string;
  title: string;
  volume?: number | string;
  url?: string;
}

export interface ILightNovelChapterContent {
  text: string;
  html?: string;
}

export interface ILightNovelInfo extends ILightNovelResult {
  authors?: string[];
  genres?: string[];
  description?: string;
  chapters?: ILightNovelChapter[];
  status?: MediaStatus;
  views?: number;
  rating?: number;
}

export interface LibgenBook extends Book {
  id: string;
  language: string;
  format: string;
  size: string;
  pages: string;
  tableOfContents: string;
  topic: string;
  hashes: Hashes;
}

export interface GetComicsComics {
  image: string;
  title: string;
  year: string;
  size: string;
  excerpt: string;
  category: string;
  description: string;
  download: string;
  ufile: string;
  mega: string;
  mediafire: string;
  zippyshare: string;
  readOnline: string;
}

export interface ComicRes {
  containers: GetComicsComics[];
  pages: number;
}

export interface ZLibrary extends Book {
  bookRating: string;
  bookQuality: string;
  language: string;
  size: string;
  pages: string;
}

export interface ISource {
  headers?: { [k: string]: string };
  sources: IVideo[];
}

export enum TvType {
  TVSERIES = 'TV Series',
  MOVIE = 'Movie',
}

export interface IMovieEpisode {
  id: string;
  title: string;
  url: string;
  number?: number;
  season?: number;
  image?: string;
  releaseDate?: string;
  [x: string]: unknown; // other fields
}

export interface IMovieInfo {
  id: string;
  title: string;
  url: string;
  image?: string;
  releaseDate?: string;
  genres?: string[];
  description?: string;
  rating?: number;
  type?: TvType;
  status?: MediaStatus;
  duration?: string;
  production?: string;
  casts?: string[];
  tags?: string[];
  totalEpisodes?: number;
  episodes?: IMovieEpisode[];
  [x: string]: unknown; // other unkown fields
}
