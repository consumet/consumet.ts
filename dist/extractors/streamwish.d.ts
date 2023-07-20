import { VideoExtractor, IVideo } from '../models';
declare class StreamWish extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    extract: (videoUrl: URL) => Promise<IVideo[]>;
}
export default StreamWish;
