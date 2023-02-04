import { LIGHT_NOVELS } from '../../src/providers';

jest.setTimeout(120000);

const anify = new LIGHT_NOVELS.Anify();

test('returns a filled array of light novels', async () => {
  const data = await anify.search('slime');
  expect(data.results).not.toEqual([]);
});