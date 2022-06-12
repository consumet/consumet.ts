import { MANGA } from '../../src/providers';

jest.setTimeout(120000);

test('returns a filled array of manga', async () => {
  const mangadex = new MANGA.all.MangaDex();
  const data = await mangadex.search('one piece');
  expect(data.results).not.toEqual([]);
});
