import { VideoExtractor, IVideo } from '../models';
declare class Luffy extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    private readonly host;
    extract: (videoUrl: URL) => Promise<IVideo[]>;
    private deobfuscateScript;
}
export default Luffy;
