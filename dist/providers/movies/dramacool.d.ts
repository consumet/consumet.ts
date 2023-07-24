import { AxiosAdapter } from 'axios';
import { MovieParser, TvType, IMovieInfo, IEpisodeServer, StreamingServers, ISource, IMovieResult, ISearch, ProxyConfig } from '../../models';
declare class DramaCool extends MovieParser {
    private proxyConfig?;
    private adapter?;
    readonly name = "DramaCool";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    supportedTypes: Set<TvType>;
    constructor(proxyConfig?: ProxyConfig | undefined, adapter?: AxiosAdapter | undefined);
    search: (query: string, page?: number) => Promise<ISearch<IMovieResult>>;
    fetchMediaInfo: (mediaId: string) => Promise<IMovieInfo>;
    fetchEpisodeServers(episodeId: string, ...args: any): Promise<IEpisodeServer[]>;
    fetchEpisodeSources: (episodeId: string, server?: StreamingServers) => Promise<ISource>;
    private removeContainsFromString;
}
export default DramaCool;
