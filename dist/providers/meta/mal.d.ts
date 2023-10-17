import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer } from '../../models';
declare class Myanimelist extends AnimeParser {
    readonly name = "Myanimelist";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private readonly anilistGraphqlUrl;
    private readonly kitsuGraphqlUrl;
    private readonly malSyncUrl;
    private readonly anifyUrl;
    provider: AnimeParser;
    /**
     * This class maps myanimelist to kitsu with any other anime provider.
     * kitsu is used for episode images, titles and description.
     * @param provider anime provider (optional) default: Gogoanime
     */
    constructor(provider?: AnimeParser);
    private malStatusToMediaStatus;
    private populateEpisodeList;
    search: (query: string, page?: number) => Promise<ISearch<IAnimeResult>>;
    /**
     *
     * @param animeId anime id
     * @param fetchFiller fetch filler episodes
     */
    fetchAnimeInfo: (animeId: string, dub?: boolean, fetchFiller?: boolean) => Promise<IAnimeInfo>;
    fetchEpisodeSources: (episodeId: string, ...args: any) => Promise<ISource>;
    fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]>;
    private findAnimeRaw;
    private findAnimeSlug;
    private findKitsuAnime;
    /**
     *
     * @param id anime id
     * @returns anime info without streamable episodes
     */
    fetchMalInfoById: (id: string) => Promise<IAnimeInfo>;
}
export default Myanimelist;
