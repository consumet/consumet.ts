import { ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer } from '../../models/';
import AnimeParser from '../../models/anime-parser';
declare class AnimeSama extends AnimeParser {
    readonly name = "AnimeSama";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private vidmolyExtractor;
    private movearnpreExtractor;
    private sibnetExtractor;
    private sendvidExtractor;
    private lplayerExtractor;
    constructor();
    private getHeaders;
    search: (query: string) => Promise<ISearch<IAnimeResult>>;
    fetchAnimeInfo: (id: string) => Promise<IAnimeInfo>;
    private fetchEpisodesData;
    fetchEpisodeServers: (episodeId: string) => Promise<IEpisodeServer[]>;
    fetchEpisodeSources: (episodeId: string, server?: string) => Promise<ISource>;
    private findServerUrl;
    private extractSourcesByServer;
    private extractDoodstream;
    private extractGeneric;
}
export default AnimeSama;
