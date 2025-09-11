import { ANIME } from '../../src/providers';

jest.setTimeout(120000);

const animeowl = new ANIME.AnimeOwl();

test('returns a filled array of anime list', async () => {
  const data = await animeowl.search('Overlord IV');
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await animeowl.fetchTopAiring();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await animeowl.fetchRecentlyUpdated();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await animeowl.fetchMovie();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await animeowl.fetchTV();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await animeowl.fetchOVA();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await animeowl.fetchONA();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await animeowl.fetchSpecial();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of genres', async () => {
  const data = await animeowl.fetchGenres();
  expect(data).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await animeowl.genreSearch('action');
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await animeowl.fetchSpotlight();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await animeowl.fetchSearchSuggestions('one piece');
  expect(data.results).not.toEqual([]);
});

test('returns a filled object of anime data', async () => {
  const data = await animeowl.fetchAnimeInfo('dandadan');
  expect(data).not.toBeNull();
  expect(data.description).not.toBeNull();
  expect(data.episodes).not.toEqual([]);
});

test('returns a filled object of episode sources', async () => {
  const res = await animeowl.search('Dandadan');
  const info = await animeowl.fetchAnimeInfo(res.results[0].id);
  const data = await animeowl.fetchEpisodeSources(info.episodes![0].id); // Overlord IV episode 1 id
  expect(data.sources).not.toEqual([]);
  expect(data.headers).not.toBeNull();
});

test('returns a filled object of anime data with: status, genres, season and japaneseTitle', async () => {
  const search = await animeowl.search('Dandadan');
  const info = await animeowl.fetchAnimeInfo(search.results[0].id);

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
