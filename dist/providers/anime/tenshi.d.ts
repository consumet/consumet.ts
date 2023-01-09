import { AnimeParser, ISearch, IAnimeInfo, IEpisodeServer, IAnimeResult, ISource } from '../../models';
declare class Tenshi extends AnimeParser {
    readonly name = "Tenshi";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    search(query: string, page?: number): Promise<ISearch<IAnimeResult>>;
    fetchAnimeInfo: (id: string) => Promise<IAnimeInfo>;
    fetchEpisodeSources(episodeId: string): Promise<ISource>;
    fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]>;
}
export default Tenshi;
