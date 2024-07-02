import { IMangaChapterPage, IMangaInfo, IMangaResult, ISearch, MangaParser } from '../../models';
declare class ReadManga extends MangaParser {
    readonly name = "ReadManga";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    protected darkLogo: string;
    /**
     *
     * @param query Search query
     */
    search: (query: string) => Promise<ISearch<IMangaResult>>;
    fetchNewManga: (page?: number) => Promise<ISearch<IMangaResult>>;
    fetchTopRatedManga: (page?: number) => Promise<ISearch<IMangaResult>>;
    fetchMangaInfo: (mangaId: string) => Promise<IMangaInfo>;
    fetchChapterPages: (chapterId: string) => Promise<IMangaChapterPage[]>;
    private getRankingTitleCardData;
    private getTotalPages;
    private formatSearchResultData;
    private getStatus;
}
export default ReadManga;
