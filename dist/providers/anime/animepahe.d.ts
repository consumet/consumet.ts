import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer } from '../../models';
declare class AnimePahe extends AnimeParser {
    readonly name = "AnimePahe";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    /**
     * Search for anime
     * @param query Search query string
     * @returns Promise<ISearch<IAnimeResult>>
     */
    search: (query: string) => Promise<ISearch<IAnimeResult>>;
    /**
     * @param page page number (optional)
     * @returns Promise<ISearch<IAnimeResult>>
     */
    fetchRecentEpisodes(page?: number): Promise<ISearch<IAnimeResult>>;
    /**
     * Fetch anime information
     * @param id Anime ID in format id/session
     * @param episodePage Episode page number (default: -1 for all episodes)
     * @returns Promise<IAnimeInfo>
     */
    fetchAnimeInfo: (id: string, episodePage?: number) => Promise<IAnimeInfo>;
    /**
     * Fetch episode video sources
     * @param episodeId Episode ID
     * @returns Promise<ISource>
     */
    fetchEpisodeSources: (episodeId: string) => Promise<ISource>;
    private fetchEpisodes;
    /**
     * Fetch episode servers (deprecated)
     * @deprecated AnimePahe doesn't support this method
     * @param episodeLink Episode link
     * @returns Promise<IEpisodeServer[]>
     */
    fetchEpisodeServers: (episodeLink: string) => Promise<IEpisodeServer[]>;
    private Headers;
}
export default AnimePahe;
