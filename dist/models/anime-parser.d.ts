import { BaseParser, IAnimeInfo, ISource, IEpisodeServer } from '.';
declare abstract class AnimeParser extends BaseParser {
    /**
     * if the provider has dub and it's avialable seperatly from sub set this to `true`
     */
    protected readonly isDubAvailableSeparately: boolean;
    /**
     * takes anime id
     *
     * returns anime info (including episodes)
     */
    abstract fetchAnimeInfo(animeId: string, ...args: any): Promise<IAnimeInfo>;
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
    abstract fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]>;
}
export default AnimeParser;
