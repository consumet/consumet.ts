import { VideoExtractor, IVideo } from '../models';
declare class Kwik extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    private readonly baseUrl;
    private readonly safelinkBaseUrl;
    extract: (videoUrl: URL) => Promise<IVideo[]>;
    bypassShortlink(shortinkUrl: URL): Promise<any>;
    getDirectDownloadLink(downloadUrl: URL): Promise<string | null>;
    /**
     * @param payload - The encrypted string containing delimiters
     * @param key - The custom alphabet string (e.g., "dcnCbMvPQ")
     * @param offset - The integer to subtract from the decoded value (e.g., 14)
     * @param radix - The base of the number system (e.g., 5)
     */
    deobfuscate(payload: string, key: string, offset: number, radix: number): string;
}
export default Kwik;
