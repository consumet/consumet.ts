import { MANGA } from '../../src/providers';
import { MangaHereRankingType } from '../../src/providers/manga/mangahere';

jest.setTimeout(120000);

const mangahere = new MANGA.MangaHere();

test('returns a filled array of trending manga', async () => {
  const data = await mangahere.fetchMangaTrending();
  expect(data.results).not.toEqual([]);
  expect(data.results[0].id).toBeDefined();
  expect(data.results[0].title).toBeDefined();
  expect(data.results[0].image).toBeDefined();
  expect(data.results[0].latestChapterId).toBeDefined();
  expect(data.results[0].latestChapterNumber).toBeDefined();
});

test('returns a filled array of manga', async () => {
  const data = await mangahere.search('slime');
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of ranking manga', async () => {
  const data = await mangahere.fetchMangaRanking('day');
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of hot releases', async () => {
  const data = await mangahere.fetchMangaHotReleases();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of recent updates', async () => {
  const data = await mangahere.fetchMangaRecentUpdate(2);
  expect(data.results).not.toEqual([]);
  expect(data.hasNextPage).toBe(true);
  expect(data.currentPage).toBe(2);
});

test('returns a filled array of browsed manga', async () => {
  const data = await mangahere.browse({ genre: 'supernatural', status: 'completed', page: 2 });
  expect(data.results).not.toEqual([]);
  expect(data.hasNextPage).toBe(true);
  expect(data.currentPage).toBe(2);
});
