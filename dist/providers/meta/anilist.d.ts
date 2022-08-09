import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer } from '../../models';
declare class Anilist extends AnimeParser {
    readonly name = "AnilistWithKitsu";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private readonly anilistGraphqlUrl;
    private readonly kitsuGraphqlUrl;
    private readonly malSyncUrl;
    private provider;
    /**
     * This class maps anilist to kitsu with any other anime provider.
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
    fetchTrendingAnime: (page?: number, perPage?: number) => Promise<ISearch<IAnimeResult>>;
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
    private findAnimeRaw;
}
export default Anilist;
