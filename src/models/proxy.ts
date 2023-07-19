import axios, { AxiosInstance } from 'axios';

import { ProxyConfig } from './types';
import BaseProvider from './base-provider';

namespace Proxy {
  export abstract class ProviderProxy extends BaseProvider {
    constructor(baseUrl?: string, proxy?: ProxyConfig) {
      super();
      this.client = axios.create({
        baseURL: baseUrl,
      });

      if (proxy) this.setProxy(proxy);
    }
    private validUrl = /^https?:\/\/.+/;
    /**
     * Set or Change the proxy config
     */
    setProxy(proxy: ProxyConfig) {
      if (!proxy?.url) return;

      if (typeof proxy?.url === 'string')
        if (!this.validUrl.test(proxy.url)) throw new Error('Proxy URL is invalid!');

      if (Array.isArray(proxy?.url)) {
        for (const [i, url] of this.toMap<string>(proxy.url))
          if (!this.validUrl.test(url)) throw new Error(`Proxy URL at index ${i} is invalid!`);

        this.rotateProxy({ ...proxy, urls: proxy.url });
      }

      this.client.interceptors.request.use(config => {
        if (proxy?.url) {
          config.headers = {
            ...config.headers,
            'x-api-key': proxy?.key ?? '',
            origin: 'axios',
          };
          config.url = `${proxy.url}/${config?.baseURL}${config?.url ? config?.url : ''}`;
          console.log(config.url);
        }
        return config;
      });
    }

    private rotateProxy = (proxy: Omit<ProxyConfig, 'url'> & { urls: string[] }, ms: number = 5000) => {
      setInterval(() => {
        const url = proxy.urls.shift();
        if (url) proxy.urls.push(url);

        this.setProxy({ url: proxy.urls[0], key: proxy.key });
      }, ms);
    };

    private toMap = <T>(arr: T[]): [number, T][] => arr.map((v, i) => [i, v]);

    protected client: AxiosInstance;
  }

  export class ExtractorProxy {
    constructor(proxy?: ProxyConfig) {
      this.client = axios.create();

      if (proxy) this.setProxy(proxy);
    }
    private validUrl = /^https?:\/\/.+/;
    /**
     * Set or Change the proxy config
     */
    setProxy(proxy: ProxyConfig) {
      if (!proxy?.url) return;

      if (typeof proxy?.url === 'string')
        if (!this.validUrl.test(proxy.url)) throw new Error('Proxy URL is invalid!');

      if (Array.isArray(proxy?.url)) {
        for (const [i, url] of this.toMap<string>(proxy.url))
          if (!this.validUrl.test(url)) throw new Error(`Proxy URL at index ${i} is invalid!`);

        this.rotateProxy({ ...proxy, urls: proxy.url });
      }

      this.client.interceptors.request.use(config => {
        if (proxy?.url) {
          config.headers = {
            ...config.headers,
            'x-api-key': proxy?.key ?? '',
            Origin: 'axios',
          };
          config.url = `${proxy.url}/${config?.url ? config?.url : ''}`;
        }
        return config;
      });
    }

    private rotateProxy = (proxy: Omit<ProxyConfig, 'url'> & { urls: string[] }, ms: number = 5000) => {
      setInterval(() => {
        const url = proxy.urls.shift();
        if (url) proxy.urls.push(url);

        this.setProxy({ url: proxy.urls[0], key: proxy.key });
      }, ms);
    };

    private toMap = <T>(arr: T[]): [number, T][] => arr.map((v, i) => [i, v]);

    protected client: AxiosInstance;
  }
}

export default Proxy;
