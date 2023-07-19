import { VideoExtractor, IVideo, ISubtitle, ProxyConfig } from '../models';
declare class RapidCloud extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    private readonly fallbackKey;
    private readonly host;
    private readonly consumetApi;
    private readonly enimeApi;
    constructor(proxyConfig?: ProxyConfig);
    extract: (videoUrl: URL) => Promise<{
        sources: IVideo[];
    } & {
        subtitles: ISubtitle[];
    }>;
    private captcha;
}
export default RapidCloud;
