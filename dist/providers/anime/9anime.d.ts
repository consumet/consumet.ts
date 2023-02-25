import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, IEpisodeServer, ISource, StreamingServers } from '../../models';
/**
 * **Use at your own risk :)** 9anime devs keep changing the keys every week
 */
declare class NineAnime extends AnimeParser {
    readonly name = "9Anime";
    private nineAnimeResolver;
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    readonly isWorking = false;
    constructor(nineAnimeResolver?: string);
    search(query: string, page?: number): Promise<ISearch<IAnimeResult>>;
    fetchAnimeInfo(animeUrl: string, isDub?: boolean): Promise<IAnimeInfo>;
    extractVizCloudURL(serverID: string): Promise<any>;
    fetchEpisodeSources(episodeId: string, server?: StreamingServers): Promise<ISource>;
    fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]>;
    private ev;
    private dv;
}
export default NineAnime;
