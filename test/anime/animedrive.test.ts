import { ANIME } from '../../src/providers';

jest.setTimeout(120000);

const animedrive = new ANIME.AnimeDrive();

test('returns a filled array of anime list', async () => {
  const animedrive = new ANIME.AnimeDrive();
  const data = await animedrive.search('demon');
  expect(data.results).not.toEqual([]);
});

test('returns a filled object of anime data', async () => {
  const res = await animedrive.search('ZOMBIE LAND SAGA');
  const data = await animedrive.fetchAnimeInfo(res.results[0].id);
  expect(data).not.toBeNull();
  expect(data.description).not.toBeNull();
  expect(data.episodes).not.toEqual([]);
});

test('returns a filled object of episode sources', async () => {
  const data = await animedrive.fetchEpisodeSources('?id=974&ep=12');
  expect(data.sources).not.toEqual([]);
});
