import { BookParser, LibgenBook } from '../../models';
declare class Libgen extends BookParser {
    private readonly extensions;
    protected readonly baseUrl = "http://libgen";
    /**
     * @type {string}
     */
    readonly name: string;
    private readonly downloadIP;
    protected logo: string;
    protected classPath: string;
    /**
     * scrapes a ligen book page by book page url
     *
     * @param {string} bookUrl - ligen book page url
     * @returns {Promise<LibgenBook>}
     */
    scrapeBook: (bookUrl: string) => Promise<LibgenBook>;
    /**
     * scrapes a ligen search page by book query
     *
     * @remarks
     * this method is faster the, but doesn't scrape as much data as libgen.search()
     *
     * @param {string} query - the name of the book
     * @param {number} [maxresults=25] - maximum number of results
     * @returns {Promise<LibgenBook[]>}
     */
    fastSearch: (query: string, maxResults: number) => Promise<LibgenBook[]>;
    /**
     * scrapes a libgen search page and returns an array of results
     *
     * @param {string} query - the name of the book
     * @param {number} [maxResults=25] - maximum number of results
     * @returns {Promise<LibgenBook[]>}
     */
    search: (query: string, maxResults?: number | undefined) => Promise<LibgenBook[]>;
    /**
     * scrapes a ligen search page by page url
     *
     * @remarks
     * this method is faster, but doesn't scrape as much data as libgen.search()
     *
     * @param {string} bookUrl - ligen search url
     * @param {number} [maxresults=25] - maximum number of results
     * @returns {Promise<LibgenBook[]>}
     */
    fastScrapePage: (pageUrl: string) => Promise<LibgenBook[]>;
    /**
     * scrapes a ligen search page by page url
     *
     * @param {string} bookUrl - ligen search url
     * @param {number} [maxresults=25] - maximum number of results
     * @returns {Promise<LibgenBook[]>}
     */
    scrapePage: (pageUrl: string, maxResults?: number) => Promise<LibgenBook[]>;
}
export default Libgen;
