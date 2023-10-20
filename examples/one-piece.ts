import { ANIME } from "..";
import * as fs from 'fs';

const main = async () => {
  const filePath: string = 'examples/Newanime.json'; // Replace with the actual JSON file path

  try {
    const fileContent: string = fs.readFileSync(filePath, 'utf-8');
    const animeData: Record<string, any> = JSON.parse(fileContent);

    for (const animeName in animeData) {
      if (animeData.hasOwnProperty(animeName)) {
        const animeInfo = animeData[animeName];
        
        // Create a new instance of the Zoro provider
        const zoro = new ANIME.Zoro();
        const aniwatchPageWithoutSlash = animeInfo.aniwatchPage.replace(/\//g, '');

        // Convert the data to a JSON string
        // const jsonData = JSON.stringify(data, null, 2); // Adding formatting for readability

        // Define the file path for each anime in the "zoro" folder
        const animeFilePath = `zoro/${animeInfo.aniwatchPage.replace(/\//g, '')}.json`;
        if (!fs.existsSync(animeFilePath)) {
          const data = await zoro.fetchAnimeInfo(aniwatchPageWithoutSlash);

          // Convert the data to a JSON string
          const jsonData = JSON.stringify(data, null, 2); // Adding formatting for readability

          // Write the data to the file
          fs.writeFileSync(animeFilePath, jsonData, 'utf-8');

          console.log(`Anime information for "${animeName}" has been written to ${animeFilePath}`);
        } else {
          console.log(`Anime information for "${animeName}" already exists, skipping.`);
        }
        // Write the data to the file
        // console.log(`Anime information for "${animeName}" has been written to ${animeFilePath}`);
      }
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

main();
