import { BaseProvider, ProxyConfig } from '.';
import { AxiosInstance } from 'axios';
declare abstract class BaseParser extends BaseProvider {
    constructor(baseUrl?: string, proxy?: ProxyConfig);
    /**
     * Set or Change the proxy config
     */
    setProxy(proxy: ProxyConfig): void;
    protected client: AxiosInstance;
    /**
     * Search for books/anime/manga/etc using the given query
     *
     * returns a promise resolving to a data object
     */
    abstract search(query: string, ...args: any[]): Promise<unknown>;
}
export default BaseParser;
