import { VideoExtractor, IVideo, ISubtitle } from '../models';
declare class VideoStr extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    extract: (videoUrl: URL) => Promise<{
        sources: IVideo[];
        subtitles: ISubtitle[];
        intro?: any;
        outro?: any;
    }>;
}
export default VideoStr;
