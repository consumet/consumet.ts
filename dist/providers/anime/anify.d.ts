import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer } from '../../models';
type ProviderId = '9anime' | 'animepahe' | 'zoro' | 'gogoanime';
declare class Anify extends AnimeParser {
    readonly name = "Anify";
    protected baseUrl: string;
    protected classPath: string;
    private readonly actions;
    /**
     * @param query Search query
     * @param page Page number (optional)
     */
    rawSearch: (query: string, page?: number) => Promise<any>;
    /**
     * @param query Search query
     * @param page Page number (optional)
     */
    search: (query: string, page?: number) => Promise<ISearch<IAnimeResult>>;
    /**
     * @param id Anime id
     */
    fetchAnimeInfo: (id: string, providerId?: '9anime' | 'animepahe' | 'zoro' | 'gogoanime') => Promise<IAnimeInfo>;
    fetchAnimeInfoByIdRaw: (id: string) => Promise<any>;
    /**
     * @param id anilist id
     */
    fetchAnimeInfoByAnilistId: (id: string, providerId?: '9anime' | 'animepahe' | 'zoro' | 'gogoanime') => Promise<IAnimeInfo>;
    fetchEpisodeSources: (episodeId: string, episodeNumber: number, id: number, providerId?: ProviderId) => Promise<ISource>;
    /**
     * @deprecated
     */
    fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]>;
}
export default Anify;
