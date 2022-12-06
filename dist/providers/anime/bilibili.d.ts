import { AnimeParser, IAnimeInfo, IAnimeResult, IEpisodeServer, ISearch, ISource } from '../../models';
declare class Bilibili extends AnimeParser {
    readonly name = "Bilibili";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private apiUrl;
    private cookie;
    private locale;
    private sgProxy;
    constructor(cookie?: string, locale?: string);
    search(query: string): Promise<ISearch<IAnimeResult>>;
    fetchAnimeInfo(id: string): Promise<IAnimeInfo>;
    fetchEpisodeSources(episodeId: string, ...args: any): Promise<ISource>;
    fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]>;
}
export default Bilibili;
