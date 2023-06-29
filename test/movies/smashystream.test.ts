import { MOVIES } from '../../src/providers';

jest.setTimeout(120000);

const seez = new MOVIES.Seez();

// test('returns a filled object of streaming movie servers', async () => {
//   const data = await seez.fetchEpisodeServers('1399', 1, 10);
//   expect(data).not.toEqual([]);
// });

//https://embed.smashystream.com/playere.php?tmdb=&season=1&episode=1

test('returns a filled object of streaming movie sources', async () => {
  const data = await seez.fetchEpisodeSources('95557', 1, 1, 'Player N');
  console.log(data);
  expect(data.sources).not.toEqual([]);
});
