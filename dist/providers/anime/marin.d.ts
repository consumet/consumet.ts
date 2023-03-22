import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer } from '../../models';
/**
 * @attention Cloudflare bypass is **REQUIRED**.
 */
declare class Marin extends AnimeParser {
    readonly name = "Marin";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private getToken;
    recentEpisodes: (page?: number) => Promise<ISearch<IAnimeResult>>;
    /**
     * @param query Search query
     */
    search: (query: string, page?: number) => Promise<ISearch<IAnimeResult>>;
    /**
     * @param id Anime id
     */
    fetchAnimeInfo: (id: string) => Promise<IAnimeInfo>;
    /**
     *
     * @param episodeId Episode id
     */
    fetchEpisodeSources: (id: string) => Promise<ISource>;
    /**
     *
     * @param episodeId Episode id
     */
    fetchEpisodeServers: (episodeId: string) => Promise<IEpisodeServer[]>;
}
export default Marin;
