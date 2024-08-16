import { IMangaChapterPage, IMangaInfo, IMangaResult, ISearch, MangaParser } from '../../models';
declare class VyvyManga extends MangaParser {
    readonly name: string;
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    protected baseWebsiteUrl: string;
    search: (query: string, page?: number) => Promise<ISearch<IMangaResult>>;
    searchApi: (query: string) => Promise<ISearch<IMangaResult>>;
    fetchMangaInfo: (mangaId: string) => Promise<IMangaInfo>;
    fetchChapterPages: (chapterId: string) => Promise<IMangaChapterPage[]>;
    private formatSearchResultData;
}
export default VyvyManga;
