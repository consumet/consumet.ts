import { COMICS } from '..';

const main = async () => {
  const getComics = new COMICS.GetComics();

  const { containers } = await getComics.search('Batman');

  for (let v of containers) {
    console.log(v.title);
  }
};

main();
