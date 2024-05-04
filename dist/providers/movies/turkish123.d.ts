import { IAnimeInfo, IEpisodeServer, IMovieInfo, ISource, MovieParser, TvType } from '../../models';
export default class Turkish extends MovieParser {
    name: string;
    protected baseUrl: string;
    protected classPath: string;
    supportedTypes: Set<TvType>;
    fetchMediaInfo(mediaId: string): Promise<IMovieInfo | IAnimeInfo>;
    fetchEpisodeSources(episodeId: string): Promise<ISource>;
    fetchEpisodeServers(): Promise<IEpisodeServer[]>;
    search(q: string): Promise<IMovieInfo[]>;
}
