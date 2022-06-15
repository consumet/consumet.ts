import { BaseParser } from '.';
declare abstract class AnimeParser extends BaseParser {
    /**
     * takes anime link or id
     *
     * returns anime info
     */
    protected abstract fetchAnimeInfo(animeUrl: string): Promise<unknown>;
    /**
     * takes episode id
     *
     * returns episode sources (video links)
     */
    protected abstract fetchEpisodeSources(episodeId: string, ...args: any): Promise<unknown>;
    /**
     * takes episode link
     *
     * returns episode servers (video links) available
     */
    protected abstract fetchEpisodeServers(episodeLink: string): Promise<unknown>;
}
export default AnimeParser;
