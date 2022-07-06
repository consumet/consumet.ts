export const countDivs = (s: string) => {
  let counter = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] == '<' && s[i + 1] == 'd' && s[i + 2] == 'i' && s[i + 3] == 'v') counter++;
  }
  return counter;
};
