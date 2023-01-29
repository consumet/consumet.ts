import { ANIME } from '../src';

const main = async () => {
  // Create a new instance of the Gogoanime provider
  const gogoanime = new ANIME.Gogoanime();
  try{
    // try to get anime info
    const results = await gogoanime.fetchAnimeInfo('saikyou-onmyouji-no-isekai-tenseiki');
    console.log(results);
    return results;
  }catch{
    // get new id and try again (default will be episode 1 i think)
    const anime_id=await gogoanime.fetchAnimeInfoIdFromEpisodesPage('saikyou-onmyouji-no-isekai-tenseiki-episode-4');
    const results = await gogoanime.fetchAnimeInfo(anime_id);
    console.log(results);
  }
  

};

main();
