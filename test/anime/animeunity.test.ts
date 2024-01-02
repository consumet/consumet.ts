import { ANIME } from '../../src/providers';

jest.setTimeout(120000);

const animeunity = new ANIME.AnimeUnity()
const animeName = 'Jujutsu Kaisen 2';

test('returns a filled array of anime list', async () => {
    const data = await animeunity.search(animeName);
    expect(data.results).not.toEqual([]);
});

test('returns a filled object of anime data', async () => {
    const res = await animeunity.search(animeName);
    const data = await animeunity.fetchAnimeInfo(res.results[0].id);
    expect(data).not.toBeNull();
    expect(data.results).not.toEqual([]);
});

test('returns a filled object of episode sources', async () => {
    const res = await animeunity.search(animeName);
    const info = await animeunity.fetchAnimeInfo(res.results[0].id);
    const data = await animeunity.fetchEpisodeSources(info.episodes![0].id)
    expect(data.sources).not.toEqual([]);
});
