import { IVideo } from '../models';
import VideoExtractor from '../models/video-extractor';
declare class MoveArnPre extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    private unpack;
    extract: (videoUrl: URL) => Promise<IVideo[]>;
}
export default MoveArnPre;
