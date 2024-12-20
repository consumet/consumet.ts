// Extractor from: https://github.com/ghoshRitesh12/aniwatch/blob/main/src/extractors/megacloud.ts

import { ISource, IVideo, VideoExtractor } from '../../models';
import { getSources } from './megacloud.getsrcs';

const megacloud = {
  script: 'https://megacloud.tv/js/player/a/prod/e1-player.min.js?v=',
  sources: 'https://megacloud.tv/embed-2/ajax/e-1/getSources?id=',
} as const;

export type track = {
  file: string;
  kind: string;
  label?: string;
  default?: boolean;
};

type intro_outro = {
  start: number;
  end: number;
};

export type unencryptedSource = {
  file: string;
  type: string;
};

export type extractedSources = {
  sources: string | unencryptedSource[];
  tracks: track[];
  encrypted: boolean;
  intro: intro_outro;
  outro: intro_outro;
  server: number;
};

type ExtractedData = Pick<extractedSources, 'intro' | 'outro' | 'tracks'> & {
  sources: { url: string; type: string }[];
};

class MegaCloud extends VideoExtractor {
  protected override serverName = 'MegaCloud';
  protected override sources: IVideo[] = [];

  async extract(embedIframeURL: URL) {
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

      const xrax = embedIframeURL.pathname.split('/').pop() || '';

      const resp = await getSources(xrax);
      if (!resp) return extractedData;

      if (Array.isArray(resp.sources)) {
        extractedData.sources = resp.sources.map(s => ({
          url: s.file,
          isM3U8: s.type === 'hls',
          type: s.type,
        }));
      }

      extractedData.intro = resp.intro ? resp.intro : extractedData.intro;
      extractedData.outro = resp.outro ? resp.outro : extractedData.outro;

      extractedData.subtitles = resp.tracks.map(track => ({
        url: track.file,
        lang: track.label ? track.label : track.kind,
      }));

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

  // extractVariables(text: string) {
  //   // copied from github issue #30 'https://github.com/ghoshRitesh12/aniwatch-api/issues/30'
  //   const regex = /case\s*0x[0-9a-f]+:(?![^;]*=partKey)\s*\w+\s*=\s*(\w+)\s*,\s*\w+\s*=\s*(\w+);/g;
  //   const matches = text.matchAll(regex);
  //   const vars = Array.from(matches, match => {
  //     const matchKey1 = this.matchingKey(match[1], text);
  //     const matchKey2 = this.matchingKey(match[2], text);
  //     try {
  //       return [parseInt(matchKey1, 16), parseInt(matchKey2, 16)];
  //     } catch (e) {
  //       return [];
  //     }
  //   }).filter(pair => pair.length > 0);

  //   return vars;
  // }

  // getSecret(encryptedString: string, values: number[][]) {
  //   let secret = '',
  //     encryptedSource = '',
  //     encryptedSourceArray = encryptedString.split(''),
  //     currentIndex = 0;

  //   for (const index of values) {
  //     const start = index[0] + currentIndex;
  //     const end = start + index[1];

  //     for (let i = start; i < end; i++) {
  //       secret += encryptedString[i];
  //       encryptedSourceArray[i] = '';
  //     }
  //     currentIndex += index[1];
  //   }

  //   encryptedSource = encryptedSourceArray.join('');

  //   return { secret, encryptedSource };
  // }

  // decrypt(encrypted: string, keyOrSecret: string, maybe_iv?: string) {
  //   let key;
  //   let iv;
  //   let contents;
  //   if (maybe_iv) {
  //     key = keyOrSecret;
  //     iv = maybe_iv;
  //     contents = encrypted;
  //   } else {
  //     // copied from 'https://github.com/brix/crypto-js/issues/468'
  //     const cypher = Buffer.from(encrypted, 'base64');
  //     const salt = cypher.subarray(8, 16);
  //     const password = Buffer.concat([Buffer.from(keyOrSecret, 'binary'), salt]);
  //     const md5Hashes = [];
  //     let digest = password;
  //     for (let i = 0; i < 3; i++) {
  //       md5Hashes[i] = crypto.createHash('md5').update(digest).digest();
  //       digest = Buffer.concat([md5Hashes[i], password]);
  //     }
  //     key = Buffer.concat([md5Hashes[0], md5Hashes[1]]);
  //     iv = md5Hashes[2];
  //     contents = cypher.subarray(16);
  //   }

  //   const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  //   const decrypted =
  //     decipher.update(contents as any, typeof contents === 'string' ? 'base64' : undefined, 'utf8') +
  //     decipher.final();

  //   return decrypted;
  // }

  // // function copied from github issue #30 'https://github.com/ghoshRitesh12/aniwatch-api/issues/30'
  // matchingKey(value: string, script: string) {
  //   const regex = new RegExp(`,${value}=((?:0x)?([0-9a-fA-F]+))`);
  //   const match = script.match(regex);
  //   if (match) {
  //     return match[1].replace(/^0x/, '');
  //   } else {
  //     throw new Error('Failed to match the key');
  //   }
  // }
}

export default MegaCloud;
