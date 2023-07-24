import { AxiosAdapter } from 'axios';
import { MovieParser, TvType, IMovieInfo, IEpisodeServer, StreamingServers, ISource, IMovieResult, ISearch } from '../../models';
declare class FlixHQ extends MovieParser {
    private proxyConfig?;
    private adapter?;
    readonly name = "FlixHQ";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    supportedTypes: Set<TvType>;
    constructor(proxyConfig?: any, adapter?: AxiosAdapter | undefined);
    /**
     *
     * @param query search query string
     * @param page page number (default 1) (optional)
     */
    search: (query: string, page?: number) => Promise<ISearch<IMovieResult>>;
    /**
     *
     * @param mediaId media link or id
     */
    fetchMediaInfo: (mediaId: string) => Promise<IMovieInfo>;
    /**
     *
     * @param episodeId episode id
     * @param mediaId media id
     * @param server server type (default `VidCloud`) (optional)
     */
    fetchEpisodeSources: (episodeId: string, mediaId: string, server?: StreamingServers) => Promise<ISource>;
    /**
     *
     * @param episodeId takes episode link or movie id
     * @param mediaId takes movie link or id (found on movie info object)
     */
    fetchEpisodeServers: (episodeId: string, mediaId: string) => Promise<IEpisodeServer[]>;
    fetchRecentMovies: () => Promise<IMovieResult[]>;
    fetchRecentTvShows: () => Promise<IMovieResult[]>;
    fetchTrendingMovies: () => Promise<IMovieResult[]>;
    fetchTrendingTvShows: () => Promise<IMovieResult[]>;
}
export default FlixHQ;
