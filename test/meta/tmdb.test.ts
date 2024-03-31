import { META } from '../../src/providers';

jest.setTimeout(120000);

// run: yarn test --watch --verbose false tmdb.test.ts

const tmdb = new META.TMDB();

test('returns a filled array of movie list', async () => {
  const data = await tmdb.search('the flash');
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of trending movie list', async () => {
  const data = await tmdb.fetchTrending('movie');
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of trending tv-series list', async () => {
  const data = await tmdb.fetchTrending('TV Series');
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of trending people list', async () => {
  const data = await tmdb.fetchTrending('People');
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of all trending list', async () => {
  const data = await tmdb.fetchTrending('all');
  expect(data.results).not.toEqual([]);
});

test('returns a filled object of anime data', async () => {
  const data = await tmdb.fetchMediaInfo('60735', 'tv');
  expect(data).not.toBeNull();
  expect(data.episodes).not.toEqual([]);
  expect(data.description).not.toBeNull();
});

test('returns a filled object of episode sources for Tv', async () => {
  const data = await tmdb.fetchEpisodeSources('60735', 'tv', 1, 2);
  expect(data.sources).not.toEqual([]);
});

test('returns a filled object of episode sources for Movie', async () => {
  const data = await tmdb.fetchEpisodeSources('470360', 'movie');
  expect(data.sources).not.toEqual([]);
});
