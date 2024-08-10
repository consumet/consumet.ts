import { MANGA } from '../../src/providers';

jest.setTimeout(120000);

// run: yarn test --watch --verbose false vyvymanga.test.ts

const vyvymanga = new MANGA.VyvyManga();

test('Search: returns a filled array of manga.', async () => {
  const data = await vyvymanga.search('sora no otoshimono');
  expect(data.results).not.toEqual([]);
});

test('Search: returns a filled array of manga.', async () => {
  async function testError() {
    await vyvymanga.search('naruto', -1);
  }

  expect(testError).toThrow(new Error('page must be equal to 1 or greater'));
});

test('Search: returns a filled array of manga.', async () => {
  const data = await vyvymanga.searchApi('sora no otoshimono');
  expect(data.results).not.toEqual([]);
});

test('fetchMangaInfo: returns filled manga info when given a mangaId.', async () => {
  const data = await vyvymanga.fetchMangaInfo('6722');
  expect(data).not.toEqual({});
});

test('fetchChapterPages: returns filled page data when given a chapterId.', async () => {
  const data = await vyvymanga.fetchChapterPages(
    'https://summonersky.com/rds/rdsd?data=cjUrTGRiT3Q0NDV3cWNvdjlFcVhScHpCUy9MZ0tXa21oSHR4c2VlbUZVUEx0ZitlQWFSMlF4dWJyMXAweU5UWFBJay9YaTc5WllUb0RWZy9JQnc5RGxPOWRXQk9CNHk1bmtwTVRxQnFaVzdEemxGdHVTSzlsTnh5ZzhMNXNqMlYrOGRLZWRVVVpVVW1UUFFZNHBqOXJBPT06OkLTY3JOCbyE7jUI78gGnHY%3D'
  );
  expect(data).not.toEqual([]);
});
