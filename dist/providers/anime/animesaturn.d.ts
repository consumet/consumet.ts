import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer } from '../../models';
declare class AnimeSaturn extends AnimeParser {
    readonly name = "AnimeSaturn";
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
     * Fetch anime information
     * @param id Anime ID/slug
     * @returns Promise<IAnimeInfo>
     */
    fetchAnimeInfo: (id: string) => Promise<IAnimeInfo>;
    /**
     * Fetch episode video sources
     * @param episodeId Episode ID
     * @returns Promise<ISource>
     */
    fetchEpisodeSources: (episodeId: string) => Promise<ISource>;
    /**
     * Fetch available episode servers
     * @param episodeId Episode ID
     * @returns Promise<IEpisodeServer[]>
     */
    fetchEpisodeServers: (episodeId: string) => Promise<IEpisodeServer[]>;
}
export default AnimeSaturn;
