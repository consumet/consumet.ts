import { MOVIES } from '../../src/providers';

jest.setTimeout(120000);

const seez = new MOVIES.Seez();

test('returns a filled object of streaming movie servers', async () => {
  const data = await seez.fetchEpisodeServers('1399', 1, 10);
  expect(data).not.toEqual([]);
});
//https://embed.smashystream.com/playere.php?tmdb=&season=1&episode=10

// test('returns a filled object of streaming movie sources', async () => {
//   const data = await goku.fetchEpisodeSources('1064170', 'watch-movie/watch-batman-begins-19636');
//   expect(data.sources).not.toEqual([]);
// });
