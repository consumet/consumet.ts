import { VideoExtractor, IVideo, ISubtitle } from '../models';
declare class MegaCloud extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    extract: (videoUrl: URL) => Promise<{
        sources: IVideo[];
        subtitles: ISubtitle[];
    }>;
}
export default MegaCloud;
