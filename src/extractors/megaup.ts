//extractor for https://animekai.to

// The code for this is now fetched from outside consumet:
// https://raw.githubusercontent.com/amarullz/kaicodex/refs/heads/main/generated/kai_codex.js
// as this repository auto-updates the extraction keys when they change.
// If something breaks in the future, blame this part.

import { ISource, IVideo, VideoExtractor } from '../models';
import { AxiosAdapter } from 'axios';
import { ProxyConfig } from '../models/types';

interface KaiCodex {
  rc4: (key: string, str: string) => string;
  safeBtoa: (s: string) => string;
  safeAtob: (s: string) => string;
  reverseString: (s: string) => string;
  replaceChars: (s: string, f: string, r: string) => string;
  enc: (n: string) => string;
  dec: (n: string) => string;
  decMega: (n: string) => string;
}

export class MegaUp extends VideoExtractor {
  protected serverName: string = 'MegaUp';
  protected sources: IVideo[] = [];
  private KAICODEX!: KaiCodex;
  private kaicodexReady: Promise<void>;

  constructor(protected proxyConfig?: ProxyConfig, protected adapter?: AxiosAdapter) {
    super(proxyConfig, adapter);
    this.kaicodexReady = this.loadKAICODEX();
  }

  private async loadKAICODEX(): Promise<void> {
    const extraction_code =
      'https://raw.githubusercontent.com/amarullz/kaicodex/refs/heads/main/generated/kai_codex.js';

    const response = await fetch(extraction_code);
    const originalCode = await response.text();

    const wrappedCode = `
      ${originalCode}
      return KAICODEX;
    `;

    const fn = new Function(wrappedCode);
    this.KAICODEX = fn();
  }

  GenerateToken = (n: string) => {
    return this.KAICODEX.enc(n);
  };

  DecodeIframeData = (n: string) => {
    return this.KAICODEX.dec(n);
  };

  Decode = (n: string) => {
    return this.KAICODEX.decMega(n);
  };

  override extract = async (videoUrl: URL): Promise<ISource> => {
    try {
      await this.kaicodexReady;

      const url = videoUrl.href.replace(/\/(e|e2)\//, '/media/');
      const res = await this.client.get(url);

      const decrypted = JSON.parse(this.KAICODEX.decMega(res.data.result).replace(/\\/g, ''));
      const data: ISource = {
        sources: decrypted.sources.map((s: { file: string }) => ({
          url: s.file,
          isM3U8: s.file.includes('.m3u8') || s.file.endsWith('m3u8'),
        })),
        subtitles: decrypted.tracks.map((t: { kind: any; file: any }) => ({
          kind: t.kind,
          url: t.file,
        })),
        download: decrypted.download,
      };
      return data;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  };
}
