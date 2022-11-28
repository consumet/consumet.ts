import { VideoExtractor, IVideo } from '../models';
declare class StreamTape extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    extract: (videoUrl: URL) => Promise<IVideo[]>;
}
export default StreamTape;
