import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IAnimeEpisode, IEpisodeServer, Genres, MangaParser, IMangaChapterPage, IMangaInfo } from '../../models';
declare class Anilist extends AnimeParser {
    readonly name = "Anilist";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private readonly anilistGraphqlUrl;
    private readonly kitsuGraphqlUrl;
    private readonly malSyncUrl;
    private readonly enimeUrl;
    provider: AnimeParser;
    /**
     * This class maps anilist to kitsu with any other anime provider.
     * kitsu is used for episode images, titles and description.
     * @param provider anime provider (optional) default: Gogoanime
     */
    constructor(provider?: AnimeParser);
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
     */
    advancedSearch: (query?: string, type?: string, page?: number, perPage?: number, format?: string, sort?: string[], genres?: Genres[] | string[], id?: string | number, year?: number, status?: string) => Promise<ISearch<IAnimeResult>>;
    /**
     *
     * @param id Anime id
     * @param dub to get dubbed episodes (optional) set to `true` to get dubbed episodes. **ONLY WORKS FOR GOGOANIME**
     */
    fetchAnimeInfo: (id: string, dub?: boolean) => Promise<IAnimeInfo>;
    /**
     *
     * @param episodeId Episode id
     */
    fetchEpisodeSources: (episodeId: string) => Promise<ISource>;
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
     * @param weekStart Filter by the time in epoch seconds (optional) eg. if you set weekStart to this week's monday, and set weekEnd to next week's sunday, you will get all the airing anime in between these two dates.
     * @param weekEnd Filter by the time in epoch seconds (optional)
     * @param notYetAired if true will return anime that have not yet aired (optional)
     * @returns the next airing episodes
     */
    fetchAiringSchedule: (page?: number, perPage?: number, weekStart?: number, weekEnd?: number, notYetAired?: boolean) => Promise<ISearch<IAnimeResult>>;
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
     * @returns episode list
     */
    fetchEpisodesListById: (id: string, dub?: boolean) => Promise<IAnimeEpisode[]>;
    /**
     * @param id anilist id
     * @returns anilist data for the anime
     */
    fetchAnilistInfoById: (id: string) => Promise<IAnimeInfo>;
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
     * TODO: Anilist Manga Class
     */
    static Manga: {
        new (provider?: MangaParser): {
            provider: MangaParser;
            search: (query: string, ...args: any[]) => Promise<unknown>;
            fetchChapterPages: (chapterId: string, ...args: any) => Promise<IMangaChapterPage[]>;
            fetchMangaInfo: (mangaUrl: string, ...args: any) => Promise<IMangaInfo>;
        };
    };
}
export default Anilist;
