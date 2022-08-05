import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, IEpisodeServer, ISource, StreamingServers } from '../../models';
/**
 * **Use at your own risk :)** 9anime devs keep changing the keys every week
 */
declare class NineAnime extends AnimeParser {
    readonly name = "9Anime";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private readonly table;
    private readonly key;
    private readonly key2;
    search(query: string, page?: number): Promise<ISearch<IAnimeResult>>;
    fetchAnimeInfo(animeUrl: string, isDub?: boolean): Promise<IAnimeInfo>;
    fetchEpisodeSources(episodeId: string, server?: StreamingServers): Promise<ISource>;
    fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]>;
    private ev;
    private dv;
    private cipher;
    private encrypt;
    private decrypt;
}
export default NineAnime;
