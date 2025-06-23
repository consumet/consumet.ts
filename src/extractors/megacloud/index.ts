import CryptoJS from 'crypto-js';
import { ISource, IVideo, VideoExtractor } from '../../models';
import { getSources } from './megacloud.getsrcs';

class MegaCloud extends VideoExtractor {
  protected override serverName = 'MegaCloud';
  protected override sources: IVideo[] = [];
  private aesKey: string | null = null;

  private async getAESKey(): Promise<string> {
    if (this.aesKey) {
      return this.aesKey;
    }

    try {
      const response = await fetch('https://api.lunaranime.ru/static/key.txt');
      if (!response.ok) {
        throw new Error(`Failed to fetch AES key: ${response.status}`);
      }
      this.aesKey = await response.text();
      return this.aesKey.trim();
    } catch (error) {
      throw new Error(`Error fetching AES key: ${error}`);
    }
  }

  private decryptSource(encryptedUrl: string, key: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedUrl, key);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error(`Failed to decrypt source URL: ${error}`);
    }
  }

  async extract(embedIframeURL: URL, referer: string = 'https://hianime.to') {
    try {
      const extractedData: ISource = {
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

      const resp = await getSources(embedIframeURL.href, referer);

      if (!resp) return extractedData;

      if (Array.isArray(resp.sources)) {
        const aesKey = await this.getAESKey();

        extractedData.sources = resp.sources.map((s: { file: any; type: string }) => {
          let url = s.file;
          
          try {
            url = this.decryptSource(s.file, aesKey);
          } catch (decryptError) {
            console.warn('Failed to decrypt source URL, using original:', decryptError);
            url = s.file;
          }

          return {
            url: url,
            isM3U8: s.type === 'hls',
            type: s.type,
          };
        });
      }

      extractedData.intro = resp.intro ? resp.intro : extractedData.intro;
      extractedData.outro = resp.outro ? resp.outro : extractedData.outro;

      if (resp.tracks) {
        extractedData.subtitles = resp.tracks.map((track: { file: any; label: any; kind: any }) => ({
          url: track.file,
          lang: track.label ? track.label : track.kind,
        }));
      }

      return {
        intro: extractedData.intro,
        outro: extractedData.outro,
        sources: extractedData.sources,
        subtitles: extractedData.subtitles,
      } satisfies ISource;
    } catch (err) {
      throw err;
    }
  }
}

export default MegaCloud;
