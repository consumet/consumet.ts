import { META } from '../../src/providers';

jest.setTimeout(120000);

// run: yarn test --watch --verbose false demon.test.ts

const tmdb = new META.TMDB();

test('returns a filled object of anime data', async () => {
  const data = await tmdb.fetchMediaInfo('85937', 'tv');
  expect(data).not.toBeNull();
  expect(data.episodes).not.toEqual([]);
  expect(data.description).not.toBeNull();
});
