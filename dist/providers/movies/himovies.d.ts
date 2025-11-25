import { MovieParser, TvType, IMovieInfo, IEpisodeServer, StreamingServers, ISource, IMovieResult, ISearch } from '../../models';
declare class HiMovies extends MovieParser {
    readonly name = "HiMovies";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    supportedTypes: Set<TvType>;
    private static readonly NAV_SELECTOR;
    /**
     * Search for movies and TV shows
     * @param query search query string
     * @param page page number (default: 1)
     */
    search: (query: string, page?: number) => Promise<ISearch<IMovieResult>>;
    /**
     * Fetch detailed information about a movie or TV show
     * @param mediaId media link or id
     */
    fetchMediaInfo: (mediaId: string) => Promise<IMovieInfo>;
    /**
     * Fetch available streaming servers for an episode
     * @param episodeId episode link or id
     * @param mediaId movie/tv show link or id
     */
    fetchEpisodeServers: (episodeId: string, mediaId: string) => Promise<IEpisodeServer[]>;
    /**
     * Fetch streaming sources for an episode
     * @param episodeId episode id or full URL
     * @param mediaId media id
     * @param server streaming server type (default: MegaCloud)
     */
    fetchEpisodeSources: (episodeId: string, mediaId: string, server?: StreamingServers) => Promise<ISource>;
    /**
     * Fetch recent movies from home page
     */
    fetchRecentMovies: () => Promise<IMovieResult[]>;
    /**
     * Fetch recent TV shows from home page
     */
    fetchRecentTvShows: () => Promise<IMovieResult[]>;
    /**
     * Fetch trending movies from home page
     */
    fetchTrendingMovies: () => Promise<IMovieResult[]>;
    /**
     * Fetch trending TV shows from home page
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
export default HiMovies;
