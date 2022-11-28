import { AnimeParser, ISearch, IAnimeInfo, MediaStatus, IAnimeResult, ISource, IAnimeEpisode, IEpisodeServer } from '../../models';
declare class Myanimelist extends AnimeParser {
    fetchAnimeInfo(animeId: string, ...args: any): Promise<IAnimeInfo>;
    fetchEpisodeSources(episodeId: string, ...args: any): Promise<ISource>;
    fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]>;
    readonly name = "Myanimelist";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    /**
     * This class maps anilist to kitsu with any other anime provider.
     * kitsu is used for episode images, titles and description.
     * @param provider anime provider (optional) default: Gogoanime
     * @param proxy proxy config (optional) default: null
     */
    constructor();
    malStatusToMediaStatus(status: string): MediaStatus;
    populateEpisodeList(episodes: IAnimeEpisode[], url: string, count?: number): Promise<void>;
    search: (query: string, page?: number) => Promise<ISearch<IAnimeResult>>;
    fetchMalInfoById: (id: string) => Promise<IAnimeInfo>;
}
export default Myanimelist;
