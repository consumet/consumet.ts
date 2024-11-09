import { ANIME } from '../../src/providers';

jest.setTimeout(120000);

const monoschinos = new ANIME.MonosChinos();
const animeName = 'Jujutsu Kaisen';

test('returns a filled array of anime list', async () => {
  const data = await monoschinos.search(animeName);
  expect(data.results).not.toEqual([]);
});

test('returns a filled object of anime data', async () => {
  const res = await monoschinos.search(animeName);
  const data = await monoschinos.fetchAnimeInfo(res.results[3].id, 24);
  expect(data).not.toBeNull();
  expect(data.results).not.toEqual([]);
});

test('returns a filled object of episode sources', async () => {
  const res = await monoschinos.search(animeName);
  const info = await monoschinos.fetchAnimeInfo(res.results[0].id, 1);
  const data = await monoschinos.fetchEpisodeSources(info.episodes![0].id);
  console.log(data);
  expect(data.sources).not.toEqual([]);
  expect(data.subtitles).not.toEqual([]);
});
