import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer, StreamingServers, SubOrSub, IAnimeEpisode, WatchListType } from '../../models';
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
     * Fetch advanced anime search results with various filters.
     *
     * @param page Page number (default: 1)
     * @param type One of (Optional): movie, tv, ova, ona, special, music
     * @param status One of (Optional): finished_airing, currently_airing, not_yet_aired
     * @param rated One of (Optional): g, pg, pg_13, r, r_plus, rx
     * @param score Number from 1 to 10 (Optional)
     * @param season One of (Optional): spring, summer, fall, winter
     * @param language One of (Optional): sub, dub, sub_dub
     * @param startDate Start date object { year, month, day } (Optional)
     * @param endDate End date object { year, month, day } (Optional)
     * @param sort One of (Optional): recently_added, recently_updated, score, name_az, released_date, most_watched
     * @param genres Array of genres (Optional): action, adventure, cars, comedy, dementia, demons, mystery, drama, ecchi, fantasy, game, historical, horror, kids, magic, martial_arts, mecha, music, parody, samurai, romance, school, sci_fi, shoujo, shoujo_ai, shounen, shounen_ai, space, sports, super_power, vampire, harem, military, slice_of_life, supernatural, police, psychological, thriller, seinen, isekai, josei
     * @returns A Promise resolving to the search results.
     */
    fetchAdvancedSearch(page?: number, type?: string, status?: string, rated?: string, score?: number, season?: string, language?: string, startDate?: {
        year: number;
        month: number;
        day: number;
    }, endDate?: {
        year: number;
        month: number;
        day: number;
    }, sort?: string, genres?: string[]): Promise<ISearch<IAnimeResult>>;
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
    fetchWatchList(connectSid: string, page?: number, sortListType?: WatchListType): Promise<ISearch<IAnimeResult>>;
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
