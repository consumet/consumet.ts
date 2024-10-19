import { MANGA } from '../../src/providers';

jest.setTimeout(120000);

// run: yarn test --watch --verbose false asurascans.test.ts

const asura = new MANGA.AsuraScans();

test('returns a filled array of manga', async () => {
  const data = await asura.search('Omniscient Reader’s Viewpoint');
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of chapters', async () => {
  const chapters = await asura.fetchMangaInfo('series/omniscient-readers-viewpoint-b88a351c'); // IDS are dynamic, its gonna fail after a few hours
  expect(chapters.chapters).not.toEqual([]);
});

test('returns a filled array of pages', async () => {
  const pages = await asura.fetchChapterPages('solo-max-level-newbie-d9977a85/chapter/66'); // IDS are dynamic, its gonna fail after a few hours
  expect(pages).not.toEqual([]);
});
