import { load } from 'cheerio';

import { IVideo, VideoExtractor, ISubtitle } from '../models';

class Voe extends VideoExtractor {
  protected override serverName = 'voe';
  protected override sources: IVideo[] = [];

  private readonly domains = ['voe.sx'];

  override extract = async (videoUrl: URL): Promise<{ sources: IVideo[] } & { subtitles: ISubtitle[] }> => {
    try {
      const res = await this.client.get(videoUrl.href);
      const $ = load(res.data);
      const scriptContent = $('script').html();
      const pageUrl = scriptContent
        ? scriptContent.match(/window\.location\.href\s*=\s*'(https:\/\/[^']+)';/)?.[1] ?? ''
        : '';

      const { data } = await this.client.get(pageUrl);
      const $$ = load(data);
      const bodyHtml = $$('body').html() || '';
      const url = bodyHtml.match(/'hls'\s*:\s*'([^']+)'/s)?.[1] || '';

      const subtitleRegex =
        /<track\s+kind="subtitles"\s+label="([^"]+)"\s+srclang="([^"]+)"\s+src="([^"]+)"/g;
      let subtitles: ISubtitle[] = [];
      let match;
      while ((match = subtitleRegex.exec(bodyHtml)) !== null) {
        subtitles.push({
          lang: match[1],
          url: new URL(match[3], videoUrl.origin).href,
        });
      }

      let thumbnailSrc: string = '';
      $$('script').each((i, el) => {
        const scriptContent = $(el).html();
        const regex = /previewThumbnails:\s*{[^}]*src:\s*\["([^"]+)"\]/;
        if (scriptContent) {
          const match = scriptContent.match(regex);
          if (match && match[1]) {
            thumbnailSrc = match[1];
            return false;
          }
        }
      });
      if (thumbnailSrc) {
        subtitles.push({
          lang: 'thumbnails',
          url: `${videoUrl.origin}${thumbnailSrc}`,
        });
      }

      this.sources.push({
        url: atob(url),
        quality: 'default',
        isM3U8: atob(url).includes('.m3u8'),
      });

      return {
        sources: this.sources,
        subtitles: subtitles,
      };
    } catch (err) {
      console.log(err);
      throw new Error((err as Error).message);
    }
  };
}

export default Voe;
