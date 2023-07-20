import axios, { AxiosInstance } from 'axios';

import { ProxyConfig } from '.';
import Proxy from './proxy';

abstract class BaseParser extends Proxy.Provider {
  constructor(baseUrl?: string, proxyConfig?: ProxyConfig) {
    super(baseUrl, proxyConfig);
  }

  /**
   * Search for books/anime/manga/etc using the given query
   *
   * returns a promise resolving to a data object
   */
  abstract search(query: string, ...args: any[]): Promise<unknown>;
}

export default BaseParser;
