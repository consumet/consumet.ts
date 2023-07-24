import { AxiosAdapter } from 'axios';
import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, IEpisodeServer, ISource, StreamingServers, ProxyConfig } from '../../models';
/**
 * **Use at your own risk :)** 9anime devs keep changing the keys every week
 */
declare class NineAnime extends AnimeParser {
    readonly name = "9Anime";
    private nineAnimeResolver;
    private apiKey;
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    readonly isWorking = false;
    constructor(nineAnimeResolver?: string, proxyConfig?: ProxyConfig, apiKey?: string, adapter?: AxiosAdapter);
    search(query: string, page?: number): Promise<ISearch<IAnimeResult>>;
    fetchAnimeInfo(animeUrl: string): Promise<IAnimeInfo>;
    fetchEpisodeSources(episodeId: string, server?: StreamingServers): Promise<ISource>;
    fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]>;
    ev(query: string, raw?: boolean): Promise<string>;
    searchVrf(query: string, raw?: boolean): Promise<string>;
    decrypt(query: string, raw?: boolean): Promise<string>;
    vizcloud(query: string): Promise<string>;
    customRequest(query: string, action: string): Promise<string>;
}
export default NineAnime;
