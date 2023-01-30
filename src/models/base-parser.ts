import { BaseProvider, ProxyConfig } from '.';
import axios, { AxiosInstance } from 'axios';

abstract class BaseParser extends BaseProvider {
  constructor(baseUrl?: string, proxy?: ProxyConfig) {
    super();

    this.client = axios.create({
      baseURL: baseUrl,
    });

    if (proxy) this.setProxy(proxy);
  }

  /**
   * Set or Change the proxy config
   */
  setProxy(proxy: ProxyConfig) {
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
   * Search for books/anime/manga/etc using the given query
   *
   * returns a promise resolving to a data object
   */
  abstract search(query: string, ...args: any[]): Promise<unknown>;
}

export default BaseParser;
