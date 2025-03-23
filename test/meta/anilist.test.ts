import { META } from '../../src/providers';

jest.setTimeout(120000);

const anilist = new META.Anilist();

test('returns a specific array of anime list', async () => {
  let query: string | undefined = 'One piece';
  let type: string | undefined = 'ANIME';
  let page: number = 1;
  let perPage: number = 10;
  let format: string | undefined = 'MOVIE';
  let sort: string[] | undefined = ['POPULARITY_DESC'];
  let genres: string[] | undefined = ['Action', 'Adventure'];
  let tags: string[] | undefined = ['Shounen'];
  let id: string | number | undefined;
  let year: number | undefined = 2016;
  let status: string | undefined = 'FINISHED';
  let season: string | undefined = 'SUMMER';

  const data = await anilist.advancedSearch({
    query,
    type,
    page,
    perPage,
    format,
    sort,
    genres,
    tags,
    id,
    year,
    status,
    season,
  });

  expect(data.results.length).toBe(1);
  expect(data.results.some(item => item.id === '21335')).toBe(true);
});

test('returns a filled array of anime list', async () => {
  const data = await anilist.search('spy x family');
  expect(data.results).not.toEqual([]);
});

test('returns a filled object of anime data', async () => {
  const data = await anilist.fetchAnimeInfo('140960');
  expect(data).not.toBeNull();
  expect(data.episodes).not.toEqual([]);
  expect(data.description).not.toBeNull();
});

test('returns episodes for sub and dub not available', async () => {
  const subData = await anilist.fetchEpisodesListById('949', false);
  expect(subData).not.toBeNull();
  expect(subData).not.toEqual([]);

  const dubData = await anilist.fetchEpisodesListById('949', true);
  expect(dubData).not.toBeNull();
  expect(dubData).not.toEqual([]);
});

test('returns a filled array of servers', async () => {
  const data = await anilist.fetchEpisodeServers('spy-x-family-episode-9');
  expect(data).not.toEqual([]);
});

test('returns a filled object of episode sources', async () => {
  const data = await anilist.fetchEpisodeSources('spy-x-family-episode-9');
  expect(data.sources).not.toEqual([]);
});

test('returns a filled array of trending anime', async () => {
  const data = await anilist.fetchTrendingAnime(1, 10);
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of popular anime', async () => {
  const data = await anilist.fetchPopularAnime(1, 10);
  expect(data.results).not.toEqual([]);
});

test('returns a filled array of airing schedule', async () => {
  const weekStart = Math.ceil(Date.now() / 1000);
  const data = await anilist.fetchAiringSchedule(1, 20, weekStart, weekStart + 604800, true);
  expect(data.results).not.toEqual([]);
});

test('returns object of staff information', async () => {
  const data = await anilist.fetchStaffById(97410);
  expect(data.id).not.toBeUndefined();
});
('');
