import { MOVIES } from '../../src/providers';

jest.setTimeout(120000);

// run: yarn test --watch --verbose false dramacool.test.ts

test('Search: returns a filled array of movies/TV.', async () => {
  const dramacool = new MOVIES.DramaCool();
  const data = await dramacool.search('Vincenzo');
  expect(data.results).not.toEqual([]);
});

test('fetchMediaInfo: returns filled movie/TV info when given a mediaId.', async () => {
  const dramacool = new MOVIES.DramaCool();
  const data = await dramacool.fetchMediaInfo('drama-detail/vincenzo');
  expect(data).not.toEqual({});
});

test('fetchEpisodeSources: returns filled object of streaming sources when given an episodeId.', async () => {
  const dramacool = new MOVIES.DramaCool();
  const data = await dramacool.fetchEpisodeSources('vincenzo-2021-episode-1');
  expect(data).not.toEqual({});
});
