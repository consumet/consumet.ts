import { StreamingServers, SubOrSub } from '../../src/models';
import { ANIME } from '../../src/providers';

jest.setTimeout(120000);

// run: yarn test --watch --verbose false animekai.test.ts

const animekai = new ANIME.AnimeKai('animekai.to');

test('returns a filled array of anime list', async () => {
  const data = await animekai.search('Dandadan');
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await animekai.fetchLatestCompleted();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await animekai.fetchRecentlyAdded();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await animekai.fetchNewReleases();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await animekai.fetchMovie();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await animekai.fetchTV();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await animekai.fetchOVA();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await animekai.fetchONA();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await animekai.fetchSpecial();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of genres', async () => {
  const data = await animekai.fetchGenres();
  expect(data).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await animekai.genreSearch('action');
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await animekai.fetchSchedule();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await animekai.fetchSpotlight();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await animekai.fetchSearchSuggestions('jar');
  expect(data.results).not.toEqual([]);
});

test('returns a filled object of anime data', async () => {
  const res = await animekai.search('Dandadan');
  const data = await animekai.fetchAnimeInfo(res.results[0].id);
  expect(data).not.toBeNull();
  expect(data.description).not.toBeNull();
  expect(data.episodes).not.toEqual([]);
});

test('returns a filled object of episode sources', async () => {
  const res = await animekai.search('Dandadan');
  const info = await animekai.fetchAnimeInfo(res.results[0].id);
  const data = await animekai.fetchEpisodeSources(info.episodes![0].id);
  expect(data.sources).not.toEqual([]);
});

test('returns a filled object of anime data with: status, genres, season and japaneseTitle', async () => {
  const info = await animekai.fetchAnimeInfo('jujutsu-kaisen-season-2-73v2');

  expect(info.status).not.toBeNull();
  expect(info.status).toBeDefined();
  expect(info.status).not.toBe('');

  expect(info.season).not.toBeNull();
  expect(info.season).toBeDefined();
  expect(info.season).not.toBe('');

  expect(info.japaneseTitle).not.toBeNull();
  expect(info.japaneseTitle).toBeDefined();
  expect(info.japaneseTitle).not.toBe('');

  expect(info.genres).not.toBeNull();
  expect(info.genres).toBeDefined();
  expect(info.genres).not.toEqual([]);
});
