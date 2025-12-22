import { VideoExtractor, IVideo } from '../models';
declare class VidMoly extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    extract: (videoUrl: URL) => Promise<IVideo[]>;
}
export default VidMoly;
