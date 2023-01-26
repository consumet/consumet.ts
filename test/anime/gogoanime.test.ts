import { ANIME } from '../../src/providers';

jest.setTimeout(120000);

const gogoanime = new ANIME.Gogoanime();

test('returns a filled array of anime list', async () => {
  const data = await gogoanime.search('spy x family');
  expect(data.results).not.toEqual([]);
});

test('returns a filled object of anime data', async () => {
  const data = await gogoanime.fetchAnimeInfo('spy-x-family');
  expect(data).not.toBeNull();
});

test('Returns genre info for gogoanime', async () => {
  const data = await gogoanime.fetchGenreInfo('cars', 2);
  expect(data).not.toEqual([]);
});

test('returns a filled array of servers', async () => {
  const data = await gogoanime.fetchEpisodeServers('spy-x-family-episode-9');
  expect(data).not.toEqual([]);
});

test('returns a filled object of episode sources', async () => {
  const data = await gogoanime.fetchEpisodeSources('spy-x-family-episode-9');
  expect(data.sources).not.toEqual([]);
});
