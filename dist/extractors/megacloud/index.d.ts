import { ISource, IVideo, VideoExtractor } from '../../models';
declare class MegaCloud extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    extract_old(embedIframeURL: URL, referer?: string): Promise<ISource>;
    extract(embedIframeURL: URL, referer?: string): Promise<ISource>;
}
export default MegaCloud;
