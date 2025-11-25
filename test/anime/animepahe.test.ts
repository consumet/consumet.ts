import { ANIME } from '../../src/providers';

jest.setTimeout(120000);

const animepahe = new ANIME.AnimePahe();

test('Search: returns a filled array of anime list', async () => {
  const data = await animepahe.search('Overlord IV');
  expect(data.results).not.toEqual([]);
});

test('fetchAnimeInfo: returns a filled object of anime data', async () => {
  const res = await animepahe.search('Overlord IV');
  const data = await animepahe.fetchAnimeInfo(res.results[0].id);
  expect(data).not.toBeNull();
});

test('fetchEpisodeSources: returns a filled object of episode sources', async () => {
  const res = await animepahe.search('Overlord IV');
  const info = await animepahe.fetchAnimeInfo(res.results[0].id);
  const data = await animepahe.fetchEpisodeSources(info.episodes![0].id);
  expect(data.sources).not.toEqual([]);
});
