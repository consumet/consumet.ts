import { VideoExtractor, IVideo } from '../../models';
/**
 * work in progress
 */
declare class Vrv extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    private readonly host;
    private readonly animixplayHost;
    extract: (videoUrl: URL) => Promise<IVideo[]>;
}
export default Vrv;
