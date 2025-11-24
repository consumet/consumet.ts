import { MovieParser, TvType, IMovieInfo, IEpisodeServer, StreamingServers, ISource, IMovieResult, ISearch } from '../../models';
declare class Goku extends MovieParser {
    readonly name = "Goku";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    supportedTypes: Set<TvType>;
    /**
     * Search for movies or TV shows
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
     * @param episodeId episode link or movie id
     * @param mediaId movie link or id
     */
    fetchEpisodeServers: (episodeId: string, mediaId: string) => Promise<IEpisodeServer[]>;
    /**
     * Fetch episode sources from a specific server
     * @param episodeId episode id or URL
     * @param mediaId media id
     * @param server streaming server type (default UpCloud)
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
     * @param page page number (default 1)
     */
    fetchByCountry: (country: string, page?: number) => Promise<ISearch<IMovieResult>>;
    /**
     * Fetch content by genre
     * @param genre genre name
     * @param page page number (default 1)
     */
    fetchByGenre: (genre: string, page?: number) => Promise<ISearch<IMovieResult>>;
    /**
     * Fetch TV series episodes for all seasons
     * @param mediaId media unique identifier
     */
    private fetchTvSeriesEpisodes;
    /**
     * Fetch content from home page by section
     * @param selector CSS selector for section
     * @param isMovie whether content is movies
     * @param useLast whether to use last() selector
     */
    private fetchHomeSection;
    /**
     * Fetch content by filter (genre or country)
     * @param filterType filter type (genre or country)
     * @param filterValue filter value
     * @param page page number
     */
    private fetchByFilter;
}
export default Goku;
