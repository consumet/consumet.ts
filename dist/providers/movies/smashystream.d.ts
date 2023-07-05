import { MovieParser, TvType, IMovieInfo, IEpisodeServer, ISource, IMovieResult, ISearch } from '../../models';
declare class SmashyStream extends MovieParser {
    readonly name = "Smashystream";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    supportedTypes: Set<TvType>;
    search: () => Promise<ISearch<IMovieResult>>;
    fetchMediaInfo: () => Promise<IMovieInfo>;
    fetchEpisodeServers: (tmdbId: string, season?: number, episode?: number) => Promise<IEpisodeServer[]>;
    fetchEpisodeSources: (tmdbId: string, season?: number, episode?: number, server?: string) => Promise<ISource>;
}
export default SmashyStream;
