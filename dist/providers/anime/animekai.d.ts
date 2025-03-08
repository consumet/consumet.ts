import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer, StreamingServers, SubOrSub } from '../../models';
declare class AnimeKai extends AnimeParser {
    readonly name = "AnimeKai";
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
     * @param id Anime id
     */
    fetchAnimeInfo: (id: string) => Promise<IAnimeInfo>;
    /**
     *
     * @param episodeId Episode id
     * @param server server type (default `VidCloud`) (optional)
     * @param subOrDub sub or dub (default `SubOrSub.SUB`) (optional)
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
     * @param episodeId Episode id
     * @param subOrDub sub or dub (default `sub`) (optional)
     */
    fetchEpisodeServers: (episodeId: string, subOrDub?: SubOrSub) => Promise<IEpisodeServer[]>;
    private Headers;
}
export default AnimeKai;
