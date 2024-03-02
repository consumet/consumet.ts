type track = {
    file: string;
    kind: string;
    label?: string;
    default?: boolean;
};
type intro_outro = {
    start: number;
    end: number;
};
type unencryptedSrc = {
    file: string;
    type: string;
};
type extractedSrc = {
    sources: string | unencryptedSrc[];
    tracks: track[];
    encrypted: boolean;
    intro: intro_outro;
    outro: intro_outro;
    server: number;
};
interface ExtractedData extends Pick<extractedSrc, "intro" | "outro" | "tracks"> {
    sources: {
        url: string;
        type: string;
    }[];
}
declare class MegaCloud {
    private serverName;
    extract(videoUrl: URL): Promise<ExtractedData>;
    extractVariables(text: string, sourceName: string): number[];
    getSecret(encryptedString: string, values: number[]): {
        secret: string;
        encryptedSource: string;
    };
    decrypt(encrypted: string, keyOrSecret: string, maybe_iv?: string): string;
}
export default MegaCloud;
