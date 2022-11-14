import { BaseProvider } from '.';
import axios from 'axios';

abstract class BaseParser extends BaseProvider {

  /**
   * proxy url for fetching the data
   */
  private proxy: string | undefined;

  /**
   * Search for books/anime/manga/etc using the given query
   *
   * returns a promise resolving to a data object
   */
  abstract search(query: string, ...args: any[]): Promise<unknown>;

  set proxyUrl(url: string | undefined) {
    if (url && !url.startsWith('http')) throw new Error('[BaseParser] Invalid proxy url');
    if (url && !url.endsWith('/')) url += '/';    
    this.proxy = url;
  }

  get proxyUrl(): string | undefined {
    return this.proxy;
  }



}

export default BaseParser;
