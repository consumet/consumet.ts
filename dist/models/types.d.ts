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
    cover?: string;
    status?: MediaStatus;
    rating?: number;
    type?: MediaFormat;
    releaseDate?: string;
    [x: string]: unknown;
}
export interface ISearch<T> {
    currentPage?: number;
    hasNextPage?: boolean;
    totalPages?: number;
    /**
     * total results must include results from all pages
     */
    totalResults?: number;
    results: T[];
}
export interface Trailer {
    id: string;
    site?: string;
    thumbnail?: string;
}
export interface FuzzyDate {
    year?: number;
    month?: number;
    day?: number;
}
export declare enum MediaFormat {
    TV = "TV",
    TV_SHORT = "TV_SHORT",
    MOVIE = "MOVIE",
    SPECIAL = "SPECIAL",
    OVA = "OVA",
    ONA = "ONA",
    MUSIC = "MUSIC",
    MANGA = "MANGA",
    NOVEL = "NOVEL",
    ONE_SHOT = "ONE_SHOT"
}
export interface IAnimeInfo extends IAnimeResult {
    malId?: number | string;
    genres?: string[];
    description?: string;
    status?: MediaStatus;
    totalEpisodes?: number;
    /**
     * @deprecated use `hasSub` or `hasDub` instead
     */
    subOrDub?: SubOrSub;
    hasSub?: boolean;
    hasDub?: boolean;
    synonyms?: string[];
    /**
     * two letter representation of coutnry: e.g JP for japan
     */
    countryOfOrigin?: string;
    isAdult?: boolean;
    isLicensed?: boolean;
    /**
     * `FALL`, `WINTER`, `SPRING`, `SUMMER`
     */
    season?: string;
    studios?: string[];
    color?: string;
    cover?: string;
    trailer?: Trailer;
    episodes?: IAnimeEpisode[];
    startDate?: FuzzyDate;
    endDate?: FuzzyDate;
    recommendations?: IAnimeResult[];
    relations?: IAnimeResult[];
}
export interface IAnimeEpisodeV2 {
    [x: string]: {
        id: string;
        season_number: number;
        title: string;
        image: string;
        description: string;
        releaseDate: string;
        isHD: boolean;
        isAdult: boolean;
        isDubbed: boolean;
        isSubbed: boolean;
        duration: number;
    }[];
}
export interface IAnimeEpisode {
    id: string;
    number: number;
    title?: string;
    description?: string;
    isFiller?: boolean;
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
    /**
     * set this to `true` if the video is dash (mpd)
     */
    isDASH?: boolean;
    /**
     * size of the video in **bytes**
     */
    size?: number;
    [x: string]: unknown;
}
export declare enum StreamingServers {
    AsianLoad = "asianload",
    GogoCDN = "gogocdn",
    StreamSB = "streamsb",
    MixDrop = "mixdrop",
    UpCloud = "upcloud",
    VidCloud = "vidcloud",
    StreamTape = "streamtape",
    VizCloud = "vizcloud",
    MyCloud = "mycloud",
    Filemoon = "filemoon",
    VidStreaming = "vidstreaming"
}
export declare enum MediaStatus {
    ONGOING = "Ongoing",
    COMPLETED = "Completed",
    HIATUS = "Hiatus",
    CANCELLED = "Cancelled",
    NOT_YET_AIRED = "Not yet aired",
    UNKNOWN = "Unknown"
}
export declare enum SubOrSub {
    SUB = "sub",
    DUB = "dub",
    BOTH = "both"
}
export interface IMangaResult {
    id: string;
    title: string | [lang: string][] | ITitle;
    altTitles?: string | string[] | [lang: string][];
    image?: string;
    description?: string | [lang: string][] | {
        [lang: string]: string;
    };
    status?: MediaStatus;
    releaseDate?: number | string;
    [x: string]: unknown;
}
export interface IMangaChapter {
    id: string;
    title: string;
    volume?: number;
    pages?: number;
    releaseDate?: string;
    [x: string]: unknown;
}
export interface IMangaInfo extends IMangaResult {
    malId?: number | string;
    authors?: string[];
    genres?: string[];
    links?: string[];
    characters?: any[];
    recommendations?: IMangaResult[];
    chapters?: IMangaChapter[];
}
export interface IMangaChapterPage {
    img: string;
    page: number;
    [x: string]: unknown;
}
export interface ILightNovelResult {
    id: string;
    title: string | ITitle;
    url: string;
    image?: string;
    [x: string]: unknown;
}
export interface ILightNovelChapter {
    id: string;
    title: string;
    volume?: number | string;
    url?: string;
}
export interface ILightNovelChapterContent {
    novelTitle: string;
    chapterTitle: string;
    text: string;
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
export interface ISubtitle {
    /**
     * The id of the subtitle. **not** required
     */
    id?: string;
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
    headers?: {
        [k: string]: string;
    };
    intro?: Intro;
    subtitles?: ISubtitle[];
    sources: IVideo[];
    download?: string;
    embedURL?: string;
}
/**
 * Used **only** for movie/tvshow providers
 */
export declare enum TvType {
    TVSERIES = "TV Series",
    MOVIE = "Movie",
    ANIME = "Anime"
}
export interface IMovieEpisode {
    id: string;
    title: string;
    url?: string;
    number?: number;
    season?: number;
    description?: string;
    image?: string;
    releaseDate?: string;
    [x: string]: unknown;
}
export interface IMovieResult {
    id: string;
    title: string | ITitle;
    url?: string;
    image?: string;
    releaseDate?: string;
    type?: TvType;
    [x: string]: unknown;
}
export interface INewsFeed extends INews {
    /** topics of the feed */
    topics: Topics[];
    /** preview of the news feed */
    preview: INewsFeedPreview;
}
export interface INewsInfo extends INews {
    /** intro of the news */
    intro: string;
    /** description of the news */
    description: string;
}
interface INews {
    /** id of the news */
    id: string;
    /** title of the news */
    title: string;
    /** time at which the news was uploaded */
    uploadedAt: string;
    /** thumbnail image URL of the news */
    thumbnail: string;
    /** URL of the news */
    url: string;
}
interface INewsFeedPreview {
    /** intro of the feed */
    intro: string;
    /** some contents of the feed */
    full: string;
}
export interface IMovieInfo extends IMovieResult {
    cover?: string;
    recommendations?: IMovieResult[];
    genres?: string[];
    description?: string;
    rating?: number;
    status?: MediaStatus;
    duration?: string;
    production?: string;
    casts?: string[];
    tags?: string[];
    totalEpisodes?: number;
    seasons?: {
        season: number;
        image?: string;
        episodes: IMovieEpisode[];
    }[];
    episodes?: IMovieEpisode[];
}
export declare enum Genres {
    ACTION = "Action",
    ADVENTURE = "Adventure",
    CARS = "Cars",
    COMEDY = "Comedy",
    DRAMA = "Drama",
    ECCHI = "Ecchi",
    FANTASY = "Fantasy",
    HORROR = "Horror",
    MAHOU_SHOUJO = "Mahou Shoujo",
    MECHA = "Mecha",
    MUSIC = "Music",
    MYSTERY = "Mystery",
    PSYCHOLOGICAL = "Psychological",
    ROMANCE = "Romance",
    SCI_FI = "Sci-Fi",
    SLICE_OF_LIFE = "Slice of Life",
    SPORTS = "Sports",
    SUPERNATURAL = "Supernatural",
    THRILLER = "Thriller"
}
export declare enum Topics {
    ANIME = "anime",
    ANIMATION = "animation",
    MANGA = "manga",
    GAMES = "games",
    NOVELS = "novels",
    LIVE_ACTION = "live-action",
    COVID_19 = "covid-19",
    INDUSTRY = "industry",
    MUSIC = "music",
    PEOPLE = "people",
    MERCH = "merch",
    EVENTS = "events"
}
export interface ProxyConfig {
    /**
     * The proxy URL
     * @example https://proxy.com
     **/
    url: string | string[];
    /**
     * X-API-Key header value (if any)
     **/
    key?: string;
}
export {};
