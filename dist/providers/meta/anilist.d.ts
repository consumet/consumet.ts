import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer } from '../../models';
declare class Anilist extends AnimeParser {
    readonly name = "AnilistWithKitsu";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private readonly anilistGraphqlUrl;
    private readonly kitsuGraphqlUrl;
    private readonly malSyncUrl;
    private provider;
    /**
     * This class maps anilist to kitsu with any other anime provider.
     * @param provider anime provider (optional) default: Gogoanime
     */
    constructor(provider?: AnimeParser);
    /**
     * @param query Search query
     * @param page Page number (optional)
     * @param perPage Number of results per page (optional) (default: 15) (max: 50)
     */
    search: (query: string, page?: number, perPage?: number) => Promise<ISearch<IAnimeResult>>;
    /**
     *
     * @param id Anime id
     * @param dub to get dubbed episodes (optional) set to `true` to get dubbed episodes. **ONLY WORKS FOR GOGOANIME**
     */
    fetchAnimeInfo: (id: string, dub?: boolean) => Promise<IAnimeInfo>;
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
    private findAnime;
    private findAnimeSlug;
    private findAnimeRaw;
}
export default Anilist;
