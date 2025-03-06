import { ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer, MovieParser, TvType, IMovieResult, IMovieInfo, ProxyConfig } from '../../models';
import { IPeopleResult } from '../../models/types';
import { AxiosAdapter } from 'axios';
declare class TMDB extends MovieParser {
    private apiKey;
    readonly name = "TMDB";
    protected baseUrl: string;
    protected apiUrl: string;
    protected logo: string;
    protected classPath: string;
    supportedTypes: Set<TvType>;
    private provider;
    constructor(apiKey?: string, provider?: MovieParser, proxyConfig?: ProxyConfig, adapter?: AxiosAdapter);
    /**
     * @param type trending type: tv series, movie, people or all
     * @param timePeriod trending time period day or week
     * @param page page number
     */
    fetchTrending: (type: string | 'all', timePeriod?: 'day' | 'week', page?: number) => Promise<ISearch<IMovieResult | IAnimeResult | IPeopleResult>>;
    /**
     * @param query search query
     * @param page page number
     */
    search: (query: string, page?: number) => Promise<ISearch<IMovieResult | IAnimeResult>>;
    /**
     * @param id media id (anime or movie/tv)
     * @param type movie or tv
     */
    fetchMediaInfo: (mediaId: string, type: string) => Promise<IMovieInfo | IAnimeInfo>;
    /**
     * Find the id of a media from its title. and extra data. (year, totalSeasons, totalEpisodes)
     * @param title
     * @param extraData
     * @returns id of the media
     */
    private findIdFromTitle;
    /**
     * @param id media id (anime or movie/tv)
     * @param args optional arguments
     */
    fetchEpisodeSources: (id: string, ...args: any) => Promise<ISource>;
    /**
     * @param episodeId episode id
     * @param args optional arguments
     **/
    fetchEpisodeServers: (episodeId: string, ...args: any) => Promise<IEpisodeServer[]>;
}
export default TMDB;
