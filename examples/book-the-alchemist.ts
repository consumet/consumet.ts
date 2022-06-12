import { BOOKS } from '../src';

const main = async () => {
  const libgen = new BOOKS.Libgen();

  const res = await libgen.search('The Alchemist', 30);

  for (let val of res) {
    console.log(val.title);
  }
};
