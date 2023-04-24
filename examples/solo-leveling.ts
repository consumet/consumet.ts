import { MANGA } from '..';

const main = async () => {
  const getManga = new MANGA.AsuraScans();

  const resultsSearch = await getManga.search('hero returns');
  console.log(resultsSearch)

  const results = await getManga.fetchMangaInfo('1948049029-the-hero-returns');
  console.log(results)
};

main();
