import { ISource, IVideo, VideoExtractor } from '../../models';
declare class MegaCloud extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    extract(embedIframeURL: URL, referer?: string): Promise<ISource>;
}
export default MegaCloud;
