import { info } from 'console';
import { ANIME } from '../../src/providers';

jest.setTimeout(120000);

const anix = new ANIME.Anix();

test('returns a filled array of anime list', async () => {
  const data = await anix.search('demon');
  expect(data.results).not.toEqual([]);
});

test('returns a filled object of anime data', async () => {
  const data = await anix.fetchAnimeInfo('kimi-wa-meido-sama');
  expect(data).not.toBeNull();
});

test('returns a filled object of random anime data', async () => {
  const data = await anix.fetchRandomAnimeInfo();
  expect(data).not.toBeNull();
});

test('returns a filled array of recent episodes', async () => {
  const data = await anix.fetchRecentEpisodes();
  expect(data).not.toEqual([]);
});

test('returns a filled object of anime data', async () => {
  const s = await anix.search('spy x family');
  const data = await anix.fetchAnimeInfo(s.results[0].id);
  expect(data).not.toBeNull();
});

test('returns a filled object of episode sources', async () => {
  const data = await anix.fetchEpisodeSources('douluo-dalu-ii-jueshi-tangmen', 'ep-76');
  expect(data.sources).not.toEqual([]);
  expect(data.subtitles).not.toEqual([]);
});

test('returns a filled array of servers', async () => {
  const data = await anix.fetchEpisodeServers('douluo-dalu-ii-jueshi-tangmen', 'ep-76');
  expect(data).not.toEqual([]);
});

test('returns a filled array of recent episodes (type: sub)', async () => {
  const data = await anix.fetchRecentEpisodes(1, 3);
  expect(data).not.toEqual([]);
});

test('returns a filled array of recent episodes (type: dub)', async () => {
  const data = await anix.fetchRecentEpisodes(1, 4);
  expect(data).not.toEqual([]);
});

test('returns a filled array of servers (type: all)', async () => {
  const data = await anix.fetchEpisodeServerType('dandadan', 'ep-11');
  expect(data).not.toEqual([]);
});

test('returns a filled array of servers (type: sub)', async () => {
  const data = await anix.fetchEpisodeServerType('dandadan', 'ep-11', 'sub');
  expect(data).not.toEqual([]);
});

test('returns a filled array of servers (type: dub)', async () => {
  const data = await anix.fetchEpisodeServerType('dandadan', 'ep-11', 'dub');
  expect(data).not.toEqual([]);
});

test('returns a filled array of servers (type: raw)', async () => {
  const data = await anix.fetchEpisodeServerType('dandadan', 'ep-11', 'raw');
  expect(data).not.toEqual([]);
});

test('returns a filled object of episode sources (type: sub)', async () => {
  const data = await anix.fetchEpisodeSources('dandadan', 'ep-11', undefined, 'sub');
  expect(data.sources).not.toEqual([]);
  expect(data.subtitles).not.toEqual([]);
});

test('returns a filled object of episode sources (type: dub)', async () => {
  const data = await anix.fetchEpisodeSources('dandadan', 'ep-11', undefined, 'dub');
  expect(data.sources).not.toEqual([]);
  expect(data.subtitles).not.toEqual([]);
});

test('returns a filled object of episode sources (type: raw)', async () => {
  const data = await anix.fetchEpisodeSources('dandadan', 'ep-11', undefined, 'raw');
  expect(data.sources).not.toEqual([]);
  expect(data.subtitles).not.toEqual([]);
});

test('returns a empty object of episode sources (type: invalid option)', async () => {
  const data = await anix.fetchEpisodeSources('dandadan', 'ep-11', undefined, 'invalid');
  expect(data.sources).toEqual([]);
});
