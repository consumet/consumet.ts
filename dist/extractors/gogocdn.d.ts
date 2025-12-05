import { VideoExtractor, IVideo, ISubtitle } from '../models';
declare class GogoCDN extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    private readonly keys;
    private referer;
    extract: (videoUrl: URL) => Promise<{
        sources: IVideo[];
    } & {
        subtitles: ISubtitle[];
    }>;
    private addSources;
    private generateEncryptedAjaxParams;
    private decryptAjaxData;
}
export default GogoCDN;
