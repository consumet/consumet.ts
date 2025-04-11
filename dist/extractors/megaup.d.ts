import { ISource, IVideo, VideoExtractor } from '../models';
import { AxiosAdapter } from 'axios';
import { ProxyConfig } from '../models/types';
export declare class MegaUp extends VideoExtractor {
    protected proxyConfig?: ProxyConfig | undefined;
    protected adapter?: AxiosAdapter | undefined;
    protected serverName: string;
    protected sources: IVideo[];
    private KAICODEX;
    private kaicodexReady;
    constructor(proxyConfig?: ProxyConfig | undefined, adapter?: AxiosAdapter | undefined);
    private loadKAICODEX;
    GenerateToken: (n: string) => string;
    DecodeIframeData: (n: string) => string;
    Decode: (n: string) => string;
    extract: (videoUrl: URL) => Promise<ISource>;
}
