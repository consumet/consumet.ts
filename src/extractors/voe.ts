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
      const url = $$('body').html()!.split('prompt("Node", "')[1].split('");')[0];

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
      const subtitles: ISubtitle[] = [
        {
          lang: 'thumbnails',
          url: `${videoUrl.origin}${thumbnailSrc}`,
        },
      ];

      this.sources.push({
        url: url,
        quality: 'default',
        isM3U8: url.includes('.m3u8'),
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
