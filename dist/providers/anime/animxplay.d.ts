import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer } from '../../models';
declare class AniMixPlay extends AnimeParser {
    readonly name = "AniMixPlay";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private readonly searchUrl;
    /**
     *
     * @param query search query
     */
    search: (query: string) => Promise<ISearch<IAnimeResult>>;
    /**
     *
     * @param id anime id
     * @param dub whether to get dub version of the anime
     */
    fetchAnimeInfo: (id: string, dub?: boolean) => Promise<IAnimeInfo>;
    /**
     *
     * @param episodeId episode id
     */
    fetchEpisodeSources: (episodeId: string) => Promise<ISource>;
    /**
     * @deprecated Use fetchEpisodeSources instead
     */
    fetchEpisodeServers: (episodeIs: string) => Promise<IEpisodeServer[]>;
}
export default AniMixPlay;
