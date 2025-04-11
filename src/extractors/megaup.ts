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

  /* Old decrypting functions in case the new ones break

  #reverseIt = (n: string) => {
    return n.split('').reverse().join('');
  };
  #base64UrlEncode = (str: string) => {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  #substitute = (input: string, keys: string, values: string) => {
    const map = Object.fromEntries(keys.split('').map((key, i) => [key, values[i] || '']));
    const a = input
      .split('')
      .map(char => map[char] || char)
      .join('');
    return a;
  };
  #transform = (n: string, t: string) => {
    const v = Array.from({ length: 256 }, (_, i) => i);
    let c = 0,
      f = '';

    for (let w = 0; w < 256; w++) {
      c = (c + v[w] + n.charCodeAt(w % n.length)) % 256;
      [v[w], v[c]] = [v[c], v[w]];
    }
    for (let a = (c = 0), w = 0; a < t.length; a++) {
      w = (w + 1) % 256;
      c = (c + v[w]) % 256;
      [v[w], v[c]] = [v[c], v[w]];
      f += String.fromCharCode(t.charCodeAt(a) ^ v[(v[w] + v[c]) % 256]);
    }

    return f;
  };
  #base64UrlDecode = (n: string) => {
    n = n
      .padEnd(n.length + ((4 - (n.length % 4)) % 4), '=')
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    return atob(n);
  };
  
  */

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
