import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer } from '../../models';
declare class AnimeDrive extends AnimeParser {
    readonly name = "AnimeDrive";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    /**
     * @param query Search query
     * @param page Page number (optional)
     */
    search: (query: string, page?: number) => Promise<ISearch<IAnimeResult>>;
    /**
     * @param id Anime id
     */
    fetchAnimeInfo: (id: string) => Promise<IAnimeInfo>;
    private parseType;
    private parseStatus;
    /**
     * @param page Page number
     */
    fetchRecentEpisodes: (page?: number) => Promise<ISearch<IAnimeResult>>;
    /**
     *
     * @param episodeId episode id
     */
    fetchEpisodeSources: (episodeId: string) => Promise<ISource>;
    /**
     * @deprecated Use fetchEpisodeSources instead
     */
    fetchEpisodeServers: (_episodeId: string) => Promise<IEpisodeServer[]>;
}
export default AnimeDrive;
