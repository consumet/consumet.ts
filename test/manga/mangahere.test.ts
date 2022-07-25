import { MANGA } from '../../src/providers';

jest.setTimeout(120000);

test('returns a filled array of manga', async () => {
  const mangahere = new MANGA.MangaHere();
  const data = await mangahere.search('slime');
  expect(data.results).not.toEqual([]);
});

// test('returns a filled array of manga', async () => {
//   const mangahere = new MANGA.MangaHere();
//   const data = await mangahere.fetchChapterPages('bleach/c679');
//   expect(data).not.toEqual([]);
// });
