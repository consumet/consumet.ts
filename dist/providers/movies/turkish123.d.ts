import { MovieParser, TvType, IMovieInfo, IAnimeInfo, IEpisodeServer, ISource } from '../../models';
declare class Turkish extends MovieParser {
    readonly name = "Turkish123";
    protected baseUrl: string;
    protected classPath: string;
    supportedTypes: Set<TvType>;
    private static readonly USER_AGENT;
    /**
     * Search for Turkish TV shows
     * @param query search query string
     */
    search(query: string): Promise<IMovieInfo[]>;
    /**
     * Fetch detailed media information
     * @param mediaId media id
     */
    fetchMediaInfo(mediaId: string): Promise<IMovieInfo | IAnimeInfo>;
    /**
     * Fetch episode servers (not implemented)
     */
    fetchEpisodeServers(): Promise<IEpisodeServer[]>;
    /**
     * Fetch episode sources
     * @param episodeId episode id
     */
    fetchEpisodeSources(episodeId: string): Promise<ISource>;
    /**
     * Get common request headers
     */
    private getRequestHeaders;
}
export default Turkish;
