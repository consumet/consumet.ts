import { VideoExtractor, IVideo, ProxyConfig } from '../models';
declare class GogoCDN extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    private readonly keys;
    private referer;
    constructor(proxyConfig?: ProxyConfig);
    extract: (videoUrl: URL) => Promise<IVideo[]>;
    private addSources;
    private generateEncryptedAjaxParams;
    private decryptAjaxData;
}
export default GogoCDN;
