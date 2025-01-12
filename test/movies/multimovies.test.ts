import { MOVIES } from '../../src/providers';

jest.setTimeout(120000);

// run: yarn test --watch --verbose false multimovies.test.ts

const multimovies = new MOVIES.MultiMovies();

test('Search: returns a filled array of movies/TV.', async () => {
  const data = await multimovies.search('jujutsu kaisen');
  expect(data.results).not.toEqual([]);
});

test('fetchMediaInfo: returns filled movie/TV info when given a mediaId.', async () => {
  const data = await multimovies.fetchMediaInfo('tvshows/jujutsu-kaisen/');
  expect(data).not.toEqual({});
});

test('fetchEpisodeServers: returns filled object of streaming sources when given an episodeId.', async () => {
  const data = await multimovies.fetchEpisodeServers('episodes/jujutsu-kaisen-1x1/');
  expect(data).not.toEqual({});
});

test('fetchEpisodeSources: returns filled object of streaming sources when given an episodeId.', async () => {
  const data = await multimovies.fetchEpisodeSources('episodes/jujutsu-kaisen-1x1/');
  expect(data).not.toEqual({});
});

test('fetchMediaInfo: returns genres list when given a mediaId.', async () => {
  const data = await multimovies.fetchMediaInfo('tvshows/jujutsu-kaisen/');
  expect(data.genres?.length).not.toEqual([]);
});

test('fetchMediaInfo: returns duration (if available) when given a mediaId.', async () => {
  const data = await multimovies.fetchMediaInfo('tvshows/jujutsu-kaisen/');
  expect(data.duration).not.toEqual(undefined);
});

test('Search: returns totalPages when search: Jujutsu Kaisen', async () => {
  const data = await multimovies.search('Jujutsu Kaisen');
  expect(data.totalPages).not.toEqual(1);
});

test('fetchPopular: returns a filled array of popular movies/TV.', async () => {
  const data = await multimovies.fetchPopular();
  expect(data.results).not.toEqual([]);
});

test('fetchMediaInfo:returns content-rating, airs-on, director, original-network,trailer, characters', async () => {
  const data = await multimovies.fetchMediaInfo('tvshows/jujutsu-kaisen/');
  expect(data.trailer).not.toEqual(undefined);
  expect(data.characters).not.toEqual([]);
});
