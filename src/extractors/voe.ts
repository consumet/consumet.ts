import { load } from 'cheerio';

import { IVideo, VideoExtractor, ISubtitle } from '../models';

class Voe extends VideoExtractor {
  protected override serverName = 'voe';
  protected override sources: IVideo[] = [];

  private readonly domains = ['voe.sx'];

  override extract = async (videoUrl: URL): Promise<{ sources: IVideo[] } & { subtitles: ISubtitle[] }> => {
    try {
      function decryptF7(p8: string): Record<string, any> {
        try {
          const vF = rot13(p8);
          const vF2 = replacePatterns(vF);
          const vF3 = removeUnderscores(vF2);
          const vF4 = base64Decode(vF3);
          const vF5 = charShift(vF4, 3);
          const vF6 = reverse(vF5);
          const vAtob = base64Decode(vF6);

          return JSON.parse(vAtob);
        } catch (e) {
          console.error('Decryption error:', e);
          return {};
        }
      }

      function rot13(input: string): string {
        return input.replace(/[a-zA-Z]/g, c => {
          const base = c <= 'Z' ? 65 : 97;
          return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
        });
      }

      function replacePatterns(input: string): string {
        const patterns = ['@$', '^^', '~@', '%?', '*~', '!!', '#&'];
        let result = input;
        for (const pattern of patterns) {
          const regex = new RegExp(pattern.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1'), 'g');
          result = result.replace(regex, '_');
        }
        return result;
      }

      function removeUnderscores(input: string): string {
        return input.replace(/_/g, '');
      }

      function charShift(input: string, shift: number): string {
        return [...input].map(c => String.fromCharCode(c.charCodeAt(0) - shift)).join('');
      }

      function reverse(input: string): string {
        return input.split('').reverse().join('');
      }

      function base64Decode(input: string): string {
        try {
          return Buffer.from(input, 'base64').toString('utf-8');
        } catch (e) {
          console.error('Base64 decode failed:', e);
          return '';
        }
      }

      const res = await this.client.get(videoUrl.href);
      const $ = load(res.data);
      const scriptContent = $('script').html();
      const pageUrl = scriptContent
        ? scriptContent.match(/window\.location\.href\s*=\s*'(https:\/\/[^']+)';/)?.[1] ?? ''
        : '';

      const { data } = await this.client.get(pageUrl);
      const $$ = load(data);
      const encodedString = $$('script[type="application/json"]').html()?.trim() || '';
      const jsonData = decryptF7(encodedString);

      let url = jsonData.source;
      let siteName = jsonData.site_name;
      let subtitles = jsonData.captions.map((sub: { file: string; label: string }) => ({
        lang: sub.label,
        url: `https://${siteName}${sub.file}`,
      })) as ISubtitle[];

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
      throw new Error((err as Error).message);
    }
  };
}

export default Voe;
