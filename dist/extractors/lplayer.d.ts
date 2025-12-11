import { IVideo } from '../models';
import VideoExtractor from '../models/video-extractor';
declare class Lpayer extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    private readonly AES_KEY;
    private readonly AES_IV;
    private decrypt;
    extract: (videoUrl: URL) => Promise<IVideo[]>;
}
export default Lpayer;
