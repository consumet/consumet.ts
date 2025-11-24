import { ANIME } from '../../src/providers';

jest.setTimeout(120000);

const gogoanime = new ANIME.Gogoanime();

test('Search: returns a filled array of anime list', async () => {
  const data = await gogoanime.search('one piece');
  expect(data.results).not.toEqual([]);
});

// TODO (zuhaz): implement the rest of the test functions for gogoanime

// test('fetchAnimeInfo: returns a filled object of anime data', async () => {
//   const res = await animesaturn.search('Tokyo Revengers');
//   const data = await animesaturn.fetchAnimeInfo(res.results[0].id);
//   expect(data).not.toBeNull();
//   expect(data.description).not.toBeNull();
//   expect(data.episodes).not.toEqual([]);
// });

// test('fetchEpisodeServers: returns a filled object of anime servers', async () => {
//   const res = await animesaturn.search('Tokyo Revengers');
//   const info = await animesaturn.fetchAnimeInfo(res.results[0].id);
//   const data = await animesaturn.fetchEpisodeServers(info.episodes![0].id);
//   expect(data).not.toEqual([]);
// });

// test('fetchEpisodeSources: returns a filled object of episode sources', async () => {
//   const res = await animesaturn.search('Tokyo Revengers');
//   const info = await animesaturn.fetchAnimeInfo(res.results[0].id);
//   const data = await animesaturn.fetchEpisodeSources(info.episodes![0].id);
//   expect(data.sources).not.toEqual([]);
// });
