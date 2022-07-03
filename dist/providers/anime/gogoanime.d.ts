import { AnimeParser, ISearch, IAnimeInfo, IEpisodeServer, StreamingServers, IAnimeResult, ISource } from '../../models';
declare class Gogoanime extends AnimeParser {
    readonly name = "Gogoanime";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    /**
     *
     * @param query search query string
     * @param page page number (default 1) (optional)
     */
    search: (query: string, page?: number) => Promise<ISearch<IAnimeResult>>;
    /**
     *
     * @param animeUrl anime url or id
     */
    fetchAnimeInfo: (animeUrl: string) => Promise<IAnimeInfo>;
    /**
     *
     * @param episodeId episode id
     * @param server server type (default 'GogoCDN') (optional)
     */
    fetchEpisodeSources: (episodeId: string, server?: StreamingServers) => Promise<ISource>;
    /**
     *
     * @param episodeLink episode link or episode id
     */
    fetchEpisodeServers: (episodeLink: string) => Promise<IEpisodeServer[]>;
}
export default Gogoanime;
