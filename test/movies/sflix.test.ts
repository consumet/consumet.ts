import { StreamingServers } from '../../src/models';
import { MOVIES } from '../../src/providers';

jest.setTimeout(120000);

const sflix = new MOVIES.SFlix();

test('Search: returns a filled array of movies/tv', async () => {
  const data = await sflix.search('vincenzo');
  expect(data.results).not.toEqual([]);
});

test('fetchMediaInfo: returns a filled object of movies/tv data', async () => {
  const data = await sflix.fetchMediaInfo('tv/free-vincenzo-hd-67955');
  expect(data.description).not.toEqual('');
  expect(data.episodes).not.toEqual([]);
});

test('fetchEpisodeServers: returns a filled object of streaming servers', async () => {
  const data = await sflix.fetchEpisodeServers('18729', 'movie/free-superbad-hd-18729');
  expect(data).not.toEqual([]);
});

test('fetchEpisodeSources: returns a filled object of streaming sources', async () => {
  const data = await sflix.fetchEpisodeSources(
    '18729',
    'movie/free-superbad-hd-18729',
    StreamingServers.MegaCloud
  );
  expect(data.sources).not.toEqual([]);
  expect(data.subtitles).not.toEqual([]);
});

test('fetchByCountry: returns a filled object of movies/tv data by country', async () => {
  const data = await sflix.fetchByCountry('KR');
  expect(data.results).not.toEqual([]);
});

test('fetchByGenre: returns a filled object of movies/tv data by genre', async () => {
  const data = await sflix.fetchByGenre('drama');
  expect(data.results).not.toEqual([]);
});

test('fetchSpotlight: returns a filled array of spotlight movies/TV.', async () => {
  const data = await sflix.fetchSpotlight();
  expect(data.results).not.toEqual([]);
});

test('fetchRecentMovies: returns a filled array of recent movies', async () => {
  const data = await sflix.fetchRecentMovies();
  expect(data).not.toEqual([]);
});

test('fetchRecentTvShows: returns a filled array of recent tv-shows', async () => {
  const data = await sflix.fetchRecentTvShows();
  expect(data).not.toEqual([]);
});

test('fetchTrendingMovies: returns a filled array of trending movies', async () => {
  const data = await sflix.fetchTrendingMovies();
  expect(data).not.toEqual([]);
});

test('fetchTrendingTvShows: returns a filled array of trending tv-shows', async () => {
  const data = await sflix.fetchTrendingTvShows();
  expect(data).not.toEqual([]);
});
