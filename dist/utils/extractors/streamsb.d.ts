import { VideoExtractor, IVideo } from '../../models';
declare class StreamSB extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    private readonly host;
    private PAYLOAD;
    extract: (videoUrl: URL) => Promise<IVideo[]>;
    private addSources;
}
export default StreamSB;
