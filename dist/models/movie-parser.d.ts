import { BaseParser, TvType } from '.';
declare abstract class MovieParser extends BaseParser {
    /**
     * The supported types of the provider (e.g. `TV`, `Movie`)
     */
    protected abstract supportedTypes: Set<TvType>;
    /**
     * takes media link or id
     *
     * returns media info
     */
    protected abstract fetchMediaInfo(mediaUrl: string): Promise<unknown>;
    /**
     * takes episode or movie id
     *
     * returns episode sources (video links)
     */
    protected abstract fetchEpisodeSources(mediaId: string, ...args: any): Promise<unknown>;
    /**
     * takes episode link
     *
     * returns episode servers (video links) available
     */
    protected abstract fetchEpisodeServers(mediaLink: string, ...args: any): Promise<unknown>;
}
export default MovieParser;
