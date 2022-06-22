import { COMICS } from '../../src/providers';

jest.setTimeout(120000);

test('GetComics returns the correct page and is not empty', async () => {
  const comics = new COMICS.GetComics();
  const data = await comics.search('batman', 3);
  expect(data.containers.length).not.toEqual(0);
});
