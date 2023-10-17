import { LightNovelParser, ISearch, ILightNovelInfo, ILightNovelChapterContent, ILightNovelResult } from '../../models';
declare class NovelUpdates extends LightNovelParser {
    readonly name = "NovelUpdates";
    protected baseUrl: string;
    private proxyURL;
    protected logo: string;
    protected classPath: string;
    /**
     *
     * @param lightNovelUrl light novel link or id
     * @param chapterPage chapter page number (optional) if not provided, will fetch all chapter pages.
     */
    fetchLightNovelInfo: (lightNovelUrl: string, chapterPage?: number) => Promise<ILightNovelInfo>;
    private fetchChapters;
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
export default NovelUpdates;
