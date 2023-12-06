import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer } from '../../models';
import { AxiosAdapter } from 'axios';
import { ProxyConfig } from '../../models';
type ProviderId = '9anime' | 'animepahe' | 'zoro' | 'gogoanime';
declare class Anify extends AnimeParser {
    protected proxyConfig?: ProxyConfig | undefined;
    protected adapter?: AxiosAdapter | undefined;
    protected providerId: ProviderId;
    readonly name = "Anify";
    protected baseUrl: string;
    protected classPath: string;
    private readonly actions;
    constructor(proxyConfig?: ProxyConfig | undefined, adapter?: AxiosAdapter | undefined, providerId?: ProviderId);
    /**
     * @param query Search query
     * @param page Page number (optional)
     */
    rawSearch: (query: string, page?: number) => Promise<any>;
    /**
     * @param query Search query
     * @param page Page number (optional)
     */
    search: (query: string, page?: number) => Promise<ISearch<IAnimeResult>>;
    /**
     * @param id Anime id
     */
    fetchAnimeInfo: (id: string) => Promise<IAnimeInfo>;
    fetchAnimeInfoByIdRaw: (id: string) => Promise<any>;
    /**
     * @param id anilist id
     */
    fetchAnimeInfoByAnilistId: (id: string, providerId?: '9anime' | 'animepahe' | 'zoro' | 'gogoanime') => Promise<IAnimeInfo>;
    fetchEpisodeSources: (episodeId: string, episodeNumber: number, id: number) => Promise<ISource>;
    /**
     * @deprecated
     */
    fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]>;
}
export default Anify;
