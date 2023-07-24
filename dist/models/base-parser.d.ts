import { ProxyConfig } from '.';
import Proxy from './proxy';
declare abstract class BaseParser extends Proxy.Provider {
    constructor(baseUrl?: string, proxyConfig?: ProxyConfig);
    /**
     * Search for books/anime/manga/etc using the given query
     *
     * returns a promise resolving to a data object
     */
    abstract search(query: string, ...args: any[]): Promise<unknown>;
}
export default BaseParser;
