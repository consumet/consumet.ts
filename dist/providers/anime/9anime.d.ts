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
    constructor(nineAnimeResolver?: string, proxyConfig?: ProxyConfig, apiKey?: string);
    search(query: string, page?: number): Promise<ISearch<IAnimeResult>>;
    fetchAnimeInfo(animeUrl: string): Promise<IAnimeInfo>;
    fetchEpisodeSources(episodeId: string, server?: StreamingServers): Promise<ISource>;
    fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]>;
    private ev;
    private searchVrf;
}
export default NineAnime;
