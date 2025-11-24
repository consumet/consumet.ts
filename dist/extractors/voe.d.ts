import { VideoExtractor, IVideo, ISubtitle } from '../models';
declare class Voe extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    extract: (videoUrl: URL) => Promise<{
        sources: IVideo[];
        subtitles: ISubtitle[];
    }>;
}
export default Voe;
