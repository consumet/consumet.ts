import { load } from 'cheerio';

export const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36';
export const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const splitAuthor = (authors: string) => {
  const res: string[] = [];
  let eater = '';
  for (let i = 0; i < authors.length; i++) {
    if (authors[i] == ' ' && (authors[i - 1] == ',' || authors[i - 1] == ';')) {
      continue;
    }
    if (authors[i] == ',' || authors[i] == ';') {
      res.push(eater.trim());
      eater = '';
      continue;
    }
    eater += authors[i];
  }
  res.push(eater);
  return res;
};

export const floorID = (id: string) => {
  let imp = '';
  for (let i = 0; i < id?.length - 3; i++) {
    imp += id[i];
  }
  const idV = parseInt(imp);
  return idV * 1000;
};

export const formatTitle = (title: string) => {
  const result = title.replace(/[0-9]/g, '');
  return result.trim();
};

export const genElement = (s: string, e: string) => {
  if (s == '') return;
  const $ = load(e);
  let i = 0;
  let str = '';
  let el = $();
  for (; i < s.length; i++) {
    if (s[i] == ' ') {
      el = $(str);
      str = '';
      i++;
      break;
    }
    str += s[i];
  }
  for (; i < s.length; i++) {
    if (s[i] == ' ') {
      el = $(el).children(str);
      str = '';
      continue;
    }
    str += s[i];
  }
  el = $(el).children(str);
  return el;
};

export const range = ({ from = 0, to = 0, step = 1, length = Math.ceil((to - from) / step) }) =>
  Array.from({ length }, (_, i) => from + i * step);

export const capitalizeFirstLetter = (s: string) => s?.charAt(0).toUpperCase() + s.slice(1);

export const getDays = (day1: string, day2: string) => {
  const day1Index = days.indexOf(capitalizeFirstLetter(day1)) - 1;
  const day2Index = days.indexOf(capitalizeFirstLetter(day2)) - 1;
  const now = new Date();
  const day1Date = new Date();
  const day2Date = new Date();
  day1Date.setDate(now.getDate() + ((day1Index + 7 - now.getDay()) % 7));
  day2Date.setDate(now.getDate() + ((day2Index + 7 - now.getDay()) % 7));
  day1Date.setHours(0, 0, 0, 0);
  day2Date.setHours(0, 0, 0, 0);
  return [day1Date.getTime() / 1000, day2Date.getTime() / 1000];
};

export const isJson = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

export function convertDuration(milliseconds: number) {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  seconds = seconds % 60;
  minutes = minutes % 60;

  return `PT${hours}H${minutes}M${seconds}S`;
}

export const compareTwoStrings = (first: string, second: string): number => {
  first = first.replace(/\s+/g, '');
  second = second.replace(/\s+/g, '');

  if (first === second) return 1; // identical or empty
  if (first.length < 2 || second.length < 2) return 0; // if either is a 0-letter or 1-letter string

  const firstBigrams = new Map();
  for (let i = 0; i < first.length - 1; i++) {
    const bigram = first.substring(i, i + 2);
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1;

    firstBigrams.set(bigram, count);
  }

  let intersectionSize = 0;
  for (let i = 0; i < second.length - 1; i++) {
    const bigram = second.substring(i, i + 2);
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;

    if (count > 0) {
      firstBigrams.set(bigram, count - 1);
      intersectionSize++;
    }
  }

  return (2.0 * intersectionSize) / (first.length + second.length - 2);
};

export const substringAfter = (str: string, toFind: string) => {
  const index = str.indexOf(toFind);
  return index == -1 ? '' : str.substring(index + toFind.length);
};

export const substringBefore = (str: string, toFind: string) => {
  const index = str.indexOf(toFind);
  return index == -1 ? '' : str.substring(0, index);
};

export const substringAfterLast = (str: string, toFind: string) => {
  const index = str.lastIndexOf(toFind);
  return index == -1 ? '' : str.substring(index + toFind.length);
};

export const substringBeforeLast = (str: string, toFind: string) => {
  const index = str.lastIndexOf(toFind);
  return index == -1 ? '' : str.substring(0, index);
};

export const getHashFromImage = (url: string) => {
  if (url?.length === 0) {
    return '';
  } else {
    let hash!: string;
    return 'hash';
  }
};

export const safeUnpack = (packedSource: string): string => {
  try {
    // 1. Extract arguments using Regex
    // Matches: }('...', radix, count, 'keywords'
    const argsRegex = /}\s*\(\s*'((?:[^'\\]|\\.)*)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'((?:[^'\\]|\\.)*)'\./;
    const match = argsRegex.exec(packedSource);

    if (!match) throw new Error('Invalid Packer format or unable to parse safely.');

    let [_, p, aStr, cStr, kStr] = match;
    const a = parseInt(aStr); // Radix
    const c = parseInt(cStr); // Count
    let k = kStr.split('|'); // Keywords

    // 2. Base62 Helper (The 'e' function in packer)
    const base62 = (n: number): string => {
      const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return n < a ? chars[n] : base62(Math.floor(n / a)) + chars[n % a];
    };

    // 3. Dictionary Fill (Logic: if k[i] is empty, it maps to base62(i))
    // However, standard packer usually provides full dictionary or handles empty slots dynamically.
    // Simple optimization: standard packer replaces based on index.

    const dict: Record<string, string> = {};
    for (let i = 0; i < c; i++) {
      const key = base62(i);
      const word = k[i] || key; // Fallback if empty
      dict[key] = word;
    }

    // 4. Substitution
    // Regex: /\b\w+\b/g but compliant with packer generated tokens
    return p.replace(/\b\w+\b/g, word => {
      return dict[word] || word;
    });
  } catch (err) {
    throw new Error(`Failed to unpack script: ${err}`);
  }
};

export const parsePostInfo = (post: string) => {
  let year = '';
  let size = '';
  let description = '';
  let sizeDone = false;
  for (let i = 0; i < post.length; i++) {
    if (
      i + 5 < post.length &&
      post[i] == 'Y' &&
      post[i + 1] == 'e' &&
      post[i + 2] == 'a' &&
      post[i + 3] == 'r' &&
      post[i + 4] == ' ' &&
      post[i + 5] == ':'
    ) {
      year = post[i + 7] + post[i + 8] + post[i + 9] + post[i + 10];
      i += 9;
    } else if (
      i + 5 < post.length &&
      post[i] == 'S' &&
      post[i + 1] == 'i' &&
      post[i + 2] == 'z' &&
      post[i + 3] == 'e' &&
      post[i + 4] == ' ' &&
      post[i + 5] == ':'
    ) {
      let j = i + 7;
      const temp = j;
      for (; j < temp + 4; j++) {
        if (!isNaN(Number(post[j]))) {
          size += post[j];
        } else {
          break;
        }
      }
      size += post[j] + post[j + 1];
      i += j - i;
      i += 2;
      sizeDone = true;
    }
    if (sizeDone) {
      description += post[i];
    }
  }
  description = description.substring(0, description.length - 12);
  return { year, size, description };
};
