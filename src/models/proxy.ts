import axios, { AxiosAdapter, AxiosInstance } from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import { ProxyConfig } from './types';

export class Proxy {
  constructor(protected proxyConfig?: ProxyConfig, protected adapter?: AxiosAdapter) {
    const instance = axios.create();
    this.client = setupCache(instance);
    if (adapter) this.setAxiosAdapter(adapter);
    if (proxyConfig) this.setProxy(proxyConfig);
  }

  // Keep track of rotation + interceptor so we can cleanly update
  private rotationTimer?: ReturnType<typeof setInterval>;
  private proxyInterceptorId?: number;

  // Prefer URL() over regex for validation
  private isValidUrl = (value: string): boolean => {
    try {
      const u = new URL(value);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  /**
   * Set or Change the proxy config
   */
  setProxy(proxyConfig: ProxyConfig) {
    if (!proxyConfig?.url) return;

    // Clear any existing rotation when changing strategy
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = undefined;
    }

    if (Array.isArray(proxyConfig.url)) {
      // Validate all
      proxyConfig.url.forEach((u, i) => {
        if (!this.isValidUrl(u)) throw new Error(`Proxy URL at index ${i} is invalid!`);
      });

      const urls = [...proxyConfig.url];
      // Apply immediately with the first URL
      this.applyProxyUrl(urls[0], proxyConfig.key);

      // Start rotation
      this.rotationTimer = setInterval(() => {
        const next = urls.shift();
        if (next) urls.push(next);
        this.applyProxyUrl(urls[0], proxyConfig.key);
      }, proxyConfig.rotateInterval ?? 5000);

      return;
    }

    // Single URL
    if (typeof proxyConfig.url === 'string') {
      if (!this.isValidUrl(proxyConfig.url)) throw new Error('Proxy URL is invalid!');
      this.applyProxyUrl(proxyConfig.url, proxyConfig.key);
    }
  }

  /**
   * Apply a single proxy URL by (re)installing the request interceptor
   */
  private applyProxyUrl(proxyUrl: string, key?: string) {
    // Eject previous interceptor if any
    if (this.proxyInterceptorId !== undefined) {
      this.client.interceptors.request.eject(this.proxyInterceptorId);
      this.proxyInterceptorId = undefined;
    }

    // Install new interceptor
    this.proxyInterceptorId = this.client.interceptors.request.use(config => {
      // Use baseURL instead of string-concatenating into url
      // Only set baseURL if it isn't already the same proxy
      if (!config.baseURL || !config.baseURL.startsWith(proxyUrl)) {
        config.baseURL = proxyUrl;
      }

      if (key) {
        // Axios v1 headers are AxiosHeaders; guard just in case
        config.headers = config.headers ?? {};
        config.headers.set ? config.headers.set('x-api-key', key) : (config.headers['x-api-key'] = key);
      }

      // Only try to set User-Agent in Node (browser disallows it)
      const isNode = typeof process !== 'undefined' && !!process.versions?.node;
      if (isNode && config.url?.includes('anify')) {
        config.headers = config.headers ?? {};
        config.headers.set
          ? config.headers.set('User-Agent', 'consumet')
          : (config.headers['User-Agent'] = 'consumet');
      }

      return config;
    });
  }

  /**
   * Set or Change the axios adapter
   */
  setAxiosAdapter(adapter: AxiosAdapter) {
    this.client.defaults.adapter = adapter;
  }

  protected client: AxiosInstance;
}

export default Proxy;
