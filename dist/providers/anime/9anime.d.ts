import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, IEpisodeServer, ISource, StreamingServers } from '../../models';
/**
 * **Use at your own risk :)** 9anime devs keep changing the keys every week
 */
declare class NineAnime extends AnimeParser {
    readonly name = "9Anime";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    readonly isWorking = false;
    private readonly baseTable;
    private readonly table;
    private cipherKey;
    private decipherKey;
    private keyMap;
    init(): Promise<void>;
    static create(): Promise<NineAnime>;
    search(query: string, page?: number): Promise<ISearch<IAnimeResult>>;
    fetchAnimeInfo(animeUrl: string, isDub?: boolean): Promise<IAnimeInfo>;
    fetchEpisodeSources(episodeId: string, server?: StreamingServers): Promise<ISource>;
    fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]>;
    private ev;
    private dv;
    private mapKeys;
    private cipher;
    private encrypt;
    private decrypt;
}
export default NineAnime;
