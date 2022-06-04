import { Libgen } from '../../src/providers/books/all';

jest.setTimeout(120000);

test('returns a filled array of libgen books', async () => {
  const libgen = new Libgen();
  const data = await libgen.search('Infinite Jest', 10);
  expect(data).not.toEqual([]);
});

test('returns a filled array of libgen books', async () => {
  const libgen = new Libgen();
  const data = await libgen.fastSearch('Atlas Shrugged', 10);
  expect(data).not.toEqual([]);
});
