import { IVideo, ISubtitle, Intro } from '../models';
export interface MegaCloudResult {
    sources: IVideo[];
    subtitles: ISubtitle[];
    intro?: Intro;
    outro?: Intro;
}
/**
 * Main extraction function for Megacloud-based players (VideoStr, MegaCloud, VidCloud/UpCloud).
 *
 * @param videoUrl - The embed page URL (e.g. https://videostr.net/embed-1/v3/e-1/XRAX?z=)
 * @param referer - Optional referer header
 */
export declare function extractMegaCloudSources(videoUrl: URL, referer?: string): Promise<MegaCloudResult>;
