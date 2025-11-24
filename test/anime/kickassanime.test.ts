import { ANIME } from '../../src/providers';

jest.setTimeout(120000);

const kickassanime = new ANIME.KickAssAnime();

test('Search: returns a filled array of anime list', async () => {
  const data = await kickassanime.search('Dandadan');
  expect(data.results).not.toEqual([]);
});

test('fetchAnimeInfo: returns a filled object of anime data', async () => {
  const data = await kickassanime.fetchAnimeInfo('naruto-f3cf');
  expect(data).not.toBeNull();
  expect(data.description).not.toBeNull();
  expect(data.episodes).not.toEqual([]);
});

test('fetchEpisodeServers: returns a filled array of episode servers', async () => {
  const data = await kickassanime.fetchEpisodeServers('naruto-f3cf/episode/ep-1-12cd96');
  expect(data).not.toEqual([]);
});

test('fetchEpisodeSources: returns a filled object of episode sources', async () => {
  const data = await kickassanime.fetchEpisodeSources('naruto-f3cf/episode/ep-1-12cd96');
  expect(data.sources).not.toEqual([]);
});
