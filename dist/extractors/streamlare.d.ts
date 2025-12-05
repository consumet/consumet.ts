import { IVideo, ISource } from '../models';
import VideoExtractor from '../models/video-extractor';
declare class StreamLare extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    private readonly host;
    private readonly regex;
    private readonly USER_AGENT;
    extract(videoUrl: URL, userAgent?: string, ...args: any): Promise<IVideo[] | ISource>;
}
export default StreamLare;
