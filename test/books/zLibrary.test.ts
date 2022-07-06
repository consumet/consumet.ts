import { BOOKS } from '../../src/providers';

jest.setTimeout(120000);

test('should not be empty', async () => {
  const zlib = new BOOKS.ZLibrary();
  const res = await zlib.search('Infinite Jest');
  expect(res?.containers.length).not.toEqual(0);
});
