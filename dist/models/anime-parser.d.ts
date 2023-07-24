import { BaseParser, IAnimeInfo, ISource, IEpisodeServer, ProxyConfig } from '.';
import { AxiosAdapter } from "axios";
declare abstract class AnimeParser extends BaseParser {
    constructor(baseUrl?: string, proxyConfig?: ProxyConfig, adapter?: AxiosAdapter);
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
