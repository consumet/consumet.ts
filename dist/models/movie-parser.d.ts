import { BaseParser, TvType, ISource, IEpisodeServer } from '.';
declare abstract class MovieParser extends BaseParser {
    /**
     * The supported types of the provider (e.g. `TV`, `Movie`)
     */
    abstract supportedTypes: Set<TvType>;
    /**
     * takes media link or id
     *
     * returns media info (including episodes)
     */
    abstract fetchMediaInfo(mediaUrl: string): Promise<unknown>;
    /**
     * takes episode or movie id
     *
     * returns episode sources (video links)
     */
    abstract fetchEpisodeSources(mediaId: string, ...args: any): Promise<ISource>;
    /**
     * takes episode link
     *
     * returns episode servers (video links) available
     */
    abstract fetchEpisodeServers(mediaLink: string, ...args: any): Promise<IEpisodeServer[]>;
}
export default MovieParser;
