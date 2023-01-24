import { ANIME } from '../../src/providers';

jest.setTimeout(120000);

const animepahe = new ANIME.AnimePahe

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
  const data = await animepahe.fetchEpisodeSources('08a9af4f41d91079b16015bedd762e4db89bbc61ff545316d57f1fd7d8c3542c'); // Episode 1 of Overlord IV
  expect(data.sources).not.toEqual([]);
});
