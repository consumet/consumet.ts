import { MovieParser, TvType, IMovieInfo, IEpisodeServer, StreamingServers, ISource, IMovieResult, ISearch, ProxyConfig } from '../../models';
declare class ViewAsian extends MovieParser {
    private proxyConfig?;
    readonly name = "ViewAsian";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    supportedTypes: Set<TvType>;
    constructor(proxyConfig?: ProxyConfig | undefined);
    search: (query: string, page?: number) => Promise<ISearch<IMovieResult>>;
    fetchMediaInfo: (mediaId: string) => Promise<IMovieInfo>;
    fetchEpisodeSources: (episodeId: string, server?: StreamingServers) => Promise<ISource>;
    fetchEpisodeServers(episodeId: string, ...args: any): Promise<IEpisodeServer[]>;
}
export default ViewAsian;
