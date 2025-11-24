import { ANIME } from '../../src/providers';

jest.setTimeout(120000);

const animekai = new ANIME.AnimeKai('https://anikai.to');

test('Search: returns a filled array of anime list', async () => {
  const data = await animekai.search('Dandadan');
  expect(data.results).not.toEqual([]);
});

test('fetchLatestCompleted: returns a filled array of anime list', async () => {
  const data = await animekai.fetchLatestCompleted();
  expect(data.results).not.toEqual([]);
});

test('fetchRecentlyAdded: returns a filled array of anime list', async () => {
  const data = await animekai.fetchRecentlyAdded();
  expect(data.results).not.toEqual([]);
});

test('FetchNewReleases: returns a filled array of anime list', async () => {
  const data = await animekai.fetchNewReleases();
  expect(data.results).not.toEqual([]);
});

test('fetchMovie: returns a filled array of anime list', async () => {
  const data = await animekai.fetchMovie();
  expect(data.results).not.toEqual([]);
});

test('fetchTV: returns a filled array of anime list', async () => {
  const data = await animekai.fetchTV();
  expect(data.results).not.toEqual([]);
});

test('fetchOVA: returns a filled array of anime list', async () => {
  const data = await animekai.fetchOVA();
  expect(data.results).not.toEqual([]);
});

test('fetchONA: returns a filled array of anime list', async () => {
  const data = await animekai.fetchONA();
  expect(data.results).not.toEqual([]);
});

test('fetchSpecial: returns a filled array of anime list', async () => {
  const data = await animekai.fetchSpecial();
  expect(data.results).not.toEqual([]);
});

test('fetchGenres: returns a filled array of genres', async () => {
  const data = await animekai.fetchGenres();
  expect(data).not.toEqual([]);
});

test('genreSearch: returns a filled array of anime list', async () => {
  const data = await animekai.genreSearch('action');
  expect(data.results).not.toEqual([]);
});

test('fetchSchedule: returns a filled array of anime list', async () => {
  const data = await animekai.fetchSchedule();
  expect(data.results).not.toEqual([]);
});

test('fetchSpotlight: returns a filled array of anime list', async () => {
  const data = await animekai.fetchSpotlight();
  expect(data.results).not.toEqual([]);
});

test('fetchSearchSuggestions: returns a filled array of anime list', async () => {
  const data = await animekai.fetchSearchSuggestions('jar');
  expect(data.results).not.toEqual([]);
});
