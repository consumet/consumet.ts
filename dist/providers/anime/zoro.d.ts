import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer, StreamingServers } from '../../models';
declare class Zoro extends AnimeParser {
    readonly name = "Zoro";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    constructor(zoroBase?: string);
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
     *
     * @param episodeId Episode id
     */
    fetchEpisodeSources: (episodeId: string, server?: StreamingServers) => Promise<ISource>;
    private retrieveServerId;
    /**
     * @param page Page number
     */
    fetchRecentEpisodes: (page?: number) => Promise<ISearch<IAnimeResult>>;
    /**
     * @deprecated
     * @param episodeId Episode id
     */
    fetchEpisodeServers: (episodeId: string) => Promise<IEpisodeServer[]>;
}
export default Zoro;
