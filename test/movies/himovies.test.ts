import { MOVIES } from '../../src/providers';

jest.setTimeout(120000);

const himovies = new MOVIES.HiMovies();

test('returns a filled array of movies/tv', async () => {
  const data = await himovies.search('vincenzo');
  expect(data.results).not.toEqual([]);
});

test('returns a filled object of movies/tv data', async () => {
  const data = await himovies.fetchMediaInfo('tv/watch-vincenzo-67955');
  expect(data.description).not.toEqual('');
  expect(data.episodes).not.toEqual([]);
});

test('returns a filled object of streaming sources', async () => {
  const episodeSources = await himovies.fetchEpisodeSources('1167571', 'tv/watch-vincenzo-67955');
  expect(episodeSources.sources).not.toEqual([]);
});

test('returns a filled object of movies/tv data by country', async () => {
  const data = await himovies.fetchByCountry('KR');
  expect(data.results).not.toEqual([]);
});

test('returns a filled object of movies/tv data by genre', async () => {
  const data = await himovies.fetchByGenre('drama');
  expect(data.results).not.toEqual([]);
});
