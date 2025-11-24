import { IEpisodeServer, IMovieInfo, IMovieResult, ISearch, ISource, MovieParser, StreamingServers, TvType } from '../../models';
declare class DramaCool extends MovieParser {
    readonly name = "DramaCool";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    supportedTypes: Set<TvType>;
    private static readonly NAV_SELECTOR;
    /**
     * Search for dramas by query
     * @param query search query string
     * @param page page number (default 1)
     */
    search: (query: string, page?: number) => Promise<ISearch<IMovieResult>>;
    /**
     * Fetch detailed media information
     * @param mediaId media link or id
     */
    fetchMediaInfo: (mediaId: string) => Promise<IMovieInfo>;
    /**
     * Fetch available episode servers
     * @param episodeId episode link or id
     */
    fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]>;
    /**
     * Fetch episode sources from a specific server
     * @param episodeId episode id or URL
     * @param server streaming server type
     */
    fetchEpisodeSources: (episodeId: string, server?: StreamingServers) => Promise<ISource>;
    /**
     * Fetch recently added movies
     * @param page page number (default 1)
     */
    fetchRecentMovies: (page?: number) => Promise<ISearch<IMovieResult>>;
    /**
     * Fetch recently added TV shows
     * @param page page number (default 1)
     */
    fetchRecentTvShows: (page?: number) => Promise<ISearch<IMovieResult>>;
    /**
     * Fetch popular dramas
     * @param page page number (default 1)
     */
    fetchPopular: (page?: number) => Promise<ISearch<IMovieResult>>;
    /**
     * Fetch spotlight/featured content
     */
    fetchSpotlight: () => Promise<ISearch<IMovieResult>>;
    /**
     * Fetch list content with pagination
     * @param url URL to fetch
     * @param page current page number
     * @param includeTvShowData whether to include TV show episode data
     */
    private fetchListContent;
    /**
     * Extract sources from a streaming server
     * @param episodeUrl episode URL
     * @param server streaming server type
     */
    private extractFromServer;
    /**
     * Set pagination information from navigation element
     * @param $ cheerio instance
     * @param results results object to update
     * @param currentPage current page number
     */
    private setPaginationInfo;
    /**
     * Extract field value from media info page
     * @param $ cheerio instance
     * @param fieldName field name to extract
     */
    private extractFieldValue;
    /**
     * Normalize URL by adding https:// prefix if needed
     * @param url URL to normalize
     */
    private normalizeUrl;
    /**
     * Generate download link from episode URL
     * @param url episode URL
     */
    private generateDownloadLink;
    /**
     * Remove field label from extracted text
     * @param str text to clean
     * @param contains field label to remove
     */
    private removeContainsFromString;
    /**
     * Clean up semicolon-separated text
     * @param str text to clean
     */
    private cleanUpText;
}
export default DramaCool;
