import { VideoExtractor, IVideo } from '../models';
declare class Voe extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    private readonly domains;
    extract: (videoUrl: URL) => Promise<IVideo[]>;
}
export default Voe;
