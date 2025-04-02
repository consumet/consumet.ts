import { ANIME } from '../../src/providers';

jest.setTimeout(120000);

const zoro = new ANIME.Zoro('hianime.to');

test('returns a filled array of anime list', async () => {
  const data = await zoro.search('Overlord IV');
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await zoro.fetchAdvancedSearch(1, 'tv', 'finished_airing');
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await zoro.fetchTopAiring();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await zoro.fetchMostPopular();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await zoro.fetchMostFavorite();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await zoro.fetchLatestCompleted();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await zoro.fetchRecentlyUpdated();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await zoro.fetchRecentlyAdded();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await zoro.fetchTopUpcoming();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await zoro.fetchStudio('studio-pierrot');
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await zoro.fetchSubbedAnime();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await zoro.fetchDubbedAnime();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await zoro.fetchMovie();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await zoro.fetchTV();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await zoro.fetchOVA();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await zoro.fetchONA();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await zoro.fetchSpecial();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of genres', async () => {
  const data = await zoro.fetchGenres();
  expect(data).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await zoro.genreSearch('action');
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await zoro.fetchSchedule();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await zoro.fetchSpotlight();
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of anime list', async () => {
  const data = await zoro.fetchSearchSuggestions('one piece');
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of episode list for continue watching', async () => {
  const connectSid = 'users_connect_sid';
  const data = await zoro.fetchContinueWatching(`${connectSid}`);
  console.log(data);
  expect(data).not.toEqual([]);
});

test('returns a filled array of animes from watch list', async () => {
  const connectSid = 'users_connect_sid';
  const data = await zoro.fetchWatchList(`${connectSid}`);
  console.log(data);
  expect(data).not.toEqual([]);
});

test('returns a filled object of anime data', async () => {
  const data = await zoro.fetchAnimeInfo('one-piece-100');
  expect(data).not.toBeNull();
  expect(data.description).not.toBeNull();
  expect(data.episodes).not.toEqual([]);
});

test('returns a filled object of episode sources', async () => {
  const res = await zoro.search('Overlord IV');
  const info = await zoro.fetchAnimeInfo(res.results[3].id);
  const data = await zoro.fetchEpisodeSources(info.episodes![0].id); // Overlord IV episode 1 id
  expect(data.sources).not.toEqual([]);
  expect(data.headers).not.toBeNull();
});
test('returns a filled object of episode sources of multiple episodes', async () => {
  const data1 = await zoro.fetchEpisodeSources(
    'rezero-starting-life-in-another-world-season-3-19301$episode$128356$both'
  );
  const data2 = await zoro.fetchEpisodeSources(
    'rezero-starting-life-in-another-world-season-3-19301$episode$128536$both'
  );
  expect(data1.sources).not.toEqual([]);
  expect(data2.sources).not.toEqual([]);
});

test('returns a filled object of anime data with: status, genres, season and japaneseTitle', async () => {
  const info = await zoro.fetchAnimeInfo('ranma-1-2-19335');

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
