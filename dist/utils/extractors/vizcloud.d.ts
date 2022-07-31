import { VideoExtractor, IVideo } from '../../models';
declare class VizCloud extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    private readonly host;
    private readonly keys;
    private readonly base64Table;
    extract: (videoUrl: URL, cipher: (query: string, key: string) => string, encrypt: (query: string, key: string) => string) => Promise<IVideo[]>;
    private dashify;
}
export default VizCloud;
