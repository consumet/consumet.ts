import { COMICS } from '../../src/providers';

jest.setTimeout(120000);

test('just a test', async () => {
  const comics = new COMICS.GetComics();
  await comics.search('batman');
});
