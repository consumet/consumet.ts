import { MangaParser, ISearch, IMangaInfo, IMangaResult, IMangaChapterPage } from '../../models';
export type MangaHereRankingType = 'total' | 'month' | 'week' | 'day';
export type MangaHereSort = 'az' | 'popularity' | 'rating' | 'latest' | 'news';
export type MangaHereStatus = 'all' | 'new' | 'completed' | 'ongoing';
declare class MangaHere extends MangaParser {
    readonly name = "MangaHere";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    fetchMangaInfo: (mangaId: string) => Promise<IMangaInfo>;
    fetchChapterPages: (chapterId: string) => Promise<IMangaChapterPage[]>;
    search: (query: string, page?: number) => Promise<ISearch<IMangaResult>>;
    fetchMangaRanking: (type?: MangaHereRankingType) => Promise<ISearch<IMangaResult>>;
    fetchMangaHotReleases: () => Promise<ISearch<IMangaResult>>;
    fetchMangaTrending: () => Promise<ISearch<IMangaResult>>;
    fetchMangaRecentUpdate: (page?: number) => Promise<ISearch<IMangaResult>>;
    browse: (options?: {
        genre?: string;
        status?: MangaHereStatus;
        sort?: MangaHereSort;
        page?: number;
    }) => Promise<ISearch<IMangaResult>>;
    private _getMangaList;
    /**
     *  credit: [tachiyomi-extensions](https://github.com/tachiyomiorg/tachiyomi-extensions/blob/master/src/en/mangahere/src/eu/kanade/tachiyomi/extension/en/mangahere/Mangahere.kt)
     */
    private extractKey;
}
export default MangaHere;
