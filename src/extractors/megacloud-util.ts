import axios from 'axios';
import crypto from 'crypto';
import { IVideo, ISubtitle, Intro } from '../models';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

interface GetSourcesResponse {
  sources: string | { file: string; type: string }[];
  tracks: { file: string; label?: string; kind?: string; default?: boolean }[];
  encrypted: boolean;
  intro: { start: number; end: number };
  outro: { start: number; end: number };
  server: number;
}

export interface MegaCloudResult {
  sources: IVideo[];
  subtitles: ISubtitle[];
  intro?: Intro;
  outro?: Intro;
}

/**
 * Extract client key from embed page HTML.
 * The key can be embedded in several obfuscation forms.
 */
function extractClientKey(html: string): string {
  const patterns: { regex: RegExp; extract: (m: RegExpMatchArray) => string }[] = [
    {
      regex: /<meta name="_gg_fb" content="([a-zA-Z0-9]+)">/,
      extract: m => m[1],
    },
    {
      regex: /<!--\s+_is_th:([0-9a-zA-Z]+)\s+-->/,
      extract: m => m[1],
    },
    {
      regex:
        /<script>window\._lk_db\s+=\s+\{x:\s*["']([a-zA-Z0-9]+)["'],\s*y:\s*["']([a-zA-Z0-9]+)["'],\s*z:\s*["']([a-zA-Z0-9]+)["']\};<\/script>/,
      extract: m => m[1] + m[2] + m[3],
    },
    {
      regex: /<div\s+data-dpi="([0-9a-zA-Z]+)"/,
      extract: m => m[1],
    },
    {
      regex: /<script nonce="([0-9a-zA-Z]+)">/,
      extract: m => m[1],
    },
    {
      regex: /<script>window\._xy_ws\s*=\s*['"`]([0-9a-zA-Z]+)['"`];<\/script>/,
      extract: m => m[1],
    },
  ];

  for (const { regex, extract } of patterns) {
    const match = html.match(regex);
    if (match) {
      return extract(match);
    }
  }

  throw new Error('Failed to extract client key from embed page');
}

// ---- AES decryption (older encrypted responses) ----

function extractVariables(text: string): number[][] {
  const regex = /case\s*0x[0-9a-f]+:(?![^;]*=partKey)\s*\w+\s*=\s*(\w+)\s*,\s*\w+\s*=\s*(\w+);/g;
  const matches = text.matchAll(regex);

  return Array.from(matches, match => {
    const key1 = matchingKey(match[1], text);
    const key2 = matchingKey(match[2], text);
    try {
      return [parseInt(key1, 16), parseInt(key2, 16)];
    } catch {
      return [];
    }
  }).filter(pair => pair.length > 0);
}

function matchingKey(value: string, script: string): string {
  const regex = new RegExp(`,${value}=((?:0x)?([0-9a-fA-F]+))`);
  const match = script.match(regex);
  if (match) {
    return match[1].replace(/^0x/, '');
  }
  throw new Error('Failed to match the key');
}

function getSecret(encryptedString: string, values: number[][]): { secret: string; encryptedSource: string } {
  let secret = '';
  const encryptedSourceArray = encryptedString.split('');
  let currentIndex = 0;

  for (const index of values) {
    const start = index[0] + currentIndex;
    const end = start + index[1];

    for (let i = start; i < end; i++) {
      secret += encryptedString[i];
      encryptedSourceArray[i] = '';
    }
    currentIndex += index[1];
  }

  return { secret, encryptedSource: encryptedSourceArray.join('') };
}

function decryptAES(encrypted: string, keyOrSecret: string): string {
  const cypher = Buffer.from(encrypted, 'base64');
  const salt = cypher.subarray(8, 16);
  const password = Buffer.concat([Buffer.from(keyOrSecret, 'binary'), salt]);
  const md5Hashes: Buffer[] = [];
  let digest = password;
  for (let i = 0; i < 3; i++) {
    md5Hashes[i] = crypto.createHash('md5').update(digest).digest();
    digest = Buffer.concat([md5Hashes[i], password]);
  }
  const key = Buffer.concat([md5Hashes[0], md5Hashes[1]]);
  const iv = md5Hashes[2];
  const contents = cypher.subarray(16);

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  return decipher.update(contents as any, undefined, 'utf8') + decipher.final('utf8');
}

// ---- v3 custom cipher decryption ----

function keygen2(megacloudKey: string, clientKey: string): string {
  const keygenHashMultVal = 31n;
  const keygenXORVal = 247;
  const keygenShiftVal = 5;

  let tempKey = megacloudKey + clientKey;

  let hashVal = 0n;
  for (let i = 0; i < tempKey.length; i++) {
    hashVal = BigInt(tempKey.charCodeAt(i)) + hashVal * keygenHashMultVal + (hashVal << 7n) - hashVal;
  }
  hashVal = hashVal < 0n ? -hashVal : hashVal;
  const lHash = Number(hashVal % 0x7fffffffffffffffn);

  tempKey = tempKey
    .split('')
    .map(c => String.fromCharCode(c.charCodeAt(0) ^ keygenXORVal))
    .join('');

  const pivot = (lHash % tempKey.length) + keygenShiftVal;
  tempKey = tempKey.slice(pivot) + tempKey.slice(0, pivot);

  const leafStr = clientKey.split('').reverse().join('');
  let returnKey = '';
  for (let i = 0; i < Math.max(tempKey.length, leafStr.length); i++) {
    returnKey += (tempKey[i] || '') + (leafStr[i] || '');
  }

  returnKey = returnKey.substring(0, 96 + (lHash % 33));
  returnKey = [...returnKey].map(c => String.fromCharCode((c.charCodeAt(0) % 95) + 32)).join('');

  return returnKey;
}

function seedShuffle2(charArray: string[], iKey: string): string[] {
  let hashVal = 0n;
  for (let i = 0; i < iKey.length; i++) {
    hashVal = (hashVal * 31n + BigInt(iKey.charCodeAt(i))) & 0xffffffffn;
  }

  let shuffleNum = hashVal;
  const psudoRand = (arg: number) => {
    shuffleNum = (shuffleNum * 1103515245n + 12345n) & 0x7fffffffn;
    return Number(shuffleNum % BigInt(arg));
  };

  const retStr = [...charArray];
  for (let i = retStr.length - 1; i > 0; i--) {
    const swapIndex = psudoRand(i + 1);
    [retStr[i], retStr[swapIndex]] = [retStr[swapIndex], retStr[i]];
  }
  return retStr;
}

function columnarCipher2(src: string, ikey: string): string {
  const columnCount = ikey.length;
  const rowCount = Math.ceil(src.length / columnCount);

  const cipherArray = Array(rowCount)
    .fill(null)
    .map(() => Array(columnCount).fill(' '));

  const keyMap = ikey.split('').map((char, index) => ({ char, idx: index }));
  const sortedMap = [...keyMap].sort((a, b) => a.char.charCodeAt(0) - b.char.charCodeAt(0));

  let srcIndex = 0;
  sortedMap.forEach(({ idx }) => {
    for (let i = 0; i < rowCount; i++) {
      cipherArray[i][idx] = src[srcIndex++];
    }
  });

  let returnStr = '';
  for (let x = 0; x < rowCount; x++) {
    for (let y = 0; y < columnCount; y++) {
      returnStr += cipherArray[x][y];
    }
  }
  return returnStr;
}

function decryptSrc2(src: string, clientKey: string, megacloudKey: string): string {
  const layers = 3;
  const genKey = keygen2(megacloudKey, clientKey);
  let decSrc = Buffer.from(src, 'base64').toString('binary');
  const charArray = [...Array(95)].map((_val, index) => String.fromCharCode(32 + index));

  const reverseLayer = (iteration: number) => {
    const layerKey = genKey + iteration;

    let hashVal = 0n;
    for (let i = 0; i < layerKey.length; i++) {
      hashVal = (hashVal * 31n + BigInt(layerKey.charCodeAt(i))) & 0xffffffffn;
    }
    let seed = hashVal;

    const seedRand = (arg: number) => {
      seed = (seed * 1103515245n + 12345n) & 0x7fffffffn;
      return Number(seed % BigInt(arg));
    };

    decSrc = decSrc
      .split('')
      .map(char => {
        const cArryIndex = charArray.indexOf(char);
        if (cArryIndex === -1) return char;
        const randNum = seedRand(95);
        const newCharIndex = (cArryIndex - randNum + 95) % 95;
        return charArray[newCharIndex];
      })
      .join('');

    decSrc = columnarCipher2(decSrc, layerKey);

    const subValues = seedShuffle2(charArray, layerKey);
    const charMap: Record<string, string> = {};
    subValues.forEach((char, index) => {
      charMap[char] = charArray[index];
    });
    decSrc = decSrc
      .split('')
      .map(char => charMap[char] || char)
      .join('');
  };

  for (let i = layers; i > 0; i--) {
    reverseLayer(i);
  }

  const dataLen = parseInt(decSrc.substring(0, 4), 10);
  return decSrc.substring(4, 4 + dataLen);
}

/**
 * Main extraction function for Megacloud-based players (VideoStr, MegaCloud, VidCloud/UpCloud).
 *
 * @param videoUrl - The embed page URL (e.g. https://videostr.net/embed-1/v3/e-1/XRAX?z=)
 * @param referer - Optional referer header
 */
export async function extractMegaCloudSources(videoUrl: URL, referer?: string): Promise<MegaCloudResult> {
  const host = videoUrl.hostname;
  const pathname = videoUrl.pathname;

  const videoId = pathname.split('/').pop()?.split('?')[0];
  if (!videoId) {
    throw new Error('Could not extract video ID from URL');
  }

  const pathParts = pathname.split('/');
  const basePath = pathParts.slice(0, pathParts.length - 1).join('/');

  // Step 1: Fetch embed page to get client key
  const embedPageUrl = videoUrl.href;
  const { data: embedHtml } = await axios.get(embedPageUrl, {
    headers: {
      'User-Agent': USER_AGENT,
      Referer: referer || `https://${host}/`,
    },
  });

  const clientKey = extractClientKey(embedHtml);

  // Step 2: Call getSources API
  const getSourcesUrl = `https://${host}${basePath}/getSources?id=${videoId}&_k=${clientKey}`;
  const { data: srcsData } = await axios.get<GetSourcesResponse>(getSourcesUrl, {
    headers: {
      Accept: '*/*',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': USER_AGENT,
      Referer: embedPageUrl,
    },
  });

  if (!srcsData) {
    throw new Error('No data returned from getSources');
  }

  const result: MegaCloudResult = {
    sources: [],
    subtitles: [],
    intro: srcsData.intro?.end > 0 ? srcsData.intro : undefined,
    outro: srcsData.outro?.end > 0 ? srcsData.outro : undefined,
  };

  // Step 3: Parse subtitles
  result.subtitles =
    srcsData.tracks
      ?.filter(t => t.kind === 'captions')
      ?.map(t => ({
        url: t.file,
        lang: t.label ?? 'Unknown',
      })) ?? [];

  // Step 4: Handle sources (encrypted or unencrypted)
  if (!srcsData.encrypted && Array.isArray(srcsData.sources)) {
    result.sources = srcsData.sources.map(s => ({
      url: s.file,
      quality: 'auto',
      isM3U8: s.file.includes('.m3u8'),
    }));
    return result;
  }

  // Encrypted — try AES decryption first
  const encryptedString = srcsData.sources as string;

  try {
    const scriptUrl = `https://${host}/js/player/a/prod/e1-player.min.js?v=${Date.now()}`;
    const { data: scriptText } = await axios.get(scriptUrl, {
      headers: { 'User-Agent': USER_AGENT },
    });

    if (scriptText) {
      const vars = extractVariables(scriptText);
      if (vars.length) {
        const { secret, encryptedSource } = getSecret(encryptedString, vars);
        const decrypted = decryptAES(encryptedSource, secret);
        const sources = JSON.parse(decrypted);
        result.sources = sources.map((s: any) => ({
          url: s.file,
          quality: 'auto',
          isM3U8: s.file?.includes('.m3u8') ?? true,
        }));
        return result;
      }
    }
  } catch {
    // AES failed, try v3 custom cipher
  }

  // Try v3 custom cipher decryption
  try {
    const decrypted = decryptSrc2(encryptedString, clientKey, '');
    const sources = JSON.parse(decrypted);
    result.sources = sources.map((s: any) => ({
      url: s.file,
      quality: 'auto',
      isM3U8: s.file?.includes('.m3u8') ?? true,
    }));
    return result;
  } catch {
    throw new Error('Failed to decrypt video sources');
  }
}
