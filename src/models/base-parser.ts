import { BaseProvider, ProxyConfig } from '.';
import axios, { AxiosInstance } from 'axios';

abstract class BaseParser extends BaseProvider {
  constructor(baseUrl?: string, proxy?: ProxyConfig) {
    super();
    // make a new axios instance for the parser and set it to outClient
    this.client = axios.create({
      baseURL: baseUrl,
    });
    this.client.interceptors.request.use(config => {
      if (proxy?.url) {
        config.headers = {
          ...config.headers,
          'x-api-key': proxy?.key ?? '',
        };
        config.url = proxy.url + config.url;
      }
      return config;
    });
  }

  protected client: AxiosInstance;
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
