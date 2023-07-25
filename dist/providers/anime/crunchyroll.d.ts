import { AxiosAdapter } from 'axios';
import { AnimeParser, ISearch, IAnimeInfo, IAnimeResult, ISource, IEpisodeServer, ProxyConfig } from '../../models';
declare class Crunchyroll extends AnimeParser {
    readonly name = "Crunchyroll";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private locale;
    private TOKEN;
    private get options();
    private locales;
    private subOrder;
    static create(locale?: string, token?: string, accessToken?: string, proxyConfig?: ProxyConfig, adapter?: AxiosAdapter): Promise<Crunchyroll>;
    /**
     * @param query Search query
     */
    search: (query: string) => Promise<ISearch<IAnimeResult>>;
    /**
     * @param id Anime id
     * @param mediaType Anime type (series, movie)
     * @param fetchAllSeasons Fetch all episode seasons
     */
    fetchAnimeInfo: (id: string, mediaType: string, fetchAllSeasons?: boolean) => Promise<IAnimeInfo>;
    /**
     *
     * @param episodeId Episode id
     * @param format subtitle format (default: `srt`) (srt, vtt, ass)
     * @param type Video type (default: `adaptive_hls` (m3u8)) `adaptive_dash` (dash), `drm_adaptive_dash` (dash with drm)
     */
    fetchEpisodeSources: (episodeId: string) => Promise<ISource>;
    /**
     *
     * @param episodeId Episode id
     */
    fetchEpisodeServers: (episodeId: string) => Promise<IEpisodeServer[]>;
}
export default Crunchyroll;
