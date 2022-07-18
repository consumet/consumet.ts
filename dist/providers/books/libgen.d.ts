import { BookParser, LibgenBook } from '../../models';
import { LibgenResult } from '../../models/types';
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
     * scrapes a libgen search page and returns an array of results
     *
     * @param {string} query - the name of the book
     * @param {number} [maxResults=25] - maximum number of results
     * @returns {Promise<LibgenBook[]>}
     */
    search: (query: string, page?: number) => Promise<LibgenResult>;
}
export default Libgen;
