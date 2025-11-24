import { VideoExtractor, IVideo, ISubtitle } from '../models';
import { USER_AGENT } from '../utils';

interface IWishOutput {
  sources: {
    url: string;
    quality: string;
  }[];
  tracks: {
    file: string;
    label?: string;
    kind: string;
  }[];
  audio: any[];
  intro: { start: number; end: number };
  outro: { start: number; end: number };
  headers: {
    Referer: string;
    'User-Agent': string;
  };
}

class StreamWish extends VideoExtractor {
  protected override serverName = 'streamwish';
  protected override sources: IVideo[] = [];

  override extract = async (videoUrl: URL): Promise<{ sources: IVideo[] } & { subtitles: ISubtitle[] }> => {
    try {
      let finalUrl = videoUrl.href;

      if (videoUrl.hostname.includes('hglink.to')) {
        finalUrl = finalUrl.replace('hglink.to', 'dumbalag.com');
      }

      const apiUrl = 'https://crawlr.cc/B6D2A9F1C?url=' + encodeURIComponent(finalUrl);

      const { data } = await this.client.get<IWishOutput>(apiUrl);

      if (!data.sources?.length) throw new Error('No sources returned');

      for (const src of data.sources) {
        this.sources.push({
          url: src.url,
          quality: src.quality ?? 'auto',
          isM3U8: src.url.includes('.m3u8'),
        });
      }

      const subtitles: ISubtitle[] =
        data.tracks
          ?.filter(t => t.kind === 'captions')
          .map(t => ({
            lang: t.label ?? 'Unknown',
            url: t.file,
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

export default StreamWish;
