import { LIGHT_NOVEL } from '../../src/providers';

jest.setTimeout(120000);

test('returns a filled array of light novels', async () => {
  const readlightnovels = new LIGHT_NOVEL.en.ReadLightNovels();
  const data = await readlightnovels.search('slime');
  expect(data.results).not.toEqual([]);
});

test('returns a filled object of light novel info', async () => {
  const readlightnovels = new LIGHT_NOVEL.en.ReadLightNovels();
  const data = await readlightnovels.fetchLighNovelInfo(
    'https://readlightnovels.net/tensei-shitara-slime-datta-ken.html'
  );
  expect(data.chapters).not.toEqual([]);
  expect(data.description).not.toEqual('');
});
