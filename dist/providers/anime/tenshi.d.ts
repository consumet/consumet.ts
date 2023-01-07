import { AnimeParser, IAnimeInfo, IEpisodeServer, ISource } from '../../models';
declare class Tenshi extends AnimeParser {
    readonly name = "Tenshi";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    fetchEpisodeSources(episodeId: string, ...args: any): Promise<ISource>;
    fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]>;
    search(query: string, ...args: any[]): Promise<unknown>;
    fetchAnimeInfo: (id: string) => Promise<IAnimeInfo>;
}
export default Tenshi;
