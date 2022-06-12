import { BOOKS } from '../../src/providers';

jest.setTimeout(120000);

test('returns a filled array of libgen books', async () => {
  const libgen = new BOOKS.Libgen();
  const data = await libgen.search('Infinite Jest', 10);
  expect(data).not.toEqual([]);
});

test('returns a filled array of libgen books', async () => {
  const libgen = new BOOKS.Libgen();
  const data = await libgen.fastSearch('Atlas Shrugged', 10);
  expect(data).not.toEqual([]);
});

test('returns a filled array of ligen books', async () => {
  const ligen = new BOOKS.Libgen();
  const data = await ligen.scrapePage(
    'http://libgen.rs/search.php?req=pokemon&lg_topic=libgen&open=0&view=simple&res=25&phrase=1&column=def'
  );
  expect(data.length).not.toEqual(0);
});

test('returns a filled array of ligen books', async () => {
  const ligen = new BOOKS.Libgen();
  const data = await ligen.fastScrapePage(
    'http://libgen.rs/search.php?req=pokemon&lg_topic=libgen&open=0&view=simple&res=25&phrase=1&column=def'
  );
  expect(data.length).not.toEqual(0);
});

test('does nothing', async () => {
  const libgen = new BOOKS.Libgen();
  const data = await libgen.scrapeBook(
    'http://libgen.rs/book/index.php?md5=511972AA87FD4DA91350A6079F887588'
  );
  expect(data).not.toBeNull();
});
