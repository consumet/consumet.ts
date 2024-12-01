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

test('returns a filled array of recent episodes', async () => {
  const data = await anix.fetchRecentEpisodes();
  expect(data).not.toEqual([]);
});

test('returns a filled object of anime data', async () => {
  const s = await anix.search('spy x family');
  const data = await anix.fetchAnimeInfo(s.results[0].id);
  expect(data).not.toBeNull();
});
