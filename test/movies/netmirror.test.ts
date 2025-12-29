import { MOVIES } from '../../src/providers';

jest.setTimeout(120000);

const netmirror = new MOVIES.NetMirror();

test('search: returns results for query', async () => {
  const data = await netmirror.search('wednesday');
  expect(data.results).not.toEqual([]);
});

test('fetchMediaInfo: returns info for valid id', async () => {
  const data = await netmirror.search('wednesday');
  const id = data.results[0].id;
  const info = await netmirror.fetchMediaInfo(id);
  expect(info).not.toEqual({});
  expect(info.id).toEqual(id);
});

test('fetchEpisodeSources: returns sources', async () => {
  const data = await netmirror.search('wednesday');
  const id = data.results[0].id;
  const info = await netmirror.fetchMediaInfo(id);
  const episodeId = info.episodes![0].id;
  const sources = await netmirror.fetchEpisodeSources(episodeId);
  expect(sources).not.toEqual({});
  expect(sources.sources).not.toEqual([]);
});

test('fetchEpisodeServers: returns servers', async () => {
  const data = await netmirror.search('wednesday');
  const id = data.results[0].id;
  const servers = await netmirror.fetchEpisodeServers(id);
  expect(servers).not.toEqual([]);
});
