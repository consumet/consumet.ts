export declare const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36";
export declare const splitAuthor: (authors: string) => string[];
export declare const floorID: (id: string) => number;
export declare const formatTitle: (title: string) => string;
export declare const genElement: (s: string, e: string) => import("cheerio").Cheerio<import("cheerio").AnyNode> | undefined;
export declare const range: ({ from, to, step, length }: {
    from?: number | undefined;
    to?: number | undefined;
    step?: number | undefined;
    length?: number | undefined;
}) => number[];
export declare const capitalizeFirstLetter: (s: string) => string;
export declare const anilistSearchQuery: (query: string, page: number, perPage: number) => string;
export declare const anilistMediaDetailQuery: (id: string) => string;
export declare const anilistTrendingAnimeQuery: (page?: number, perPage?: number) => string;
export declare const kitsuSearchQuery: (query: string) => string;
