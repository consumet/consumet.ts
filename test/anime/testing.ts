import { ANIME } from '../../src/providers';

async function getGenreInfo() {
    const gogoanime = new ANIME.Gogoanime();
    const data = await gogoanime.fetchGenreInfo('action', 1)
    console.log(data)
}

getGenreInfo()