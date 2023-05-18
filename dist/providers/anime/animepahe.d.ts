import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer } from '../../models';
declare class AnimePahe extends AnimeParser {
    readonly name = "AnimePahe";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    /**
     * @param query Search query
     */
    search: (query: string) => Promise<ISearch<IAnimeResult>>;
    /**
     * @param id id format id/session
     * @param episodePage Episode page number (optional) default: -1 to get all episodes. number of episode pages can be found in the anime info object
     */
    fetchAnimeInfo: (id: string, episodePage?: number) => Promise<IAnimeInfo>;
    /**
     *
     * @param episodeId episode id
     */
    fetchEpisodeSources: (episodeId: string) => Promise<ISource>;
    private fetchEpisodes;
    /**
     * @deprecated
     * @attention AnimePahe doesn't support this method
     */
    fetchEpisodeServers: (episodeLink: string) => Promise<IEpisodeServer[]>;
}
export default AnimePahe;
