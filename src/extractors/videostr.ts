import { VideoExtractor, IVideo, ISubtitle } from '../models';

interface IVideoStrOutput {
  sources: {
    url: string;
    quality: string;
  }[];
  tracks: {
    file: string;
    label?: string;
    kind?: string;
  }[];
  audio: any[];
  intro: { start: number; end: number };
  outro: { start: number; end: number };
  headers: {
    Referer: string;
    'User-Agent': string;
  };
}

class VideoStr extends VideoExtractor {
  protected override serverName = 'VideoStr';
  protected override sources: IVideo[] = [];

  override extract = async (videoUrl: URL): Promise<{ sources: IVideo[]; subtitles: ISubtitle[] }> => {
    try {
      const apiUrl = 'https://crawlr.cc/E2B9A6F4C?url=' + encodeURIComponent(videoUrl.href);

      const { data } = await this.client.get<IVideoStrOutput>(apiUrl);

      if (!data.sources || data.sources.length === 0) {
        throw new Error('No sources returned');
      }

      for (const src of data.sources) {
        this.sources.push({
          url: src.url,
          quality: src.quality ?? 'auto',
          isM3U8: src.url.includes('.m3u8'),
        });
      }

      const subtitles: ISubtitle[] =
        data.tracks?.map(t => ({
          lang: t.label ?? 'Unknown',
          url: t.file,
          kind: t.kind ?? 'captions',
        })) ?? [];

      return {
        sources: this.sources,
        subtitles,
      };
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };
}

export default VideoStr;
