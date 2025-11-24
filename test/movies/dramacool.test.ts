import { MOVIES } from '../../src/providers';
import { StreamingServers } from '../../src/models';

jest.setTimeout(120000);

const dramaCool = new MOVIES.DramaCool();

test('Search: returns totalPages when search: Love.', async () => {
  const data = await dramaCool.search('Love');
  expect(data.totalPages).not.toEqual(1);
});

test('Search: returns a filled array of movies/TV.', async () => {
  const data = await dramaCool.search('squid game');
  expect(data.results).not.toEqual([]);
});

test('fetchMediaInfo: returns filled movie/TV info when given a mediaId.', async () => {
  const data = await dramaCool.fetchMediaInfo('drama-info/squid-games-2021');
  expect(data).not.toEqual({});
});

test('fetchMediaInfo: returns genres list when given a mediaId.', async () => {
  const data = await dramaCool.fetchMediaInfo('drama-info/squid-games-2021');
  expect(data.genres?.length).not.toEqual([]);
});

test('fetchMediaInfo: returns status when given a mediaId.', async () => {
  const data = await dramaCool.fetchMediaInfo('drama-info/squid-games-2021');
  expect(data.status).not.toEqual(undefined);
});

test('fetchMediaInfo: returns information about a given mediaId', async () => {
  const data = await dramaCool.fetchMediaInfo('drama-info/believe-kimi-ni-kakeru-hashi-2024');
  expect(data).not.toEqual({});
});

test('fetchEpisodeServers: returns filled object of streaming servers when given an episodeId.', async () => {
  const data = await dramaCool.fetchEpisodeServers('episode/101046/a-graceful-liar-2025-episode-32');
  expect(data).not.toEqual({});
});

test('fetchEpisodeSources: returns filled object of streaming sources when given an episodeId.', async () => {
  const data = await dramaCool.fetchEpisodeSources(
    'episode/101046/a-graceful-liar-2025-episode-32',
    StreamingServers.StreamWish
  );
  expect(data).not.toEqual({});
});

test('fetchPopular: returns a filled array of popular movies/TV.', async () => {
  const data = await dramaCool.fetchPopular();
  expect(data.results).not.toEqual([]);
});

test('fetchRecentMovies: returns a filled array of recent movies.', async () => {
  const data = await dramaCool.fetchRecentMovies();
  expect(data.results).not.toEqual([]);
});

test('fetchRecentTvShows: returns a filled array of recent tv-shows.', async () => {
  const data = await dramaCool.fetchRecentTvShows();
  expect(data.results).not.toEqual([]);
});

test('fetchMediaInfo: returns content-rating, airs-on, director, original-network,trailer', async () => {
  const data = await dramaCool.fetchMediaInfo('drama-info/squid-games-2021');
  expect(data.contentRating).not.toEqual(undefined);
  expect(data.airsOn).not.toEqual(undefined);
  expect(data.director).not.toEqual(undefined);
  expect(data.originalNetwork).not.toEqual(undefined);
  expect(data.trailer).not.toEqual(undefined);
});

test('fetchSpotlight: returns a filled array of spotlight movies/TV.', async () => {
  const data = await dramaCool.fetchSpotlight();
  expect(data.results).not.toEqual([]);
});
