import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer, StreamingServers, ProxyConfig } from '../../models';
declare class Zoro extends AnimeParser {
    private proxyConfig?;
    readonly name = "Zoro";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    /**
     *
     * @param zoroBase Base url of zoro (optional) (default: https://aniwatch.to)
     * @param proxyConfig Proxy configuration (optional)
     * @example
     * ```ts
     * const zoro = new Zoro(undefined, { url: "http://localhost:8080" });
     * ```
     */
    constructor(zoroBase?: string, proxyConfig?: ProxyConfig | undefined);
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
