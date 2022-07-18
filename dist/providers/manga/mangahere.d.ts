import { MangaParser, ISearch, IMangaInfo, IMangaResult, IMangaChapterPage } from '../../models';
declare class MangaHere extends MangaParser {
    readonly name = "MangaHere";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    fetchMangaInfo: (mangaId: string) => Promise<IMangaInfo>;
    fetchChapterPages: (chapterId: string) => Promise<IMangaChapterPage[]>;
    search: (query: string, page?: number) => Promise<ISearch<IMangaResult>>;
    /**
     *  credit: [tachiyomi-extensions](https://github.com/tachiyomiorg/tachiyomi-extensions/blob/master/src/en/mangahere/src/eu/kanade/tachiyomi/extension/en/mangahere/Mangahere.kt)
     */
    private extractKey;
}
export default MangaHere;
