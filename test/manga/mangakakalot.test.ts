import { MANGA } from '../../src/providers';

jest.setTimeout(120000);

const mangakakalot = new MANGA.MangaKakalot();

test('search: returns a filled array of manga', async () => {
  const data = await mangakakalot.search('one piece');
  expect(data.results).not.toEqual([]);
  expect(data.results[0].id).toBeDefined();
  expect(data.results[0].title).toBeDefined();
  expect(data.results[0].image).toBeDefined();
});

test('fetchMangaInfo: returns manga info with chapters', async () => {
  const searchResults = await mangakakalot.search('naruto');
  expect(searchResults.results.length).toBeGreaterThan(0);

  const mangaId = searchResults.results[0].id;
  const data = await mangakakalot.fetchMangaInfo(mangaId);

  expect(data.id).toBeDefined();
  expect(data.title).toBeDefined();
  expect(data.chapters).toBeDefined();
  expect(data.chapters!.length).toBeGreaterThan(0);
});

test('fetchChapterPages: returns chapter pages', async () => {
  const searchResults = await mangakakalot.search('one piece');
  expect(searchResults.results.length).toBeGreaterThan(0);

  const mangaId = searchResults.results[0].id;
  const mangaInfo = await mangakakalot.fetchMangaInfo(mangaId);
  expect(mangaInfo.chapters!.length).toBeGreaterThan(0);

  const chapterId = mangaInfo.chapters![0].id;
  const pages = await mangakakalot.fetchChapterPages(chapterId);

  expect(pages).not.toEqual([]);
  expect(pages[0].img).toBeDefined();
  expect(pages[0].page).toBeDefined();
});

test('fetchLatestUpdates: returns latest manga', async () => {
  const data = await mangakakalot.fetchLatestUpdates();
  expect(data.results).not.toEqual([]);
  expect(data.results[0].id).toBeDefined();
  expect(data.results[0].title).toBeDefined();
});

test('fetchSuggestions: returns suggestions for query', async () => {
  const suggestions = await mangakakalot.fetchSuggestions('naruto');
  // Suggestions may or may not return results depending on the API
  expect(Array.isArray(suggestions)).toBe(true);
});
