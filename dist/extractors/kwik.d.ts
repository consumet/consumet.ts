import { VideoExtractor, IVideo } from '../models';
declare class Kwik extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    private readonly host;
    private readonly sgProxy;
    extract: (videoUrl: URL) => Promise<IVideo[]>;
    private format;
}
export default Kwik;
