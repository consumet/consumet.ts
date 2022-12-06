import { BaseProvider } from '.';
declare abstract class BaseParser extends BaseProvider {
    /**
     * proxy url for fetching the data
     */
    private proxy;
    /**
     * Search for books/anime/manga/etc using the given query
     *
     * returns a promise resolving to a data object
     */
    abstract search(query: string, ...args: any[]): Promise<unknown>;
    set proxyUrl(url: string | undefined);
    get proxyUrl(): string | undefined;
}
export default BaseParser;
