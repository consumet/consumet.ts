import { MANGA } from '../../src/providers';

jest.setTimeout(120000);

test('returns a filled array of manga', async () => {
  const mangakakalot = new MANGA.MangaKakalot();
  const data = await mangakakalot.search('Tomodachi Game');
  expect(data.results).not.toEqual([]);
});

// test('returns a filled array of manga', async () => {
//   const mangakakalot = new MANGA.MangaKakalot();
//   const data = await mangakakalot.fetchChapterPages('manga-kr954974');
//   expect(data).not.toEqual([]);
// });
