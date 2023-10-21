import { ANIME, IEpisodeServer } from "..";
import * as fs from 'fs/promises';


const main = async () => {
  const animeData = require('./gogoanime.json');
  const gogoanime = new ANIME.Gogoanime();
  let count = 0;

  for (const animeTitle in animeData) {
    count++;
    console.log(count);
    
    if (animeData.hasOwnProperty(animeTitle)) {
      const searchValue = animeData[animeTitle];

      // Define the file name based on the anime title
      const animeInfoFile = `gogoanime/${searchValue}.json`;

      try {
        // Check if the file already exists
        await fs.access(animeInfoFile);

        // If the file exists, skip fetching and saving data
        console.log(`File for ${animeTitle} already exists. Skipping.`);
      } catch (err) {
        // The file doesn't exist; fetch and save data
        const res = await gogoanime.fetchAnimeInfo(searchValue);

        // Create an array of episode information
        const episodes = res.episodes || [];

        // Fetch episode servers for all episodes concurrently
        const episodePromises = episodes.map(async (episode) => {
          const episodeURL = episode.url ? episode.url.split('/')[4] : '';
          if(episodeURL){
          const servers = await gogoanime.fetchEpisodeServers(episodeURL);
          return servers;
          } else {
            return [];
          }
        });

        // Wait for all episode servers to be fetched
        const episodeData: Array<IEpisodeServer[]> = await Promise.all(episodePromises);

        // Store anime information in a JSON file with the anime title
        await fs.writeFile(animeInfoFile, JSON.stringify(episodeData, null, 2));

        console.log(`Saved anime info for ${animeTitle} in ${animeInfoFile}`);
      }
    }
  }
};

main();
