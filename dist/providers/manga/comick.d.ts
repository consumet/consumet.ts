import { IMangaChapterPage, IMangaInfo, IMangaResult, MangaParser } from '../../models';
declare class ComicK extends MangaParser {
    readonly name = "ComicK";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private readonly apiUrl;
    referer: string;
    private _axios;
    /**
     * @description Fetches info about the manga
     * @param mangaId Comic slug
     * @returns Promise<IMangaInfo>
     */
    fetchMangaInfo: (mangaId: string) => Promise<IMangaInfo>;
    /**
     *
     * @param chapterId Chapter ID '{slug}/{hid}-chapter-{chap}-{lang}'
     * @returns Promise<IMangaChapterPage[]>
     */
    fetchChapterPages: (chapterId: string) => Promise<IMangaChapterPage[]>;
    /**
     * @param query search query
     * @param page page number (default: 1)
     * @param limit limit of results to return (default: 20) (max: 100) (min: 1)
     */
    search: (query: string, cursor?: string) => Promise<Search<IMangaResult>>;
    private fetchAllChapters;
    private getComicData;
}
export default ComicK;
interface Search<T> {
    results: T[];
    next_cursor: string;
    prev_cursor?: string;
}
