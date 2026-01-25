import { MovieParser, TvType, IMovieInfo, IEpisodeServer, ISource, IMovieResult, ISearch } from '../../models';
declare enum NetMirrorOTT {
    NETFLIX = "nf",
    PRIME = "pv",
    DISNEY = "dp",
    LIONSGATE = "lg"
}
declare class NetMirror extends MovieParser {
    readonly name = "NetMirror";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    supportedTypes: Set<TvType>;
    private ott;
    private headers;
    setOTT(provider: NetMirrorOTT): void;
    private getCookies;
    search: (query: string, page?: number) => Promise<ISearch<IMovieResult>>;
    private fetchPostData;
    fetchMediaInfo: (mediaId: string) => Promise<IMovieInfo>;
    fetchEpisodeServers: (episodeId: string, mediaId?: string) => Promise<IEpisodeServer[]>;
    fetchEpisodeSources: (episodeId: string, mediaId?: string) => Promise<ISource>;
    fetchHlsPlaylist: (episodeId: string) => Promise<string>;
    fetchRecentMovies: () => Promise<IMovieResult[]>;
    fetchTrendingMovies: () => Promise<IMovieResult[]>;
}
export default NetMirror;
