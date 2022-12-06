import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer } from '../../models';
declare class Crunchyroll extends AnimeParser {
    readonly name = "Crunchyroll";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private locale;
    private channelId;
    private TOKEN;
    private options;
    private locales;
    private subOrder;
    fetch(locale?: string, token?: string, accessToken?: string): Promise<any>;
    /**
     *
     * @param locale Locale (default: en-US) (ar-ME, ar-SA, de-DE, en-US, es-419, es-ES, fr-FR, he-IL, it-IT, pt-BR, pl-PL, ru-RU, tr-TR)
     * @param token Token
     * @param accessToken Access Token
     */
    static create(locale?: string, token?: string, accessToken?: string): Promise<Crunchyroll>;
    /**
     * @param query Search query
     * @param limit Limit of results (default: 25) (max: 100)
     */
    search: (query: string, limit?: number) => Promise<ISearch<IAnimeResult>>;
    /**
     * @param id Anime id
     * @param mediaType Anime type (series, movie)
     */
    fetchAnimeInfo: (id: string, mediaType: string) => Promise<IAnimeInfo>;
    /**
     *
     * @param episodeId Episode id
     * @param format subtitle format (default: `srt`) (srt, vtt, ass)
     * @param type Video type (default: `adaptive_hls` (m3u8)) `adaptive_dash` (dash), `drm_adaptive_dash` (dash with drm)
     */
    fetchEpisodeSources: (episodeId: string, format?: string, type?: string) => Promise<ISource>;
    /**
     *
     * @param episodeId Episode id
     */
    fetchEpisodeServers: (episodeId: string) => Promise<IEpisodeServer[]>;
}
export default Crunchyroll;
