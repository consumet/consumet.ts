import { VideoExtractor, IVideo } from '../models';

interface IStreamOutput {
  sources: {
    url: string;
    quality: string;
  }[];
  tracks: any[];
  audio: any[];
  intro: { start: number; end: number };
  outro: { start: number; end: number };
  headers: {
    Referer: string;
    'User-Agent': string;
  };
}

class StreamTape extends VideoExtractor {
  protected override serverName = 'StreamTape';
  protected override sources: IVideo[] = [];

  override extract = async (videoUrl: URL): Promise<IVideo[]> => {
    try {
      const apiUrl = 'https://crawlr.cc/F4A2D9B6C?url=' + encodeURIComponent(videoUrl.href);

      const { data } = await this.client.get<IStreamOutput>(apiUrl);

      if (!data.sources || data.sources.length === 0) {
        throw new Error('No sources returned');
      }

      for (const src of data.sources) {
        this.sources.push({
          url: src.url,
          quality: src.quality,
          isM3U8: src.url.includes('.m3u8'),
        });
      }

      return this.sources;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };
}

export default StreamTape;
