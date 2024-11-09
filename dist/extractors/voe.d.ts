import { IVideo, VideoExtractor, ISubtitle } from '../models';
declare class Voe extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    private readonly domains;
    extract: (videoUrl: URL) => Promise<{
        sources: IVideo[];
    } & {
        subtitles: ISubtitle[];
    }>;
}
export default Voe;
