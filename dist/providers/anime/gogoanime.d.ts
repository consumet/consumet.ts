import { AnimeParser, IAnimeSearch, IAnimeInfo, IEpisodeServer, IVideo, StreamingServers } from '../../models';
declare class Gogoanime extends AnimeParser {
    readonly name = "Gogoanime";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    search: (query: string, page?: number) => Promise<IAnimeSearch>;
    fetchAnimeInfo: (animeUrl: string) => Promise<IAnimeInfo>;
    fetchEpisodeSources: (episodeId: string, server?: StreamingServers) => Promise<{
        headers: {
            [k: string]: string;
        };
        sources: IVideo[];
    }>;
    fetchEpisodeServers: (episodeLink: string) => Promise<IEpisodeServer[]>;
}
export default Gogoanime;
