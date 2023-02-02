import { ANIME } from '../../src/providers';

jest.setTimeout(120000);

const animepahe = new ANIME.AnimePahe();

test('returns a filled array of anime list', async () => {
  const data = await animepahe.search('Overlord IV');
  expect(data.results).not.toEqual([]);
});

test('returns a filled object of anime data', async () => {
  const res = await animepahe.search('Overlord IV');
  const data = await animepahe.fetchAnimeInfo(res.results[0].id); // Overlord IV id
  expect(data).not.toBeNull();
});

test('returns a filled object of episode sources', async () => {
  const data = await animepahe.fetchEpisodeSources(
    'c579af27bb9835094ee384fb811e679a6955d68de3f7ee3c6cda21e97cd8c8b7'
  ); // Episode 1 of Overlord IV
  expect(data.sources).not.toEqual([]);
});
