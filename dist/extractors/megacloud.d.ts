import { IVideo, ISubtitle, Intro, VideoExtractor } from '../models';
declare class MegaCloud extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    extract(videoUrl: URL): Promise<{
        sources: IVideo[];
        subtitles: ISubtitle[];
        intro?: Intro | undefined;
        outro?: Intro | undefined;
    }>;
    extractVariables(text: string): number[][];
    getSecret(encryptedString: string, values: number[][]): {
        secret: string;
        encryptedSource: string;
    };
    decrypt(encrypted: string, keyOrSecret: string, maybe_iv?: string): string;
    matchingKey(value: string, script: string): string;
}
export default MegaCloud;
