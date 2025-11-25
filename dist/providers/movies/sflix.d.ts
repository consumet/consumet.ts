import { MovieParser, TvType, IMovieInfo, IEpisodeServer, StreamingServers, ISource, IMovieResult, ISearch } from '../../models';
declare class SFlix extends MovieParser {
    readonly name = "SFlix";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    supportedTypes: Set<TvType>;
    private static readonly NAV_SELECTOR;
    /**
     * Search for movies or TV shows
     * @param query search query string
     * @param page page number (default: 1)
     */
    search: (query: string, page?: number) => Promise<ISearch<IMovieResult>>;
    /**
     * Fetch detailed media information
     * @param mediaId media link or id
     */
    fetchMediaInfo: (mediaId: string) => Promise<IMovieInfo>;
    /**
     * Fetch available episode servers
     * @param episodeId episode link or movie id
     * @param mediaId movie link or id
     */
    fetchEpisodeServers: (episodeId: string, mediaId: string) => Promise<IEpisodeServer[]>;
    /**
     * Fetch episode sources from a specific server
     * @param episodeId episode id or URL
     * @param mediaId media id
     * @param server streaming server type (default: UpCloud)
     */
    fetchEpisodeSources: (episodeId: string, mediaId: string, server?: StreamingServers) => Promise<ISource>;
    /**
     * Fetch recent movies
     */
    fetchRecentMovies: () => Promise<IMovieResult[]>;
    /**
     * Fetch recent TV shows
     */
    fetchRecentTvShows: () => Promise<IMovieResult[]>;
    /**
     * Fetch trending movies
     */
    fetchTrendingMovies: () => Promise<IMovieResult[]>;
    /**
     * Fetch trending TV shows
     */
    fetchTrendingTvShows: () => Promise<IMovieResult[]>;
    /**
     * Fetch content by country
     * @param country country name
     * @param page page number (default: 1)
     */
    fetchByCountry: (country: string, page?: number) => Promise<ISearch<IMovieResult>>;
    /**
     * Fetch content by genre
     * @param genre genre name
     * @param page page number (default: 1)
     */
    fetchByGenre: (genre: string, page?: number) => Promise<ISearch<IMovieResult>>;
    /**
     * Fetch spotlight/featured content
     */
    fetchSpotlight: () => Promise<ISearch<IMovieResult>>;
    /**
     * Fetch TV series episodes for all seasons
     * @param uid unique identifier
     */
    private fetchTvSeriesEpisodes;
    /**
     * Parse recommendations from media info page
     * @param $ cheerio instance
     */
    private parseRecommendations;
    /**
     * Fetch content from home page by section title
     * @param sectionTitle section title to search for
     * @param isTvShow whether content is TV shows
     */
    private fetchHomeSection;
    /**
     * Fetch content from home page by div ID
     * @param divId div ID to search for
     * @param isTvShow whether content is TV shows
     */
    private fetchHomeSectionById;
    /**
     * Fetch content by filter (genre or country)
     * @param filterType filter type (genre or country)
     * @param filterValue filter value
     * @param page page number
     */
    private fetchByFilter;
    /**
     * Extract sources from streaming server
     * @param episodeUrl episode URL
     * @param server streaming server type
     */
    private extractFromServer;
    /**
     * Parse media type from text
     * @param typeText type text to parse
     */
    private parseMediaType;
}
export default SFlix;
