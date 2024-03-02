import { IVideo, ISubtitle, Intro } from '../models';
declare class MegaCloud {
    extract(videoUrl: URL): Promise<{
        sources: IVideo[];
        subtitles: ISubtitle[];
        intro?: Intro | undefined;
        outro?: Intro | undefined;
    }>;
    extractVariables(text: string, sourceName: string): number[];
    getSecret(encryptedString: string, values: number[]): {
        secret: string;
        encryptedSource: string;
    };
    decrypt(encrypted: string, keyOrSecret: string, maybe_iv?: string): string;
}
export default MegaCloud;
