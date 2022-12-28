import { MangaParser, ISearch, IMangaInfo, IMangaResult, IMangaChapterPage } from '../../models';
declare class MangaPill extends MangaParser {
    readonly name = "MangaPill";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    /**
     *
     * @param query Search query
     */
    search: (query: string) => Promise<ISearch<IMangaResult>>;
    fetchMangaInfo: (mangaId: string) => Promise<IMangaInfo>;
    fetchChapterPages: (chapterId: string) => Promise<IMangaChapterPage[]>;
}
export default MangaPill;
