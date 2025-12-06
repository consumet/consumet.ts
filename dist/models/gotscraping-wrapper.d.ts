import type { Response } from 'got';
interface HeaderGeneratorOptions {
    browsers?: Array<{
        name: string;
        minVersion?: number;
        maxVersion?: number;
    }>;
    devices?: string[];
    locales?: string[];
    operatingSystems?: string[];
}
interface GotScrapingOptions {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    headerGeneratorOptions?: HeaderGeneratorOptions;
    responseType?: 'text' | 'json' | 'buffer';
    [key: string]: unknown;
}
export declare function makeRequest(options: GotScrapingOptions): Promise<Response<string>>;
declare const wrapper: {
    makeRequest: typeof makeRequest;
};
export default wrapper;
