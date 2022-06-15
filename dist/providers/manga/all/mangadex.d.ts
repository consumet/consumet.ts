import { MangaParser, IMangaSearch, IMangaInfo } from '../../../models/';
declare class MangaDex extends MangaParser {
    readonly name = "mangadex";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private readonly apiUrl;
    fetchMangaInfo: (mangaId: string) => Promise<IMangaInfo>;
    /**
     * @currently only supports english
     */
    fetchChapterPages: (chapterId: string, ...args: any) => Promise<unknown>;
    /**
     * @param query search query
     * @param page page number (default: 1)
     * @param limit limit of results to return (default: 20) (max: 100) (min: 1)
     */
    search: (query: string, page?: number, limit?: number) => Promise<IMangaSearch>;
    private fetchAllChapters;
}
export default MangaDex;
