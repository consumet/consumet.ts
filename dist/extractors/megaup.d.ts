import { ISource, IVideo, VideoExtractor } from '../models';
import { AxiosAdapter } from 'axios';
import { ProxyConfig } from '../models/types';
export declare class MegaUp extends VideoExtractor {
    protected proxyConfig?: ProxyConfig | undefined;
    protected adapter?: AxiosAdapter | undefined;
    protected serverName: string;
    protected sources: IVideo[];
    private homeKeys;
    private megaKeys;
    private kaiKeysReady;
    constructor(proxyConfig?: ProxyConfig | undefined, adapter?: AxiosAdapter | undefined);
    private loadKAIKEYS;
    private keysChar;
    GenerateToken: (n: string) => string;
    DecodeIframeData: (n: string) => string;
    Decode: (n: string) => string;
    extract: (videoUrl: URL) => Promise<ISource>;
}
