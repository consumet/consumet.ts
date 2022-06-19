export const getSize = (s: string) => {
  let result = '';
  for (let i = 0; i < s.length; i < s.length) {
    if (result != '' || s[i] == ',') {
      i += 2;
      result += s[i];
    }
  }
  return result;
};

export const splitStar = (s: string) => {
  let rating = '';
  let quality = '';
  let switcher = false;
  for (let i = 0; i < s.length; i++) {
    if (s[i] == '/') {
      switcher = true;
      break;
    }
    if (!switcher) {
      rating += s[i];
    } else {
      quality += s[i];
    }
  }
  return { rating, quality };
};
