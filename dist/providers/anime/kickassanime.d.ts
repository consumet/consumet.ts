import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer } from '../../models';
declare class KickAssAnime extends AnimeParser {
    readonly name = "KickAssAnime";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private fallbackDomains;
    private getHeaders;
    /**
     * Search for anime
     * @param query Search query string
     * @param page Page number (default: 1)
     * @returns Promise<ISearch<IAnimeResult>>
     */
    search: (query: string, page?: number) => Promise<ISearch<IAnimeResult>>;
    private mapStatus;
    /**
     * Fetch detailed anime information
     * @param id Anime slug/id (e.g., 'naruto-f3cf')
     * @returns Promise<IAnimeInfo>
     */
    fetchAnimeInfo: (id: string) => Promise<IAnimeInfo>;
    /**
     * Fetch episode video sources and subtitles
     * @param episodeId Episode path (e.g., 'naruto-f3cf/episode/ep-1-12cd96')
     * @param server Optional server name to filter (e.g., StreamingServers.VidStreaming, StreamingServers.BirdStream)
     * @returns Promise<ISource>
     */
    fetchEpisodeSources: (episodeId: string, server?: string) => Promise<ISource>;
    /**
     * Fetch available servers for an episode
     * @param episodeId Episode path (e.g., 'naruto-f3cf/episode/ep-1-12cd96')
     * @returns Promise<IEpisodeServer[]>
     */
    fetchEpisodeServers: (episodeId: string) => Promise<IEpisodeServer[]>;
    private extractFromServer;
    private extractCatBirdStream;
    private decodeHtmlEntities;
    private extractEncryptedServer;
    private getServerKey;
    private hexToBytes;
    private sha1;
    private decryptAES;
}
export default KickAssAnime;
