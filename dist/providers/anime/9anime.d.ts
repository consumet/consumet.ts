import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, IEpisodeServer, ISource } from '../../models';
/**
 * @deprecated
 * working on it...
 */
declare class NineAnime extends AnimeParser {
    readonly name = "9Anime";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    isWorking: boolean;
    private readonly base64;
    search(query: string, page?: number): Promise<ISearch<IAnimeResult>>;
    fetchAnimeInfo(animeUrl: string): Promise<IAnimeInfo>;
    fetchEpisodeSources(episodeLink: string): Promise<ISource>;
    fetchEpisodeServers(episodeLink: string): Promise<IEpisodeServer[]>;
    private getVrf;
    private cypher;
    private cypherV2;
    private cypherK;
}
export default NineAnime;
