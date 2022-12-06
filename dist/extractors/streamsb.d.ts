import { VideoExtractor, IVideo } from '../models';
declare class StreamSB extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    private readonly host;
    private readonly host2;
    private PAYLOAD;
    extract: (videoUrl: URL, isAlt?: boolean) => Promise<IVideo[]>;
    private addSources;
}
export default StreamSB;
