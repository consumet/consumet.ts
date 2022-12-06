import { MangaParser, ISearch, IMangaInfo, IMangaResult, IMangaChapterPage } from '../../models';
declare class Mangapark extends MangaParser {
    readonly name = "Mangapark";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    fetchMangaInfo: (mangaId: string, ...args: any) => Promise<IMangaInfo>;
    fetchChapterPages: (chapterId: string, ...args: any) => Promise<IMangaChapterPage[]>;
    search: (query: string, page?: number, ...args: any[]) => Promise<ISearch<IMangaResult>>;
}
export default Mangapark;
