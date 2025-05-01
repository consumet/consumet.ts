import { MovieParser, TvType, type IMovieInfo, type IEpisodeServer, type ISource, type IMovieResult, type ISearch } from '../../models';
declare class NetflixMirror extends MovieParser {
    readonly name = "NetflixMirror";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    supportedTypes: Set<TvType>;
    private nfCookie;
    constructor(customBaseURL?: string);
    private initCookie;
    private Headers;
    /**
     *
     * @param query search query string
     * @param page page number (default 1) (optional)
     */
    search: (query: string, page?: number) => Promise<ISearch<IMovieResult>>;
    private fetchAllEpisodesForSeason;
    private fetchAllEpisodesOrdered;
    /**
     *
     * @param mediaId media link or id
     */
    fetchMediaInfo: (mediaId: string) => Promise<IMovieInfo>;
    /**
     *
     * @param episodeId episode id
     * @param media media id
     */
    fetchEpisodeSources: (episodeId: string, mediaId?: string) => Promise<ISource>;
    /**
     * @deprecated method not implemented
     * @param episodeId takes episode link or movie id
     */
    fetchEpisodeServers: (episodeId: string) => Promise<IEpisodeServer[]>;
}
export default NetflixMirror;
