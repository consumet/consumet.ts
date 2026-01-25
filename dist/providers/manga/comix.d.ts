import { IMangaChapterPage, IMangaInfo, IMangaResult, MangaParser } from '../../models';
declare class Comix extends MangaParser {
    readonly name = "Comix";
    protected baseUrl: string;
    protected classPath: string;
    private readonly apiUrl;
    referer: string;
    private baseHeaders;
    /**
     * @description Fetches info about the manga
     * @param mangaId just the id
     * @returns Promise<IMangaInfo>
     */
    fetchMangaInfo: (mangaId: string) => Promise<IMangaInfo>;
    fetchChapters(hid: string, page?: number): Promise<{
        chapters: any[];
        pagination: any;
    }>;
    /**
     *
     * @param chapterId Chapter ID '{hashid-slug}/{chapterid}'
     * @returns Promise<IMangaChapterPage[]>
     */
    fetchChapterPages: (chapterId: string) => Promise<IMangaChapterPage[]>;
    /**
     * @param query search query
     * @param page page number (default: 1)
     * @param limit limit of results to return (default: 20) (max: 100) (min: 1)
     */
    search: (query: string, page?: number) => Promise<Search<IMangaResult>>;
}
export default Comix;
interface Search<T> {
    results: T[];
    pagination?: any;
}
