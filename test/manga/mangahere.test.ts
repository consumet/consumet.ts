import { MANGA } from '../../src/providers';

jest.setTimeout(120000);

test('returns a filled array of manga', async () => {
  const mangahere = new MANGA.MangaHere();
  const data = await mangahere.search('slime');
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of manga', async () => {
  const mangahere = new MANGA.MangaHere();
  const data = await mangahere.fetchChapterPages('a_returner_s_magic_should_be_special/c195/1');
  expect(data).not.toEqual([]);
});
