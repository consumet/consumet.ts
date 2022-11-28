import { ISource, IVideo, VideoExtractor } from '../models';
declare class BilibiliExtractor extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    extract(episodeId: any): Promise<ISource>;
    toDash: (data: any) => string;
    videoSegment: (video: any, index?: number) => string;
    audioSegment: (audio: any, index?: number) => string;
}
export default BilibiliExtractor;
