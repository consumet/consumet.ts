import { IMangaChapterPage, IMangaInfo, IMangaResult, ISearch, MangaParser } from '../../models';
declare class ComicK extends MangaParser {
    readonly name = "ComicK";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private readonly apiUrl;
    private _axios;
    /**
     * @description Fetches info about the manga
     * @param mangaId Comic slug
     * @returns Promise<IMangaInfo>
     */
    fetchMangaInfo: (mangaId: string) => Promise<IMangaInfo>;
    /**
     *
     * @param chapterId Chapter ID (HID)
     * @returns Promise<IMangaChapterPage[]>
     */
    fetchChapterPages: (chapterId: string) => Promise<IMangaChapterPage[]>;
    /**
     * @param query search query
     * @param page page number (default: 1)
     * @param limit limit of results to return (default: 20) (max: 100) (min: 1)
     */
    search: (query: string, page?: number, limit?: number) => Promise<ISearch<IMangaResult>>;
    private fetchAllChapters;
    /**
     * @description Fetches the comic HID from the slug
     * @param id Comic slug
     * @returns Promise<string> empty if not found
     */
    private getComicId;
}
export default ComicK;
