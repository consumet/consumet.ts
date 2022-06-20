import { LightNovelParser, ILightNovelSearch, ILightNovelInfo, ILightNovelChapterContent } from '../../models';
declare class ReadLightNovels extends LightNovelParser {
    readonly name = "Read Light Novels";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    /**
     *
     * @param lightNovelUrl light novel link or id
     * @param chapterPage chapter page number (optional) if not provided, will fetch all chapters
     * @returns light novel info with chapters
     */
    fetchLighNovelInfo: (lightNovelUrl: string, chapterPage?: number) => Promise<ILightNovelInfo>;
    private fetchChapters;
    private fetchAllChapters;
    /**
     *
     * @param chapterId chapter id or url
     * @returns chapter content as string
     */
    fetchChapterContent: (chapterId: string) => Promise<ILightNovelChapterContent>;
    search: (query: string) => Promise<ILightNovelSearch>;
}
export default ReadLightNovels;
