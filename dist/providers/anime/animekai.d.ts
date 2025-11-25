import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer, StreamingServers, SubOrSub } from '../../models';
declare class AnimeKai extends AnimeParser {
    readonly name = "AnimeKai";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    /**
     * Search for anime
     * @param query Search query string
     * @param page Page number (default: 1)
     * @returns Promise<ISearch<IAnimeResult>>
     */
    search(query: string, page?: number): Promise<ISearch<IAnimeResult>>;
    /**
     * @param page number
     */
    fetchLatestCompleted(page?: number): Promise<ISearch<IAnimeResult>>;
    /**
     * @param page number
     */
    fetchRecentlyAdded(page?: number): Promise<ISearch<IAnimeResult>>;
    /**
     * @param page number
     */
    fetchRecentlyUpdated(page?: number): Promise<ISearch<IAnimeResult>>;
    /**
     * @param page number
     */
    fetchNewReleases(page?: number): Promise<ISearch<IAnimeResult>>;
    /**
     * @param page number
     */
    fetchMovie(page?: number): Promise<ISearch<IAnimeResult>>;
    /**
     * @param page number
     */
    fetchTV(page?: number): Promise<ISearch<IAnimeResult>>;
    /**
     * @param page number
     */
    fetchOVA(page?: number): Promise<ISearch<IAnimeResult>>;
    /**
     * @param page number
     */
    fetchONA(page?: number): Promise<ISearch<IAnimeResult>>;
    /**
     * @param page number
     */
    fetchSpecial(page?: number): Promise<ISearch<IAnimeResult>>;
    fetchGenres(): Promise<string[]>;
    /**
     * @param page number
     */
    genreSearch(genre: string, page?: number): Promise<ISearch<IAnimeResult>>;
    /**
     * Fetches the schedule for a given date.
     * @param date The date in format 'YYYY-MM-DD'. Defaults to the current date.
     * @returns A promise that resolves to an object containing the search results.
     */
    fetchSchedule(date?: string): Promise<ISearch<IAnimeResult>>;
    fetchSpotlight(): Promise<ISearch<IAnimeResult>>;
    fetchSearchSuggestions(query: string): Promise<ISearch<IAnimeResult>>;
    /**
     * Fetch anime information
     * @param id Anime ID/slug
     * @returns Promise<IAnimeInfo>
     */
    fetchAnimeInfo: (id: string) => Promise<IAnimeInfo>;
    /**
     * Fetch episode video sources
     * @param episodeId Episode ID
     * @param server Server type (default: VidCloud)
     * @param subOrDub Sub or dub preference (default: SUB)
     * @returns Promise<ISource>
     */
    fetchEpisodeSources: (episodeId: string, server?: StreamingServers, subOrDub?: SubOrSub) => Promise<ISource>;
    /**
     * @param url string
     */
    private scrapeCardPage;
    /**
     * @param $ cheerio instance
     */
    private scrapeCard;
    /**
     * Fetch available episode servers
     * @param episodeId Episode ID
     * @param subOrDub Sub or dub preference (default: SUB)
     * @returns Promise<IEpisodeServer[]>
     */
    fetchEpisodeServers: (episodeId: string, subOrDub?: SubOrSub) => Promise<IEpisodeServer[]>;
    private Headers;
}
export default AnimeKai;
