import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer, StreamingServers, IAnimeEpisode } from '../../models';
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
     * @param page number
     */
    fetchSubbedAnime(page?: number): Promise<ISearch<IAnimeResult>>;
    /**
     * @param page number
     */
    fetchDubbedAnime(page?: number): Promise<ISearch<IAnimeResult>>;
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
     * Fetches the list of episodes that the user is currently watching.
     * @param connectSid The session ID of the user. Note: This can be obtained from the browser cookies (needs to be signed in)
     * @returns A promise that resolves to an array of anime episodes.
     */
    fetchContinueWatching(connectSid: string): Promise<IAnimeEpisode[]>;
    /**
     * @param id Anime id
     */
    fetchAnimeInfo: (id: string) => Promise<IAnimeInfo>;
    /**
     *
     * @param episodeId Episode id
     */
    fetchEpisodeSources: (episodeId: string, server?: StreamingServers) => Promise<ISource>;
    private verifyLoginState;
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
