import { VideoExtractor, IVideo, ISubtitle } from '../models';
declare class SmashyStream extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    private readonly host;
    extract: (videoUrl: URL) => Promise<{
        sources: IVideo[];
    } & {
        subtitles: ISubtitle[];
    }>;
    extractSmashyFfix(url: string): Promise<{
        sources: IVideo[];
    } & {
        subtitles: ISubtitle[];
    }>;
    extractSmashyWatchX(url: string): Promise<{
        sources: IVideo[];
    } & {
        subtitles: ISubtitle[];
    }>;
    extractSmashyNFlim(url: string): Promise<{
        sources: IVideo[];
    } & {
        subtitles: ISubtitle[];
    }>;
    extractSmashyFX(url: string): Promise<{
        sources: IVideo[];
    } & {
        subtitles: ISubtitle[];
    }>;
    extractSmashyCF(url: string): Promise<{
        sources: IVideo[];
    } & {
        subtitles: ISubtitle[];
    }>;
    extractSmashyEEMovie(url: string): Promise<{
        sources: IVideo[];
    } & {
        subtitles: ISubtitle[];
    }>;
}
export default SmashyStream;
