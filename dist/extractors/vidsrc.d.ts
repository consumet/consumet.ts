import { VideoExtractor, IVideo } from '../models';
declare class Vidsrc extends VideoExtractor {
    protected serverName: string;
    protected BaseURL: string;
    protected EmmbedURL: string;
    protected sources: IVideo[];
    protected deobfstr: (data: String, id: String) => Promise<string>;
    extract(videoUrl: URL, attempt?: number, ...args: any): Promise<IVideo[]>;
}
export default Vidsrc;
