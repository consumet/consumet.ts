import { StreamingServers } from '../../src/models';
import { MOVIES } from '../../src/providers';

jest.setTimeout(120000);

const himovies = new MOVIES.HiMovies();

test('Search: returns a filled array of movies/tv', async () => {
  const data = await himovies.search('vincenzo');
  expect(data.results).not.toEqual([]);
});

test('fetchMediaInfo: returns a filled object of movies/tv data', async () => {
  const data = await himovies.fetchMediaInfo('tv/watch-vincenzo-67955');
  expect(data.description).not.toEqual('');
  expect(data.episodes).not.toEqual([]);
});

test('fetchEpisodeSources: returns a filled object of streaming sources', async () => {
  const data = await himovies.fetchEpisodeSources(
    '1167571',
    'tv/watch-vincenzo-67955',
    StreamingServers.MegaCloud
  );
  expect(data.sources).not.toEqual([]);
});

test('fetchEpisodeServers: returns a filled object of streaming servers', async () => {
  const data = await himovies.fetchEpisodeServers('1167571', 'tv/watch-vincenzo-67955');
  expect(data).not.toEqual([]);
});

test('fetchByCountry: returns a filled object of movies/tv data by country', async () => {
  const data = await himovies.fetchByCountry('KR');
  expect(data.results).not.toEqual([]);
});

test('fetchByGenre: returns a filled object of movies/tv data by genre', async () => {
  const data = await himovies.fetchByGenre('drama');
  expect(data.results).not.toEqual([]);
});

test('fetchRecentMovies: returns a filled array of recent movies', async () => {
  const data = await himovies.fetchRecentMovies();
  expect(data).not.toEqual([]);
});

test('fetchRecentTvShows: returns a filled array of recent tv-shows', async () => {
  const data = await himovies.fetchRecentTvShows();
  expect(data).not.toEqual([]);
});

test('fetchTrendingMovies: returns a filled array of trending movies', async () => {
  const data = await himovies.fetchTrendingMovies();
  expect(data).not.toEqual([]);
});

test('fetchTrendingTvShows: returns a filled array of trending tv-shows', async () => {
  const data = await himovies.fetchTrendingTvShows();
  expect(data).not.toEqual([]);
});
