import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer } from '../../models';
declare class AnimeUnity extends AnimeParser {
    readonly name = "AnimeUnity";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    /**
     * @param query Search query
     */
    search: (query: string) => Promise<ISearch<IAnimeResult>>;
    /**
     * @param id Anime id
     * @param page Page number
     */
    fetchAnimeInfo: (id: string, page?: number) => Promise<IAnimeInfo>;
    /**
     *
     * @param episodeId Episode id
     */
    fetchEpisodeSources: (episodeId: string) => Promise<ISource>;
    /**
     *
     * @param episodeId Episode id
     */
    fetchEpisodeServers: (episodeId: string) => Promise<IEpisodeServer[]>;
}
export default AnimeUnity;
