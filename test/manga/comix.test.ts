import { MANGA } from '../../src/providers';

jest.setTimeout(120000);

const comix = new MANGA.Comix();

test('Search: returns a filled array of manga.', async () => {
  const data = await comix.search('one piece');
  expect(data.results).not.toEqual([]);
});

test('fetchMangaInfo: returns filled manga info when given a mangaId.', async () => {
  const data = await comix.fetchMangaInfo('rm2xv-the-grand-dukes-bride-is-a-hellborn-warrior');
  expect(data).not.toEqual({});
  expect(data.title).not.toBeNull();
});

test('fetchChapterPages: returns filled page data when given a chapterId.', async () => {
  const data = await comix.fetchChapterPages(
    'rm2xv-the-grand-dukes-bride-is-a-hellborn-warrior/7288301-chapter-43'
  );
  expect(data).not.toEqual([]);
});
