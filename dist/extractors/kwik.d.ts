import { VideoExtractor, IVideo } from '../models';
declare class Kwik extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    private readonly host;
    extract: (videoUrl: URL) => Promise<IVideo[]>;
}
export default Kwik;
