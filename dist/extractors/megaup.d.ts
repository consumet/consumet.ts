import { ISource, IVideo, VideoExtractor } from '../models';
export declare class MegaUp extends VideoExtractor {
    #private;
    protected serverName: string;
    protected sources: IVideo[];
    GenerateToken: (n: string) => string;
    DecodeIframeData: (n: string) => string;
    Decode: (n: string) => string;
    extract: (videoUrl: URL) => Promise<ISource>;
}
