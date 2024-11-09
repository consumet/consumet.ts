import { CheerioAPI, load } from 'cheerio';
import CryptoJS from 'crypto-js';

import { VideoExtractor, IVideo, ISubtitle } from '../models';

class AsianLoad extends VideoExtractor {
  protected override serverName = 'asianload';
  protected override sources: IVideo[] = [];

  private readonly keys = {
    key: CryptoJS.enc.Utf8.parse('93422192433952489752342908585752'),
    iv: CryptoJS.enc.Utf8.parse('9262859232435825'),
  };

  override extract = async (videoUrl: URL): Promise<{ sources: IVideo[] } & { subtitles: ISubtitle[] }> => {
    try {
  override extract = async (videoUrl: URL): Promise<{ sources: IVideo[] } & { subtitles: ISubtitle[] }> => {
      const res = await this.client.get(videoUrl.href);
      const $ = load(res.data);
    const res = await this.client.get(videoUrl.href);
    const $ = load(res.data);

      const id = videoUrl.href.split('/').pop()?.split('?')[0];
      const encryptedParams = await this.generateEncryptedAjaxParams($, id ?? '');
    const encyptedParams = await this.generateEncryptedAjaxParams($, videoUrl.searchParams.get('id') ?? '');

      const encryptedData = await this.client.get(
        `${videoUrl.protocol}//${videoUrl.hostname}/encrypt-ajax.php?${encryptedParams}`,
        {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        }
      );
    const encryptedData = await this.client.get(
      `${videoUrl.protocol}//${videoUrl.hostname}/encrypt-ajax.php?${encyptedParams}`,
      {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }
    );

      const decryptedData = await this.decryptAjaxData(encryptedData.data.data);
    const decryptedData = await this.decryptAjaxData(encryptedData.data.data);

      if (!decryptedData.source) throw new Error('No source found. Try a different server.');
    if (!decryptedData.source) throw new Error('No source found. Try a different server.');

      this.sources = decryptedData.source.map((source: any) => ({
        url: source.file,
        isM3U8: source.file.includes('.m3u8'),
      }));
    decryptedData.source.forEach((source: any) => {
      this.sources.push({
        url: source.file,
        isM3U8: source.file.includes('.m3u8'),
      });
    });

      if (decryptedData.source_bk) {
        this.sources.push(
          ...decryptedData.source_bk.map((source: any) => ({
            url: source.file,
            isM3U8: source.file.includes('.m3u8'),
          }))
        );
      }
    decryptedData.source_bk.forEach((source: any) => {
      this.sources.push({
        url: source.file,
        isM3U8: source.file.includes('.m3u8'),
      });
    });

      const subtitles = decryptedData.track?.tracks?.map(
        (track: any): ISubtitle => ({
          url: track.file,
          lang: track.kind === 'thumbnails' ? 'Default (maybe)' : track.kind,
        })
      ) ?? [];
    const subtitles = decryptedData.track?.tracks?.map(
      (track: any): ISubtitle => ({
        url: track.file,
        lang: track.kind === 'thumbnails' ? 'Default (maybe)' : track.kind,
      })
    );

      return {
        sources: this.sources,
        subtitles: subtitles,
      };
    } catch (error) {
      throw new Error(`Failed to extract source from Asianload: ${(error as Error).message}`);
    }
  };
    return {
      sources: this.sources,
      subtitles: subtitles,
    };
  };
  private generateEncryptedAjaxParams = async ($: CheerioAPI, id: string): Promise<string> => {
    const encryptedKey = CryptoJS.AES.encrypt(id, this.keys.key, {
      iv: this.keys.iv,
    }).toString();

    const scriptValue = $('script[data-name="crypto"]').attr('data-value') as string;

    const decryptedToken = CryptoJS.AES.decrypt(scriptValue, this.keys.key, {
      iv: this.keys.iv,
    }).toString(CryptoJS.enc.Utf8);

    return `id=${encryptedKey}&alias=${decryptedToken}`;
  };
  private generateEncryptedAjaxParams = async ($: CheerioAPI, id: string): Promise<string> => {
    const encryptedKey = CryptoJS.AES.encrypt(id, this.keys.key, {
      iv: this.keys.iv,
    }).toString();

    const scriptValue = $("script[data-name='crypto']").data().value as string;

    const decryptedToken = CryptoJS.AES.decrypt(scriptValue, this.keys.key, {
      iv: this.keys.iv,
    }).toString(CryptoJS.enc.Utf8);

    return `id=${encryptedKey}&alias=${decryptedToken}`;
  };

  private decryptAjaxData = async (encryptedData: string): Promise<any> => {
    const decryptedData = CryptoJS.enc.Utf8.stringify(
      CryptoJS.AES.decrypt(encryptedData, this.keys.key, {
        iv: this.keys.iv,
      })
    );

    return JSON.parse(decryptedData);
  };
  private decryptAjaxData = async (encryptedData: string): Promise<any> => {
    const decryptedData = CryptoJS.enc.Utf8.stringify(
      CryptoJS.AES.decrypt(encryptedData, this.keys.key, {
        iv: this.keys.iv,
      })
    );

    return JSON.parse(decryptedData);
  };
}

export default AsianLoad;
