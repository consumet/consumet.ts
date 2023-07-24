import { MovieParser, TvType, IMovieInfo, IEpisodeServer, StreamingServers, ISource, IMovieResult, ISearch } from '../../models';
declare class KissAsian extends MovieParser {
    readonly name = "KissAsian";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    supportedTypes: Set<TvType>;
    search: (query: string, page?: number) => Promise<ISearch<IMovieResult>>;
    fetchMediaInfo: (mediaId: string) => Promise<IMovieInfo>;
    fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]>;
    fetchEpisodeSources: (episodeId: string, server?: StreamingServers) => Promise<ISource>;
}
export default KissAsian;
