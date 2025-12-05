import { ISource, IVideo, VideoExtractor } from '../models';
import { AxiosAdapter } from 'axios';
import { ProxyConfig } from '../models/types';
/**
 * Thanks to [Seniy](https://github.com/AzartX47/EncDecEndpoints/blob/main/samples/animekai.py) for the api implementation
 */
export declare class MegaUp extends VideoExtractor {
    protected proxyConfig?: ProxyConfig | undefined;
    protected adapter?: AxiosAdapter | undefined;
    protected serverName: string;
    protected sources: IVideo[];
    protected apiBase: string;
    constructor(proxyConfig?: ProxyConfig | undefined, adapter?: AxiosAdapter | undefined);
    GenerateToken: (n: string) => Promise<string>;
    DecodeIframeData: (n: string) => Promise<{
        url: string;
        skip: {
            intro: [number, number];
            outro: [number, number];
        };
    }>;
    Decode: (n: string) => Promise<{
        sources: {
            file: string;
        }[];
        tracks: {
            kind: string;
            file: string;
            label: string;
        }[];
        download: string;
    }>;
    extract: (videoUrl: URL) => Promise<ISource>;
}
