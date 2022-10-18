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

export const capitalizeFirstLetter = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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
