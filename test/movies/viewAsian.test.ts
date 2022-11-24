import { MOVIES } from '../../src/providers';

jest.setTimeout(120000);

// run: yarn test --watch --verbose false viewAsian.test.ts

test('Search: returns a filled array of movies/TV.', async () => {
  const viewAsian = new MOVIES.ViewAsian();
  const data = await viewAsian.search('Vincenzo');
  expect(data.results).not.toEqual([]);
});

test('fetchMediaInfo: returns filled movie/TV info when given a mediaId.', async () => {
  const viewAsian = new MOVIES.ViewAsian();
  const data = await viewAsian.fetchMediaInfo('drama/vincenzo');
  expect(data).not.toEqual({});
});

test('fetchEpisodeSources: returns filled object of streaming sources when given an episodeId.', async () => {
  const viewAsian = new MOVIES.ViewAsian();
  const data = await viewAsian.fetchEpisodeSources('/watch/vincenzo/watching.html$episode$20');
  expect(data).not.toEqual({});
});
