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

export interface ITitle {
  romaji?: string;
  english?: string;
  native?: string;
  userPreferred?: string;
}

export interface IAnimeResult {
  id: string;
  title: string | ITitle;
  url?: string;
  image?: string;
  releaseDate?: string;
  [x: string]: unknown; // other fields
}

export interface ISearch<T> {
  currentPage?: number;
  hasNextPage?: boolean;
  results: T[];
}

export interface IAnimeInfo extends IAnimeResult {
  genres?: string[];
  description?: string;
  type?: string;
  status?: MediaStatus;
  totalEpisodes?: number;
  subOrDub?: SubOrSub;
  episodes?: IAnimeEpisode[];
}

export interface IAnimeEpisode {
  id: string;
  number: number;
  title?: string;
  isFiller?: boolean;
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
  /**
   * size of the video in **bytes**
   */
  size?: number;
  [x: string]: unknown; // other fields
}

export enum StreamingServers {
  GogoCDN = 'gogocdn',
  StreamSB = 'streamsb',
  MixDrop = 'mixdrop',
  UpCloud = 'upcloud',
  VidCloud = 'vidcloud',
  /**
   * To use rapidcloud, you need to setup web socket connection with rapidcloud.\
   * connect the web socket server to `wss://ws1.rapid-cloud.ru/socket.io/?EIO=4&transport=websocket`. then
   * set a **message listener**, and inside the message listener, if you recieve a message equals to "2" send a "3".
   * when the video is ready to play. send a "3".
   * when the video stops playing close the web socket connection with the code `4969`.
   */
  RapidCloud = 'rapidcloud',
  StreamTape = 'streamtape',
  VizCloud = 'vizcloud',
  // same as vizcloud
  MyCloud = 'mycloud',
  Filemoon = 'filemoon',
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
  BOTH = 'both',
}

export interface IMangaResult {
  id: string;
  title: string | [lang: string][] | ITitle;
  altTitles?: string | string[] | [lang: string][];
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
  [x: string]: unknown; // other fields
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
  title: string | ITitle;
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

export interface LibgenResult {
  result: LibgenBook[];
  hasNextPage: boolean;
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
  hasNextPage: boolean;
}

export interface ZLibrary extends Book {
  bookRating: string;
  bookQuality: string;
  language: string;
  size: string;
  pages: string;
}

export interface ISubtitle {
  /**
   * The **url** that should take you to the subtitle **directly**.
   */
  url: string;
  /**
   * The language of the subtitle
   */
  lang: string;
}

/**
 * The start, and the end of the intro or opening in seconds.
 */
export interface Intro {
  start: number;
  end: number;
}

export interface ISource {
  headers?: { [k: string]: string };
  intro?: Intro;
  subtitles?: ISubtitle[];
  sources: IVideo[];
}

/**
 * Used **only** for movie/tvshow providers
 */
export enum TvType {
  TVSERIES = 'TV Series',
  MOVIE = 'Movie',
  ANIME = 'Anime',
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

export interface IMovieResult {
  id: string;
  title: string | ITitle;
  url: string;
  image?: string;
  releaseDate?: string;
  type?: TvType;
  [x: string]: unknown; // other unkown fields
}

export interface IMovieInfo extends IMovieResult {
  genres?: string[];
  description?: string;
  rating?: number;
  status?: MediaStatus;
  duration?: string;
  production?: string;
  casts?: string[];
  tags?: string[];
  totalEpisodes?: number;
  episodes?: IMovieEpisode[];
}

export enum Genres {
  ACTION = 'Action',
  ADVENTURE = 'Adventure',
  CARS = 'Cars',
  COMEDY = 'Comedy',
  CRIME = 'Crime',
  dementia = 'Dementia',
  DEMONS = 'Demons',
  DRAMA = 'Drama',
  ECCHI = 'Ecchi',
  FAMILY = 'Family',
  FANTASY = 'Fantasy',
  GAME = 'Game',
  GOURMET = 'Gourmet',
  HAREM = 'Harem',
  HISTORICAL = 'Historical',
  HORROR = 'Horror',
  JOSEI = 'Josei',
  KIDS = 'Kids',
  MAGIC = 'Magic',
  MARTIAL_ARTS = 'Martial-Arts',
  MECHA = 'Mecha',
  MILITARY = 'Military',
  MUSIC = 'Music',
  MYSTERY = 'Mystery',
  PARODY = 'Parody',
  POLICE = 'Police',
  PSYCHOLOGICAL = 'Psychological',
  ROMANCE = 'Romance',
  SAMURAI = 'Samurai',
  SCHOOL = 'School',
  SCI_FI = 'Sci-Fi',
  SEINEN = 'Seinen',
  SHOUJO = 'Shoujo',
  SHOUJO_AI = 'Shoujo-Ai',
  SHOUNEN = 'Shounen',
  SHOUNEN_AI = 'Shounen-Ai',
  SLICE_OF_LIFE = 'Slice-Of-Life',
  SPACE = 'Space',
  SPORTS = 'Sports',
  SUPER_POWER = 'Super-Power',
  SUPERNATURAL = 'Supernatural',
  SUSPENSE = 'Suspense',
  THRILLER = 'Thriller',
  VAMPIRE = 'Vampire',
  YAOI = 'Yaoi',
  YURI = 'Yuri',
  ISEKAI = 'Isekai',
}
