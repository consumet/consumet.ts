import { IVideo } from '../models';
import VideoExtractor from '../models/video-extractor';
declare class LuluStream extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    extract: (videoUrl: URL) => Promise<IVideo[]>;
    private parseM3U8;
}
export default LuluStream;
