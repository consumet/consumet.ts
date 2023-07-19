import { AxiosInstance } from 'axios';
import { ProxyConfig } from './types';
import BaseProvider from './base-provider';
declare namespace Proxy {
    abstract class ProviderProxy extends BaseProvider {
        constructor(baseUrl?: string, proxy?: ProxyConfig);
        private validUrl;
        /**
         * Set or Change the proxy config
         */
        setProxy(proxy: ProxyConfig): void;
        private rotateProxy;
        private toMap;
        protected client: AxiosInstance;
    }
    class ExtractorProxy {
        constructor(proxy?: ProxyConfig);
        private validUrl;
        /**
         * Set or Change the proxy config
         */
        setProxy(proxy: ProxyConfig): void;
        private rotateProxy;
        private toMap;
        protected client: AxiosInstance;
    }
}
export default Proxy;
