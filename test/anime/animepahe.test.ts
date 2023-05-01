import { ANIME } from '../../src/providers';

jest.setTimeout(120000);

const animepahe = new ANIME.AnimePahe();

test('returns a filled array of anime list', async () => {
  const data = await animepahe.search('Overlord IV');
  expect(data.results).not.toEqual([]);
});

test('returns a filled object of anime data', async () => {
  const res = await animepahe.search('Overlord IV');
  const data = await animepahe.fetchAnimeInfo(res.results[0].id, res.results[0].session); // Overlord IV id
  expect(data).not.toBeNull();
});

test('returns a filled object of episode sources', async () => {
  const res = await animepahe.search('Overlord IV');
  const data1 = await animepahe.fetchAnimeInfo(res.results[0].id, res.results[0].session);
  const data = await animepahe.fetchEpisodeSources(data1.episodes![0].url ?? ''); // Episode 1 of Overlord IV
  console.log(data);
  expect(data.sources).not.toEqual([]);
});
