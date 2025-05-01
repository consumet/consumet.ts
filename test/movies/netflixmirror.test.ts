import { MOVIES } from '../../src/providers';

jest.setTimeout(120000);

// run: yarn test --watch --verbose false netflixmirror.test.ts

const netflixmirror = new MOVIES.NetflixMirror();

test('Search: returns a filled array of movies/TV.', async () => {
  const data = await netflixmirror.search('jujutsu kaisen');
  expect(data.results).not.toEqual([]);
});

test('fetchMediaInfo: returns filled movie/TV info when given a mediaId.', async () => {
  const data = await netflixmirror.fetchMediaInfo('81342624');
  expect(data).not.toEqual({});
});

test('fetchEpisodeSources: returns filled object of streaming sources when given an episodeId.', async () => {
  const data = await netflixmirror.fetchEpisodeSources('81342624');
  expect(data).not.toEqual({});
});
