import { MANGA } from '../../src/providers';

jest.setTimeout(120000);

// run: yarn test --watch --verbose false readManga.test.ts

const readManga = new MANGA.ReadManga();

test('Search: returns a filled array of manga.', async () => {
  const data = await readManga.search('another');
  expect(data.results).not.toEqual([]);
});

test('fetchMangaInfo: returns filled manga info when given a mangaId.', async () => {
  const data = await readManga.fetchMangaInfo('https://readmanga.app/one-piece');
  expect(data).not.toEqual({});
});

test('fetchChapterPages: returns filled page data when given a chapterId.', async () => {
  const data = await readManga.fetchChapterPages('https://rmanga.app/one-piece/chapter-1107/all-pages');
  expect(data).not.toEqual([]);
});

test('fetchNewManga: returns filled array of manga.', async () => {
  const data = await readManga.fetchNewManga();
  console.log(data);
  expect(data).not.toEqual([]);
});

test('fetchTopRatedManga: returns filled array of manga.', async () => {
  const data = await readManga.fetchTopRatedManga();
  console.log(data);
  expect(data).not.toEqual([]);
});
