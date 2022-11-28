import { VideoExtractor, IVideo } from '../models';
/**
 * work in progress
 */
declare class Filemoon extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    private readonly host;
    extract: (videoUrl: URL) => Promise<IVideo[]>;
}
export default Filemoon;
