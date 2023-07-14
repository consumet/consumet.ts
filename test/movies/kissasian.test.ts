import { MOVIES } from '../../src/providers';

jest.setTimeout(120000);

// run: yarn test --watch --verbose false viewasian.test.ts

const kissAsian = new MOVIES.KissAsian();

test('Search: returns a filled array of movies/TV.', async () => {
  const data = await kissAsian.search('Vincenzo');
  expect(data.results).not.toEqual([]);
});

test('fetchMediaInfo: returns filled movie/TV info when given a mediaId.', async () => {
  const data = await kissAsian.fetchMediaInfo('info/vincenzo');
  expect(data).not.toEqual({});
});

test('fetchEpisodeServers: returns filled object of streaming sources when given an episodeId.', async () => {
  const data = await kissAsian.fetchEpisodeServers('drama/vincenzo-2021-episode-1');
  //console.log(data);
  expect(data).not.toEqual({});
});

test('fetchEpisodeSources: returns filled object of streaming sources when given an episodeId.', async () => {
  const data = await kissAsian.fetchEpisodeSources('drama/vincenzo-2021-episode-1');
  console.log(data);
  expect(data).not.toEqual({});
});
