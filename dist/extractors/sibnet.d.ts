import { IVideo } from '../models';
import VideoExtractor from '../models/video-extractor';
declare class Sibnet extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    extract: (videoUrl: URL) => Promise<IVideo[]>;
}
export default Sibnet;
