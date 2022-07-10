import { ANIME } from '../../src/providers';

jest.setTimeout(120000);

test('returns a filled array of anime list', async () => {
  const animepahe = new ANIME.AnimePahe();
  const data = await animepahe.search('Overlord IV');
  expect(data.results).not.toEqual([]);
});

test('returns a filled object of anime data', async () => {
  const animepahe = new ANIME.AnimePahe();
  const data = await animepahe.fetchAnimeInfo('adb84358-8fec-fe80-1dc5-ad6218421dc1'); // Overlord IV id
  expect(data).not.toBeNull();
  expect(data.description).not.toBeNull();
  expect(data.episodes).not.toEqual([]);
});

test('returns a filled object of episode sources', async () => {
  const animepahe = new ANIME.AnimePahe();
  const data = await animepahe.fetchEpisodeSources(
    'c673b4d6cedf5e4cd1900d30d61ee2130e23a74e58f4401a85f21a4e95c94f73'
  ); // Overlord IV episode 1 id
  expect(data.sources).not.toEqual([]);
});
