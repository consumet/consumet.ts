import { VideoExtractor, IVideo } from '../models';
declare class VizCloud extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    private readonly host;
    private keys;
    extract: (videoUrl: URL, vizCloudHelper: string, apiKey: string) => Promise<IVideo[]>;
}
export default VizCloud;
