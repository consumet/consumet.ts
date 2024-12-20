import { ISource, IVideo, VideoExtractor } from '../../models';
export type track = {
    file: string;
    kind: string;
    label?: string;
    default?: boolean;
};
type intro_outro = {
    start: number;
    end: number;
};
export type unencryptedSource = {
    file: string;
    type: string;
};
export type extractedSources = {
    sources: string | unencryptedSource[];
    tracks: track[];
    encrypted: boolean;
    intro: intro_outro;
    outro: intro_outro;
    server: number;
};
declare class MegaCloud extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    extract(embedIframeURL: URL): Promise<ISource>;
}
export default MegaCloud;
