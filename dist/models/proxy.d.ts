import { AxiosAdapter, AxiosInstance } from 'axios';
import { ProxyConfig } from './types';
import BaseProvider from './base-provider';
declare namespace Proxy {
    abstract class Provider extends BaseProvider {
        constructor(baseUrl?: string, proxy?: ProxyConfig, adapter?: AxiosAdapter);
        private validUrl;
        /**
         * Set or Change the proxy config
         */
        setProxy(proxy: ProxyConfig): void;
        /**
         * Set or Change the axios adapter
         */
        setAxiosAdapter(adapter: AxiosAdapter): void;
        private rotateProxy;
        private toMap;
        protected client: AxiosInstance;
    }
    class Extractor {
        constructor(proxy?: ProxyConfig, adapter?: AxiosAdapter);
        private validUrl;
        /**
         * Set or Change the proxy config
         */
        setProxy(proxy: ProxyConfig): void;
        /**
         * Set or Change the axios adapter
         */
        setAxiosAdapter(adapter: AxiosAdapter): void;
        private rotateProxy;
        private toMap;
        protected client: AxiosInstance;
    }
}
export default Proxy;
