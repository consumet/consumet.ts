import { IVideo } from '../models';
import VideoExtractor from '../models/video-extractor';
declare class Sendvid extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    extract: (videoUrl: URL) => Promise<IVideo[]>;
}
export default Sendvid;
