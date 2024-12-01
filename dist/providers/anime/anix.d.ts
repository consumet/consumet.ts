import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer } from '../../models';
declare class Anix extends AnimeParser {
    readonly name = "Anix";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private readonly requestedWith;
    /**
     * @param page page number (optional)
     * @param type type of media. (optional) (default `1`) `1`: Japanese with subtitles, `2`: english/dub with no subtitles, `3`: chinese with english subtitles
     */
    fetchRecentEpisodes: (page?: number) => Promise<ISearch<IAnimeResult>>;
    /**
     * @param query Search query
     */
    search: (query: string, page?: number) => Promise<ISearch<IAnimeResult>>;
    /**
     * @param id Anime id
     * @param page Page number
     */
    fetchAnimeInfo: (id: string) => Promise<IAnimeInfo>;
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
export default Anix;
