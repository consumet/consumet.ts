import { AxiosAdapter, AxiosInstance } from 'axios';
import { ProxyConfig } from './types';
export declare class Proxy {
    protected proxyConfig?: ProxyConfig | undefined;
    protected adapter?: AxiosAdapter | undefined;
    constructor(proxyConfig?: ProxyConfig | undefined, adapter?: AxiosAdapter | undefined);
    private rotationTimer?;
    private proxyInterceptorId?;
    private isValidUrl;
    /**
     * Set or Change the proxy config
     */
    setProxy(proxyConfig: ProxyConfig): void;
    /**
     * Apply a single proxy URL by (re)installing the request interceptor
     */
    private applyProxyUrl;
    /**
     * Set or Change the axios adapter
     */
    setAxiosAdapter(adapter: AxiosAdapter): void;
    protected client: AxiosInstance;
}
export default Proxy;
