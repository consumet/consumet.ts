import { MangaParser, ISearch, IMangaInfo, IMangaResult, IMangaChapterPage } from '../../models';
declare class WeebCentral extends MangaParser {
    readonly name = "WeebCentral";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private headers;
    search: (query: string, page?: number) => Promise<ISearch<IMangaResult>>;
    fetchMangaInfo: (mangaId: string) => Promise<IMangaInfo>;
    fetchChapterPages: (chapterId: string) => Promise<IMangaChapterPage[]>;
}
export default WeebCentral;
