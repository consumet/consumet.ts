import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer, StreamingServers } from '../../models';
interface SearchParams {
    query?: string;
    type?: string;
    status?: string;
    rated?: string;
    score?: number;
    season?: string;
    language?: string;
    startDate?: string;
    endDate?: string;
    sort?: string;
    genres?: string[];
}
declare class Zoro extends AnimeParser {
    readonly name = "Zoro";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    constructor(customBaseURL?: string);
    /**
     * @param query Search query
     * @param page Page number (optional)
     */
    search(query: string, page?: number): Promise<ISearch<IAnimeResult>>;
    /**
     *
     * @param query Search query (optional)
     * @param type Media type (optional) (options: `movie`, `tv`, `ova`, `ona`, `special`, `music`)
     * @param status Status (optional) (options: `finished_airing`, `currently_airing`, `not_yet_aired`)
     * @param rated Rated (optional) (options: `g`, `pg`, `pg_13`, `r`, `r_plus`, `rx`)
     * @param score Score (optional)
     * @param season Season (optional) (options: `winter`, `spring`, `summer`, `fall`)
     * @param language Language (optional) (options: `sub`, `dub`, `sub_dub`)
     * @param startDate Start Date (optional) format: `YYYY-MM-DD`
     * @param endDate End Date (optional) format: `YYYY-MM-DD`
     * @param sort Sort (optional) (options: `default`, `recently_added`, `recently_updated`, `score`, `name_az`, `released_date`, `most_watched`)
     * @param genres Genres (optional)
     * @returns
     */
    fetchAdvanceSearch(query?: string, page?: number, filterOptions?: SearchParams): Promise<ISearch<IAnimeResult>>;
    /**
     * @param page number
     */
    fetchTopAiring(page?: number): Promise<ISearch<IAnimeResult>>;
    /**
     * @param page number
     */
    fetchMostPopular(page?: number): Promise<ISearch<IAnimeResult>>;
    /**
     * @param page number
     */
    fetchMostFavorite(page?: number): Promise<ISearch<IAnimeResult>>;
    /**
     * @param page number
     */
    fetchLatestCompleted(page?: number): Promise<ISearch<IAnimeResult>>;
    /**
     * @param page number
     */
    fetchRecentlyUpdated(page?: number): Promise<ISearch<IAnimeResult>>;
    /**
     * @param page number
     */
    fetchRecentlyAdded(page?: number): Promise<ISearch<IAnimeResult>>;
    /**
     * @param page number
     */
    fetchTopUpcoming(page?: number): Promise<ISearch<IAnimeResult>>;
    /**
     * @param studio Studio id, e.g. "toei-animation"
     * @param page page number (optional) `default 1`
     */
    fetchStudio(studio: string, page?: number): Promise<ISearch<IAnimeResult>>;
    /**
     * Fetches the schedule for a given date.
     * @param date The date in format 'YYYY-MM-DD'. Defaults to the current date.
     * @returns A promise that resolves to an object containing the search results.
     */
    fetchSchedule(date?: string): Promise<ISearch<IAnimeResult>>;
    fetchSpotlight(): Promise<ISearch<IAnimeResult>>;
    fetchSearchSuggestions(query: string): Promise<ISearch<IAnimeResult>>;
    /**
     * @param id Anime id
     */
    fetchAnimeInfo: (id: string) => Promise<IAnimeInfo>;
    /**
     *
     * @param episodeId Episode id
     */
    fetchEpisodeSources: (episodeId: string, server?: StreamingServers) => Promise<ISource>;
    private retrieveServerId;
    /**
     * @param url string
     */
    private scrapeCardPage;
    /**
     * @param $ cheerio instance
     */
    private scrapeCard;
    /**
     * @deprecated
     * @param episodeId Episode id
     */
    fetchEpisodeServers: (episodeId: string) => Promise<IEpisodeServer[]>;
}
export default Zoro;
