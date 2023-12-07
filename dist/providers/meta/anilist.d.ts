import { AxiosAdapter } from 'axios';
import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IAnimeEpisode, IEpisodeServer, Genres, MangaParser, IMangaChapterPage, IMangaInfo, IMangaResult, ProxyConfig } from '../../models';
declare class Anilist extends AnimeParser {
    proxyConfig?: ProxyConfig | undefined;
    readonly name = "Anilist";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private readonly anilistGraphqlUrl;
    private readonly kitsuGraphqlUrl;
    private readonly malSyncUrl;
    private readonly anifyUrl;
    provider: AnimeParser;
    /**
     * This class maps anilist to kitsu with any other anime provider.
     * kitsu is used for episode images, titles and description.
     * @param provider anime provider (optional) default: Gogoanime
     * @param proxyConfig proxy config (optional)
     * @param adapter axios adapter (optional)
     */
    constructor(provider?: AnimeParser, proxyConfig?: ProxyConfig | undefined, adapter?: AxiosAdapter);
    /**
     * @param query Search query
     * @param page Page number (optional)
     * @param perPage Number of results per page (optional) (default: 15) (max: 50)
     */
    search: (query: string, page?: number, perPage?: number) => Promise<ISearch<IAnimeResult>>;
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
     * @param year Year (optional) e.g. `2022`
     * @param status Status (optional) (options: `RELEASING`, `FINISHED`, `NOT_YET_RELEASED`, `CANCELLED`, `HIATUS`)
     * @param season Season (optional) (options: `WINTER`, `SPRING`, `SUMMER`, `FALL`)
     */
    advancedSearch: (query?: string, type?: string, page?: number, perPage?: number, format?: string, sort?: string[], genres?: Genres[] | string[], id?: string | number, year?: number, status?: string, season?: string) => Promise<ISearch<IAnimeResult>>;
    /**
     *
     * @param id Anime id
     * @param dub to get dubbed episodes (optional) set to `true` to get dubbed episodes. **ONLY WORKS FOR GOGOANIME**
     * @param fetchFiller to get filler boolean on the episode object (optional) set to `true` to get filler boolean on the episode object.
     */
    fetchAnimeInfo: (id: string, dub?: boolean, fetchFiller?: boolean) => Promise<IAnimeInfo>;
    /**
     *
     * @param episodeId Episode id
     */
    fetchEpisodeSources: (episodeId: string, ...args: any) => Promise<ISource>;
    /**
     *
     * @param episodeId Episode id
     */
    fetchEpisodeServers: (episodeId: string) => Promise<IEpisodeServer[]>;
    private findAnime;
    private findAnimeSlug;
    private findKitsuAnime;
    /**
     * @param page page number to search for (optional)
     * @param perPage number of results per page (optional)
     */
    fetchTrendingAnime: (page?: number, perPage?: number) => Promise<ISearch<IAnimeResult>>;
    /**
     *
     * @param page page number to search for (optional)
     * @param perPage number of results per page (optional)
     */
    fetchPopularAnime: (page?: number, perPage?: number) => Promise<ISearch<IAnimeResult>>;
    /**
     *
     * @param page page number (optional)
     * @param perPage number of results per page (optional)
     * @param weekStart Filter by the start of the week (optional) (default: todays date) (options: 2 = Monday, 3 = Tuesday, 4 = Wednesday, 5 = Thursday, 6 = Friday, 0 = Saturday, 1 = Sunday) you can use either the number or the string
     * @param weekEnd Filter by the end of the week (optional) similar to weekStart
     * @param notYetAired if true will return anime that have not yet aired (optional)
     * @returns the next airing episodes
     */
    fetchAiringSchedule: (page?: number, perPage?: number, weekStart?: number | string, weekEnd?: number | string, notYetAired?: boolean) => Promise<ISearch<IAnimeResult>>;
    /**
     *
     * @param genres An array of genres to filter by (optional) genres: [`Action`, `Adventure`, `Cars`, `Comedy`, `Drama`, `Fantasy`, `Horror`, `Mahou Shoujo`, `Mecha`, `Music`, `Mystery`, `Psychological`, `Romance`, `Sci-Fi`, `Slice of Life`, `Sports`, `Supernatural`, `Thriller`]
     * @param page page number (optional)
     * @param perPage number of results per page (optional)
     */
    fetchAnimeGenres: (genres: string[] | Genres[], page?: number, perPage?: number) => Promise<ISearch<IAnimeResult>>;
    private findAnimeRaw;
    /**
     * @returns a random anime
     */
    fetchRandomAnime: () => Promise<IAnimeInfo>;
    /**
     * @param provider The provider to get the episode Ids from (optional) default: `gogoanime` (options: `gogoanime`, `zoro`)
     * @param page page number (optional)
     * @param perPage number of results per page (optional)
     */
    fetchRecentEpisodes: (provider?: 'gogoanime' | 'zoro', page?: number, perPage?: number) => Promise<ISearch<IAnimeResult>>;
    private fetchDefaultEpisodeList;
    /**
     * @param id anilist id
     * @param dub language of the dubbed version (optional) currently only works for gogoanime
     * @param fetchFiller to get filler boolean on the episode object (optional) set to `true` to get filler boolean on the episode object.
     * @returns episode list **(without anime info)**
     */
    fetchEpisodesListById: (id: string, dub?: boolean, fetchFiller?: boolean) => Promise<IAnimeEpisode[]>;
    /**
     * @param id anilist id
     * @returns anilist data for the anime **(without episodes)** (use `fetchEpisodesListById` to get the episodes) (use `fetchAnimeInfo` to get both)
     */
    fetchAnilistInfoById: (id: string) => Promise<IAnimeInfo>;
    /**
     * TODO: finish this (got lazy)
     * @param id staff id from anilist
     *
     */
    fetchStaffById: (id: number) => Promise<never>;
    /**
     *
     * @param id character id from anilist
     */
    fetchCharacterInfoById: (id: string) => Promise<{
        id: any;
        name: {
            first: any;
            last: any;
            full: any;
            native: any;
            userPreferred: any;
            alternative: any;
            alternativeSpoiler: any;
        };
        image: any;
        imageHash: string;
        description: any;
        gender: any;
        dateOfBirth: {
            year: any;
            month: any;
            day: any;
        };
        bloodType: any;
        age: any;
        hairColor: any;
        eyeColor: any;
        height: any;
        weight: any;
        occupation: any;
        partner: any;
        relatives: any;
        race: any;
        rank: any;
        previousPosition: any;
        dislikes: any;
        sign: any;
        zodicSign: any;
        zodicAnimal: any;
        themeSong: any;
        relations: any;
    }>;
    /**
     * Anilist Anime class
     */
    static Anime: typeof Anilist;
    /**
     * Anilist Manga Class
     */
    static Manga: {
        new (provider?: MangaParser): {
            provider: MangaParser;
            /**
             *
             * @param query query to search for
             * @param page (optional) page number (default: `1`)
             * @param perPage (optional) number of results per page (default: `20`)
             */
            search: (query: string, page?: number, perPage?: number) => Promise<ISearch<IMangaResult>>;
            /**
             *
             * @param chapterId chapter id
             * @param args args to pass to the provider (if any)
             * @returns
             */
            fetchChapterPages: (chapterId: string, ...args: any) => Promise<IMangaChapterPage[]>;
            fetchMangaInfo: (id: string, ...args: any) => Promise<IMangaInfo>;
        };
    };
    private findMangaSlug;
    private findMangaRaw;
    private findManga;
}
export default Anilist;
