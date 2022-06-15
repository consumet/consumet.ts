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
    [x: string]: unknown;
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
    status?: AnimeStatus;
    totalEpisodes?: number;
    subOrDub?: SubOrSub;
    episodes?: IAnimeEpisode[];
    [x: string]: unknown;
}
export interface IAnimeEpisode {
    id: string;
    number: number;
    title?: string;
    url?: string;
    image?: string;
    releaseDate?: string;
    [x: string]: unknown;
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
    [x: string]: unknown;
}
export declare enum StreamingServers {
    GogoCDN = "gogocdn",
    StreamSB = "streamsb",
    Doodstream = "doodstream",
    Mp4Upload = "mp4upload"
}
export declare enum AnimeStatus {
    ONGOING = "Ongoing",
    COMPLETED = "Completed",
    HIATUS = "Hiatus",
    CANCELLED = "Cancelled",
    NOT_YET_AIRED = "Not yet aired",
    UNKNOWN = "Unknown"
}
export declare enum SubOrSub {
    SUB = "sub",
    DUB = "dub"
}
export interface IMangaResult {
    id: string;
    title: string | [lang: string][];
    altTtitles?: string | [lang: string][];
    image?: string;
    description?: string | [lang: string][] | {
        [lang: string]: string;
    };
    status?: string;
    releaseDate?: number | string;
    [x: string]: unknown;
}
export interface IMangaSearch {
    currentPage?: number;
    results: IMangaResult[];
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
export interface ILightNovelResult {
    id: string;
    title: string;
    url: string;
    image?: string;
    [x: string]: unknown;
}
export interface ILightNovelSearch {
    currentPage?: number;
    results: ILightNovelResult[];
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
    status?: string;
    views?: number;
    rating?: number;
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
    page: number;
}
