import { ANIME } from '../../src/providers';

jest.setTimeout(120000);

const animesama = new ANIME.AnimeSama();
//The Provider is working , thing is that got-scraping hadergener doesnt work well with jest environment, use the test file i made
test('fetchAnimeInfo: returns a filled object of anime data', async () => {
  const data = await animesama.fetchAnimeInfo('gachiakuta');
  expect(data).not.toBeNull();
  expect(data).toHaveProperty('id');
  expect(data).toHaveProperty('title');
  expect(data).toHaveProperty('episodes');
  expect(data.episodes).toBeInstanceOf(Array);
  expect(data.episodes!.length).toBeGreaterThan(0);
});

test('fetchEpisodeServers: returns a filled array of episode servers', async () => {
  const info = await animesama.fetchAnimeInfo('gachiakuta');

  expect(info.episodes).toBeDefined();
  expect(info.episodes!.length).toBeGreaterThan(0);

  const servers = await animesama.fetchEpisodeServers(info.episodes![0].id);
  expect(servers).toBeInstanceOf(Array);
  expect(servers.length).toBeGreaterThan(0);
  expect(servers[0]).toHaveProperty('name');
  expect(servers[0]).toHaveProperty('url');
});

test('fetchEpisodeSources: returns a filled object of episode sources', async () => {
  const info = await animesama.fetchAnimeInfo('gachiakuta');

  expect(info.episodes).toBeDefined();
  expect(info.episodes!.length).toBeGreaterThan(0);

  const data = await animesama.fetchEpisodeSources(info.episodes![0].id);
  expect(data).toHaveProperty('sources');
  expect(data.sources).toBeInstanceOf(Array);
  expect(data.sources.length).toBeGreaterThan(0);
  expect(data.sources[0]).toHaveProperty('url');
  expect(data.sources[0]).toHaveProperty('quality');
  expect(data.sources[0]).toHaveProperty('isM3U8');
});
