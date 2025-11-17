import { MOVIES } from '../../src/providers';
import { StreamingServers } from '../../src/models';

jest.setTimeout(120000);

const flixhq = new MOVIES.FlixHQ();

test('Search: returns a filled array of movies/tv', async () => {
  const data = await flixhq.search('vincenzo');
  expect(data.results).not.toEqual([]);
});

test('fetchMediaInfo: returns a filled object of movies/tv data', async () => {
  const data = await flixhq.fetchMediaInfo('tv/watch-rick-and-morty-39480');
  expect(data.description).not.toEqual('');
  expect(data.episodes).not.toEqual([]);
});

test('fetchEpisodeSources: returns a filled object of streaming sources', async () => {
  const data = await flixhq.fetchEpisodeSources(
    '133474',
    'movie/watch-one-battle-after-another-133474',
    StreamingServers.VidCloud
  );
  expect(data.sources).not.toEqual([]);
});

test('fetchEpisodeServers: returns a filled object of streaming servers', async () => {
  const data = await flixhq.fetchEpisodeServers(
    '137695',
    'tv/watch-angela-diniz-murdered-and-convicted-137695'
  );
  expect(data).not.toEqual([]);
});

test('fetchByCountry: returns a filled object of movies/tv data by country', async () => {
  const data = await flixhq.fetchByCountry('KR');
  expect(data.results).not.toEqual([]);
});

test('fetchByGenre: returns a filled object of movies/tv data by genre', async () => {
  const data = await flixhq.fetchByGenre('drama');
  expect(data.results).not.toEqual([]);
});

test('fetchSpotlight: returns a filled array of spotlight movies/TV.', async () => {
  const data = await flixhq.fetchSpotlight();
  expect(data.results).not.toEqual([]);
});

test('fetchRecentMovies: returns a filled array of recent movies', async () => {
  const data = await flixhq.fetchRecentMovies();
  expect(data).not.toEqual([]);
});

test('fetchRecentTvShows: returns a filled array of recent tv-shows', async () => {
  const data = await flixhq.fetchRecentTvShows();
  expect(data).not.toEqual([]);
});

test('fetchTrendingMovies: returns a filled array of trending movies', async () => {
  const data = await flixhq.fetchTrendingMovies();
  expect(data).not.toEqual([]);
});

test('fetchTrendingTvShows: returns a filled array of trending tv-shows', async () => {
  const data = await flixhq.fetchTrendingTvShows();
  expect(data).not.toEqual([]);
});
