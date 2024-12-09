import { StreamingServers } from '../../src/models';
import { MOVIES } from '../../src/providers';

jest.setTimeout(120000);

const sflix = new MOVIES.SFlix();

test('returns a filled array of movies/tv', async () => {
  const data = await sflix.search('vincenzo');
  expect(data.results).not.toEqual([]);
});

test('returns a filled object of movies/tv data', async () => {
  const data = await sflix.fetchMediaInfo('tv/free-vincenzo-hd-67955');
  expect(data.description).not.toEqual('');
  expect(data.episodes).not.toEqual([]);
});

test('returns a filled object of streaming sources', async () => {
  const episodeSources = await sflix.fetchEpisodeSources(
    '1167571',
    'tv/free-vincenzo-hd-67955',
    StreamingServers.Voe
  );
  expect(episodeSources.sources).not.toEqual([]);
  expect(episodeSources.subtitles).not.toEqual([]);
});

test('returns a filled object of movies/tv data by country', async () => {
  const data = await sflix.fetchByCountry('KR');
  expect(data.results).not.toEqual([]);
});

test('returns a filled object of movies/tv data by genre', async () => {
  const data = await sflix.fetchByGenre('drama');
  expect(data.results).not.toEqual([]);
});

test('fetchSpotlight: returns a filled array of spotlight movies/TV.', async () => {
  const data = await sflix.fetchSpotlight();
  expect(data.results).not.toEqual([]);
});
