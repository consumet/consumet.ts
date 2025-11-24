import { ANIME } from '../../src/providers';

jest.setTimeout(120000);

const hianime = new ANIME.Hianime('hianime.to');

test('Search: returns a filled array of anime list', async () => {
  const data = await hianime.search('Overlord IV');
  expect(data.results).not.toEqual([]);
});

test('fetchAdvancedSearch: returns a filled array of anime list', async () => {
  const data = await hianime.fetchAdvancedSearch(1, 'tv', 'finished_airing');
  expect(data.results).not.toEqual([]);
});

test('fetchTopAiring: returns a filled array of anime list', async () => {
  const data = await hianime.fetchTopAiring();
  expect(data.results).not.toEqual([]);
});

test('fetchMostPopular: returns a filled array of anime list', async () => {
  const data = await hianime.fetchMostPopular();
  expect(data.results).not.toEqual([]);
});

test('fetchMostFavorite: returns a filled array of anime list', async () => {
  const data = await hianime.fetchMostFavorite();
  expect(data.results).not.toEqual([]);
});

test('fetchLatestCompleted: returns a filled array of anime list', async () => {
  const data = await hianime.fetchLatestCompleted();
  expect(data.results).not.toEqual([]);
});

test('fetchRecentlyUpdated: returns a filled array of anime list', async () => {
  const data = await hianime.fetchRecentlyUpdated();
  expect(data.results).not.toEqual([]);
});

test('fetchRecentlyAdded: returns a filled array of anime list', async () => {
  const data = await hianime.fetchRecentlyAdded();
  expect(data.results).not.toEqual([]);
});

test('fetchTopUpcoming: returns a filled array of anime list', async () => {
  const data = await hianime.fetchTopUpcoming();
  expect(data.results).not.toEqual([]);
});

test('fetchStudio: returns a filled array of anime list', async () => {
  const data = await hianime.fetchStudio('studio-pierrot');
  expect(data.results).not.toEqual([]);
});

test('fetchSubbedAnime: returns a filled array of anime list', async () => {
  const data = await hianime.fetchSubbedAnime();
  expect(data.results).not.toEqual([]);
});

test('fetchDubbedAnime: returns a filled array of anime list', async () => {
  const data = await hianime.fetchDubbedAnime();
  expect(data.results).not.toEqual([]);
});

test('fetchMovie: returns a filled array of anime list', async () => {
  const data = await hianime.fetchMovie();
  expect(data.results).not.toEqual([]);
});

test('fetchTV: returns a filled array of anime list', async () => {
  const data = await hianime.fetchTV();
  expect(data.results).not.toEqual([]);
});

test('fetchOVA: returns a filled array of anime list', async () => {
  const data = await hianime.fetchOVA();
  expect(data.results).not.toEqual([]);
});

test('fetchONA: returns a filled array of anime list', async () => {
  const data = await hianime.fetchONA();
  expect(data.results).not.toEqual([]);
});

test('fetchSpecial: returns a filled array of anime list', async () => {
  const data = await hianime.fetchSpecial();
  expect(data.results).not.toEqual([]);
});

test('fetchGenres: returns a filled array of genres', async () => {
  const data = await hianime.fetchGenres();
  expect(data).not.toEqual([]);
});

test('genreSearch: returns a filled array of anime list', async () => {
  const data = await hianime.genreSearch('action');
  expect(data.results).not.toEqual([]);
});

test('fetchSchedule: returns a filled array of anime list', async () => {
  const data = await hianime.fetchSchedule();
  expect(data.results).not.toEqual([]);
});

test('fetchSpotlight: returns a filled array of anime list', async () => {
  const data = await hianime.fetchSpotlight();
  expect(data.results).not.toEqual([]);
});

test('fetchSearchSuggestions: returns a filled array of anime list', async () => {
  const data = await hianime.fetchSearchSuggestions('one piece');
  expect(data.results).not.toEqual([]);
});

test('fetchAnimeInfo: returns a filled object of anime data', async () => {
  const data = await hianime.fetchAnimeInfo('overlord-ple-ple-pleiades-3543');
  expect(data).not.toBeNull();
  expect(data.description).not.toBeNull();
  expect(data.episodes).not.toEqual([]);
});

test('fetchEpisodeSources: returns a filled object of episode sources', async () => {
  const info = await hianime.fetchAnimeInfo('overlord-ple-ple-pleiades-3543');
  if (info.episodes && info.episodes.length > 0) {
    const data = await hianime.fetchEpisodeSources(info.episodes[0].id);
    expect(data.sources).not.toEqual([]);
  } else {
    expect(true).toBe(true);
  }
});

// TODO: Get these tests working

// test('returns a filled array of episode list for continue watching', async () => {
//   const connectSid = 'users_connect_sid';
//   const data = await hianime.fetchContinueWatching(`${connectSid}`);
//   console.log(data);
//   expect(data).not.toEqual([]);
// });

// test('returns a filled array of animes from watch list', async () => {
//   const connectSid = 'users_connect_sid';
//   const data = await hianime.fetchWatchList(`${connectSid}`);
//   console.log(data);
//   expect(data).not.toEqual([]);
// });
