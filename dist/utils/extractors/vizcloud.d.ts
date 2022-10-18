import { VideoExtractor, IVideo } from '../../models';
declare class VizCloud extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    private readonly host;
    private keys;
    extract: (videoUrl: URL, cipher: (query: string, key: string) => string, encrypt: (query: string, key: string) => string) => Promise<IVideo[]>;
    private encrypt;
    private s;
    private dashify;
    private fetchKeys;
}
export default VizCloud;
