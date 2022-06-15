import { BookParser, LibgenBook } from '../../models';
declare class Libgen extends BookParser {
    private readonly extensions;
    protected readonly baseUrl = "http://libgen";
    readonly name = "Libgen";
    readonly downloadIP = "http://62.182.86.140";
    protected logo: string;
    protected classPath: string;
    scrapeBook: (bookUrl: string) => Promise<LibgenBook>;
    fastSearch: (query: string, maxResults: number) => Promise<LibgenBook[]>;
    search: (query: string, maxResults?: number | undefined) => Promise<LibgenBook[]>;
    fastScrapePage: (pageUrl: string) => Promise<LibgenBook[]>;
    scrapePage: (pageUrl: string) => Promise<LibgenBook[]>;
}
export default Libgen;
