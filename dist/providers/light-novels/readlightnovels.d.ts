import { LightNovelParser, ISearch, ILightNovelInfo, ILightNovelChapterContent, ILightNovelResult } from '../../models';
declare class ReadLightNovels extends LightNovelParser {
    readonly name = "Read Light Novels";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    /**
     *
     * @param lightNovelUrl light novel link or id
     * @param chapterPage chapter page number (optional) if not provided, will fetch all chapter pages.
     */
    fetchLightNovelInfo: (lightNovelUrl: string, chapterPage?: number) => Promise<ILightNovelInfo>;
    private fetchChapters;
    private fetchAllChapters;
    /**
     *
     * @param chapterId chapter id or url
     */
    fetchChapterContent: (chapterId: string) => Promise<ILightNovelChapterContent>;
    /**
     *
     * @param query search query string
     */
    search: (query: string) => Promise<ISearch<ILightNovelResult>>;
}
export default ReadLightNovels;
