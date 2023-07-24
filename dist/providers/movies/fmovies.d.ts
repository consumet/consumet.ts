import { AxiosAdapter } from 'axios';
import { MovieParser, TvType, IMovieInfo, IEpisodeServer, StreamingServers, ISource, IMovieResult, ISearch, ProxyConfig } from '../../models';
declare class Fmovies extends MovieParser {
    readonly name = "Fmovies";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    supportedTypes: Set<TvType>;
    private fmoviesResolver;
    private apiKey;
    constructor(fmoviesResolver?: string, proxyConfig?: ProxyConfig, apiKey?: string, adapter?: AxiosAdapter);
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
     * @param server server type (default `Vizcloud`) (optional)
     */
    fetchEpisodeSources: (episodeId: string, mediaId: string, server?: StreamingServers) => Promise<ISource>;
    /**
     *
     * @param episodeId takes episode link or movie id
     * @param mediaId takes movie link or id (found on movie info object)
     */
    fetchEpisodeServers: (episodeId: string, mediaId: string) => Promise<IEpisodeServer[]>;
    private ev;
    private decrypt;
    private ajaxReqUrl;
}
export default Fmovies;
