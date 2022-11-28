import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer } from '../../models';
declare class Enime extends AnimeParser {
    readonly name = "Enime";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private readonly enimeApi;
    /**
     * @param query Search query
     * @param page Page number (optional)
     */
    rawSearch: (query: string, page?: number, perPage?: number) => Promise<any>;
    /**
     * @param query Search query
     * @param page Page number (optional)
     */
    search: (query: string, page?: number, perPage?: number) => Promise<ISearch<IAnimeResult>>;
    /**
     * @param id Anime id
     */
    fetchAnimeInfo: (id: string) => Promise<IAnimeInfo>;
    fetchAnimeInfoByIdRaw: (id: string) => Promise<any>;
    /**
     * @param id anilist id
     */
    fetchAnimeInfoByAnilistId: (id: string, type?: 'gogoanime' | 'zoro') => Promise<IAnimeInfo>;
    /**
     * @param id mal id
     */
    fetchAnimeInfoByMalId: (id: string, type?: 'gogoanime' | 'zoro') => Promise<IAnimeInfo>;
    fetchEpisodeSources: (episodeId: string, ...args: any) => Promise<ISource>;
    private fetchSourceFromEpisodeId;
    private fetchSourceFromSourceId;
    /**
     * @deprecated
     */
    fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]>;
}
export default Enime;
