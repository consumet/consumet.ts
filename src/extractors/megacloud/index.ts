import { VideoExtractor } from "../../models";
import axios from "axios";

class MegaCloud extends VideoExtractor {
    serverName = 'MegaCloud';
    sources = [];

    async extract(embedIframeURL: URL, referer: string = 'https://hianime.to') {
        try {
            const extractedData = {
                subtitles: [],
                intro: {
                    start: 0,
                    end: 0,
                },
                outro: {
                    start: 0,
                    end: 0,
                },
                sources: [],
            };

            const match = /\/([^\/\?]+)\?/.exec(embedIframeURL.href);
            const sourceId = match?.[1];
            if (!sourceId) throw new Error("Unable to extract sourceId from embed URL");

            const megacloudUrl = `https://megacloud.blog/embed-2/v2/e-1/getSources?id=${sourceId}`;
            const { data: rawSourceData } = await axios.get(megacloudUrl);

            const bypassUrl = `https://bypass.lunaranime.ru/extract?url=${encodeURIComponent(megacloudUrl)}`;
            const { data: bypassData } = await axios.get(bypassUrl);

            if (!bypassData?.sources || !Array.isArray(bypassData.sources) || bypassData.sources.length === 0) {
                throw new Error("No sources found in bypass response");
            }

            extractedData.sources = bypassData.sources.map((s: any) => ({
                url: s.file,
                isM3U8: s.type === 'hls',
                type: s.type,
            }));
            extractedData.intro = rawSourceData.intro ? rawSourceData.intro : extractedData.intro;
            extractedData.outro = rawSourceData.outro ? rawSourceData.outro : extractedData.outro;
            extractedData.subtitles = rawSourceData.tracks?.map((track: any) => ({
                url: track.file,
                lang: track.label ? track.label : track.kind,
            })) || [];

            return {
                intro: extractedData.intro,
                outro: extractedData.outro,
                sources: extractedData.sources,
                subtitles: extractedData.subtitles,
            };
        }
        catch (err) {
            throw err;
        }
    }
}

export default MegaCloud;
