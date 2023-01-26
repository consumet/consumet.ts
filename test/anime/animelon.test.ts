import { ANIME } from '../../src/providers';

jest.setTimeout(120000);

const animelon = new ANIME.Animelon();

test('returns a filled array of anime list', async () => {
  const animelon = new ANIME.Animelon();
  const data = await animelon.search('Overlord IV');
  expect(data.results).not.toEqual([]);
});

test('returns a filled object of anime data', async () => {
  const res = await animelon.search('Overlord IV');
  const data = await animelon.fetchAnimeInfo(res.results[0].id); // Overlord IV id
  expect(data).not.toBeNull();
  expect(data.description).not.toBeNull();
  expect(data.episodes).not.toEqual([]);
})

test('returns a filled object of episode sources', async () => {
  const data = await animelon.fetchEpisodeSources('5e059e9ba8be9f2c40c8a034');
  expect(data.sources).not.toEqual([]);
});
