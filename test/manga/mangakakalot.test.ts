import { MANGA } from '../../src/providers';

jest.setTimeout(120000);

test('returns a filled array of manga', async () => {
  const mangahere = new MANGA.MangaHere();
  const data = await mangahere.search('Tomodachi Game');
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of manga', async () => {
  const mangahere = new MANGA.MangaHere();
  const data = await mangahere.fetchChapterPages('manga-kr954974');
  expect(data).not.toEqual([]);
});
