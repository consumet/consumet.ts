import AnimeSama from '../../src/providers/anime/animesama';

async function testAnimeSama() {
  const animeId = 'gachiakuta';
  const season = 1;
  const episode = 17;
  const language = 'vf';//you can also use 'vostfr' for the sub

  console.log('Test Configuration:');
  console.log(`  Anime ID: ${animeId}`);
  console.log(`  Season: ${season}`);
  console.log(`  Episode: ${episode}`);
  console.log(`  Language: ${language}`);

  const animeSama = new AnimeSama();

  try {
    console.log('\nSearching for anime...');
    const searchResults = await animeSama.search(animeId);
    console.log(`\nFound ${searchResults.results.length} result(s)\n`);

    searchResults.results.forEach((result, index) => {
      console.log(`[${index + 1}] ${result.title}`);
      console.log(`    ID: ${result.id}`);
      console.log(`    URL: ${result.url}`);
      console.log(`    Image: ${result.image}`);
    });

    const episodeId = `${animeId}/saison${season}/${language}/${episode}`;

    console.log('\nExtracting M3U8 URL...');
    console.log(`Episode ID: ${episodeId}`);

    const sourceData = await animeSama.fetchEpisodeSources(episodeId, 'lpayer');
    // Pass any of the corresponding servers: 'vidmoly', 'movearnpre', 'sibnet', 'sendvid', 'lpayer', 'doodstream'
    // Example: await fetchEpisodeSources(episodeId, 'sibnet')
    // If no server is specified, it will use the default preference order: vidmoly > movearnpre > sibnet > sendvid > lpayer > doodstream

    console.log('\nSources:');
    sourceData.sources.forEach((source, index) => {
      console.log(`[${index + 1}] Quality: ${source.quality}`);
      console.log(`    URL: ${source.url}`);
      console.log(`    Is M3U8: ${source.isM3U8}`);
    });

    console.log('\nSuccess!');
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

testAnimeSama();
