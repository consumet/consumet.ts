import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer } from '../../models';
declare class AnimeFox extends AnimeParser {
    readonly name = "AnimeFox";
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
    fetchEpisodeServers: (episodeIs: string) => Promise<IEpisodeServer[]>;
}
export default AnimeFox;
