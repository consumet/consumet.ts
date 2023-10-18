import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer } from '../../models';
declare class Anify extends AnimeParser {
    readonly name = "anify";
    protected baseUrl: string;
    protected classPath: string;
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
     * @param providerId Provider id (optional) default: gogoanime
     */
    fetchAnimeInfo: (id: string, providerId?: '9anime' | 'animepahe' | 'zoro' | 'gogoanime') => Promise<IAnimeInfo>;
    fetchAnimeInfoByIdRaw: (id: string) => Promise<any>;
    /**
     * @param id anilist id
     * @param providerId Provider id (optional) default: gogoanime
     */
    fetchAnimeInfoByAnilistId: (id: string, providerId?: '9anime' | 'animepahe' | 'zoro' | 'gogoanime') => Promise<IAnimeInfo>;
    fetchEpisodeSources: (episodeId: string, episodeNumber: number, id: string) => Promise<ISource>;
    /**
     * @deprecated
     */
    fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]>;
}
export default Anify;
