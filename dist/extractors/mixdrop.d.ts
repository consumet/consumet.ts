import { VideoExtractor, IVideo } from '../models';
declare class MixDrop extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    extract: (videoUrl: URL) => Promise<IVideo[]>;
}
export default MixDrop;
