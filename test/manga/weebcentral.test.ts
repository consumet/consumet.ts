import { MANGA } from '../../src/providers';

jest.setTimeout(120000);

const weebcentral = new MANGA.WeebCentral();

test('Search: returns a filled array of manga.', async () => {
  const data = await weebcentral.search('one piece');
  expect(data.results).not.toEqual([]);
});

test('fetchMangaInfo: returns filled manga info when given a mangaId.', async () => {
  const data = await weebcentral.fetchMangaInfo('01J76XY7VSG3R5ANYPDWTXDVP6/Kingdom');
  expect(data).not.toEqual({});
  expect(data.title).not.toBeNull();
});

test('fetchChapterPages: returns filled page data when given a chapterId.', async () => {
  const data = await weebcentral.fetchChapterPages('01K8VEAEHDBSVQ6PJ3MNBDH7D7');
  expect(data).not.toEqual([]);
});
