import { VideoExtractor, IVideo, ISubtitle, Intro } from '../models';
declare class VidCloud extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    extract: (videoUrl: URL, referer?: string) => Promise<{
        sources: IVideo[];
        subtitles: ISubtitle[];
        intro?: Intro;
        outro?: Intro;
    }>;
}
export default VidCloud;
