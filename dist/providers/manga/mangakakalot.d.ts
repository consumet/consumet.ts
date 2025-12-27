import { MangaParser, ISearch, IMangaInfo, IMangaResult, IMangaChapterPage } from '../../models';
declare class MangaKakalot extends MangaParser {
    readonly name = "MangaKakalot";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private cookieJar;
    private cookieTimestamps;
    private warmedUp;
    private readonly COOKIE_MAX_AGE;
    private readonly WARMUP_MAX_AGE;
    private currentUA;
    private readonly userAgents;
    private getRotatedUA;
    private extractCookies;
    private cleanExpiredCookies;
    private buildCookieHeader;
    private isCloudflareChallenge;
    private buildHeaders;
    private warmupDomain;
    private delay;
    private proxyRequest;
    /**
     * Search for manga
     * @param query Search query
     * @param page Page number (default: 1)
     */
    search: (query: string, page?: number) => Promise<ISearch<IMangaResult>>;
    /**
     * Fetch manga info including chapters
     * @param mangaId Manga ID from search results
     */
    fetchMangaInfo: (mangaId: string) => Promise<IMangaInfo>;
    /**
     * Fetch chapter pages (images)
     * @param chapterId Chapter ID in format "mangaId/chapterId"
     */
    fetchChapterPages: (chapterId: string) => Promise<IMangaChapterPage[]>;
    /**
     * Fetch latest manga updates
     * @param page Page number (default: 1)
     */
    fetchLatestUpdates: (page?: number) => Promise<ISearch<IMangaResult>>;
    /**
     * Fetch manga by genre
     * @param genre Genre slug (e.g., "action", "romance")
     * @param page Page number (default: 1)
     */
    fetchByGenre: (genre: string, page?: number) => Promise<ISearch<IMangaResult>>;
    /**
     * Fetch suggestions (autocomplete)
     * @param query Search term
     */
    fetchSuggestions: (query: string) => Promise<IMangaResult[]>;
}
export default MangaKakalot;
