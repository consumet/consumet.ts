import { MANGA } from '../../src/providers';

jest.setTimeout(120000);

const mangahost = new MANGA.MangaHost();

test('returns a filled array of manga', async () => {
  const data = await mangahost.search('punpun');
  console.log(data.results);

  const manga = await mangahost.fetchMangaInfo('oyasumi-punpun-mh34076');
  console.log(manga);

  const chapterImages = await mangahost.fetchChapterPages('oyasumi-punpun-mh34076', '1');
  console.log(chapterImages);

  expect(data.results).not.toEqual([]);
});
