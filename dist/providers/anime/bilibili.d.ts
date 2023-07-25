import { AnimeParser, IAnimeInfo, IAnimeResult, IEpisodeServer, ISearch, ISource, ProxyConfig } from '../../models';
import { AxiosAdapter } from 'axios';
declare class Bilibili extends AnimeParser {
    readonly name = "Bilibili";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private apiUrl;
    private cookie;
    private locale;
    private sgProxy;
    constructor(cookie?: string, locale?: string, proxyConfig?: ProxyConfig, adapter?: AxiosAdapter);
    search(query: string): Promise<ISearch<IAnimeResult>>;
    fetchAnimeInfo(id: string): Promise<IAnimeInfo>;
    fetchEpisodeSources(episodeId: string, ...args: any): Promise<ISource>;
    fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]>;
}
export default Bilibili;
