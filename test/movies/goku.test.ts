import { MOVIES } from '../../src/providers';

jest.setTimeout(120000);

const goku = new MOVIES.Goku();

test('returns a filled array of movies/tv', async () => {
  const data = await goku.search('batman');
  expect(data.results).not.toEqual([]);
});

test('returns a filled object of movies data', async () => {
  const data = await goku.fetchMediaInfo('movie/watch-batman-begins-19636');
  expect(data.description).not.toEqual('');
  expect(data.episodes).not.toEqual([]);
});

test('returns a filled object of streaming movie servers', async () => {
  const servers = await goku.fetchEpisodeServers('1064170', 'movie/watch-batman-begins-19636');
  expect(servers).not.toEqual([]);
});

test('returns a filled object of streaming movie sources', async () => {
  const sources = await goku.fetchEpisodeSources('1064170', 'movie/watch-batman-begins-19636');
  expect(sources).not.toEqual([]);
});

test('returns a filled object of tv data', async () => {
  const data = await goku.fetchMediaInfo('series/watch-batman-39276');
  expect(data.description).not.toEqual('');
  expect(data.episodes).not.toEqual([]);
});

test('returns a filled object of streaming tv servers', async () => {
  const servers = await goku.fetchEpisodeServers('46259', 'series/watch-batman-39276');
  expect(servers).not.toEqual([]);
});

test('returns a filled object of streaming tv sources', async () => {
  const sources = await goku.fetchEpisodeSources('46259', 'series/watch-batman-39276');
  expect(sources).not.toEqual([]);
});


// test('returns a filled object of streaming tv sources', async () => {
//   const sources = goku.fetchRecentMovies();
//   console.log(sources)
//   expect(sources).not.toEqual([]);
// });
