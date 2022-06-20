import { AnimeParser, IAnimeSearch, IAnimeInfo } from '../../models';
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
    search(query: string, page?: number): Promise<IAnimeSearch>;
    fetchAnimeInfo(animeUrl: string): Promise<IAnimeInfo>;
    fetchEpisodeSources(episodeLink: string): Promise<void>;
    fetchEpisodeServers(episodeLink: string): Promise<void>;
    private getVrf;
    private cypher;
    private cypherV2;
    private cypherK;
}
export default NineAnime;
