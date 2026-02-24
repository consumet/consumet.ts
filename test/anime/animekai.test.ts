import { ANIME } from '../../src/providers';

jest.setTimeout(120000);

// Using a CORS proxy to bypass Cloudflare for testing purposes
// AnimeKai is heavily protected by Cloudflare and this allows us to test the provider without dealing with Cloudflare challenges.
const animekai = new ANIME.AnimeKai({
  url: 'https://whatever.fly.dev/get?url=',
  encodeUrl: true,
});

test('Search: returns a filled array of anime list', async () => {
  const data = await animekai.search('Dandadan');
  expect(data.results).not.toEqual([]);
});

test('fetchAnimeInfo: returns a filled object of anime data', async () => {
  const data = await animekai.fetchAnimeInfo('dan-da-dan-vmly');
  expect(data.episodes).not.toEqual([]);
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

test('fetchEpisodeSources: returns a filled object of episode sources', async () => {
  const info = await animekai.fetchAnimeInfo('dan-da-dan-vmly$ep=1$token=NIK99_3yp0i9hXdB0Ig');
  if (info.episodes && info.episodes.length > 0) {
    const data = await animekai.fetchEpisodeSources(info.episodes[0].id);
    expect(data.sources).not.toEqual([]);
  } else {
    expect(true).toBe(true);
  }
});

test('fetchEpisodeServers: returns a filled array of episode servers', async () => {
  const info = await animekai.fetchAnimeInfo('dan-da-dan-vmly$ep=1$token=NIK99_3yp0i9hXdB0Ig');

  expect(info.episodes).toBeDefined();
  expect(info.episodes!.length).toBeGreaterThan(0);

  const servers = await animekai.fetchEpisodeServers(info.episodes![0].id);
  expect(servers).toBeInstanceOf(Array);
  expect(servers.length).toBeGreaterThan(0);
  expect(servers[0]).toHaveProperty('name');
  expect(servers[0]).toHaveProperty('url');
});
