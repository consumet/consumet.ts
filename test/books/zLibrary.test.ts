import { BOOKS } from '../../src/providers';

jest.setTimeout(120000);

test('just testing', async () => {
  const zLibarry = new BOOKS.ZLibrary();
  await zLibarry.search('now');
});
