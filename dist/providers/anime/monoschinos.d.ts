import { AnimeParser, IAnimeInfo, IAnimeResult, IEpisodeServer, ISearch, ISource } from '../../models';
declare class MonosChinos extends AnimeParser {
    #private;
    readonly name = "MonosChinos";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    /**
     * @param query Search query
     */
    search: (query: string) => Promise<ISearch<IAnimeResult>>;
    /**
     * @param id Anime id
     * @param totalEpisodes how many episodes you want the info of (why? => refer to the docs)
     */
    fetchAnimeInfo: (id: string, totalEpisodes?: number) => Promise<IAnimeInfo>;
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
export default MonosChinos;
