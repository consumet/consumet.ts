import { META } from '../../src/providers';

jest.setTimeout(120000);

// run: yarn test --watch --verbose false tmdb.test.ts

const tmdb = new META.TMDB();

test('returns a filled array of movie list', async () => {
  const data = await tmdb.search('the flash');
  expect(data.results).not.toEqual([]);
});

test('returns a filled object of anime data', async () => {
  const data = await tmdb.fetchMediaInfo('60735', 'tv');
  expect(data).not.toBeNull();
  expect(data.episodes).not.toEqual([]);
  expect(data.description).not.toBeNull();
});

test('returns a filled array of servers', async () => {
  const data = await tmdb.fetchEpisodeServers('2899', 'tv/watch-the-flash-39535');
  expect(data).not.toEqual([]);
});

test('returns a filled object of episode sources', async () => {
  const data = await tmdb.fetchEpisodeSources('2899', 'tv/watch-the-flash-39535');
  expect(data.sources).not.toEqual([]);
});
