import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer, StreamingServers, ProxyConfig } from '../../models';
import { AxiosAdapter } from 'axios';
declare class Anix extends AnimeParser {
    readonly name = "Anix";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private readonly MediaCategory;
    private readonly MediaRegion;
    private readonly defaultSort;
    private readonly requestedWith;
    constructor(customBaseURL?: string, proxy?: ProxyConfig, adapter?: AxiosAdapter);
    /**
     * @param page page number (optional)
     */
    fetchRecentEpisodes: (page?: number, type?: number) => Promise<ISearch<IAnimeResult>>;
    /**
     * @param query Search query
     * @param page Page number (optional)
     */
    search: (query: string, page?: number) => Promise<ISearch<IAnimeResult>>;
    /**
     * @param id Anime id
     */
    fetchAnimeInfo: (id: string) => Promise<IAnimeInfo>;
    fetchRandomAnimeInfo: () => Promise<IAnimeInfo>;
    /**
     *
     * @param id Anime id
     * @param episodeId Episode id
     * @param server Streaming server(optional)
     * @param type Type (optional) (options: `sub`, `dub`, `raw`)
     */
    fetchEpisodeSources: (id: string, episodeId: string, server?: StreamingServers, type?: string) => Promise<ISource>;
    /**
     *
     * @param id Anime id
     * @param episodeId Episode id
     */
    fetchEpisodeServers: (id: string, episodeId: string) => Promise<IEpisodeServer[]>;
    /**
     *
     * @param id Anime id
     * @param episodeId Episode id
     * @param type Type (optional) (options: `sub`, `dub`, `raw`)
     */
    fetchEpisodeServerType: (id: string, episodeId: string, type?: string) => Promise<{
        sub: IEpisodeServer[];
        dub: IEpisodeServer[];
        raw: IEpisodeServer[];
    } | IEpisodeServer[]>;
}
export default Anix;
