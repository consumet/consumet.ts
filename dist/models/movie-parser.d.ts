import { BaseParser, TvType, ISource, IEpisodeServer } from '.';
declare abstract class MovieParser extends BaseParser {
    /**
     * The supported types of the provider (e.g. `TV`, `Movie`)
     */
    abstract supportedTypes: Set<TvType>;
    /**
     * takes media id
     *
     * returns media info (including episodes)
     */
    abstract fetchMediaInfo(mediaId: string): Promise<unknown>;
    /**
     * takes episode id
     *
     * returns episode sources (video links)
     */
    abstract fetchEpisodeSources(episodeId: string, ...args: any): Promise<ISource>;
    /**
     * takes episode id
     *
     * returns episode servers (video links) available
     */
    abstract fetchEpisodeServers(episodeId: string, ...args: any): Promise<IEpisodeServer[]>;
}
export default MovieParser;
