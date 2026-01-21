"use strict";

const express = require('express');
const app = express();
const PORT = 3000;

// Import the NetMirror class from the built TypeScript file
const { MOVIES } = require('./dist');
const netMirror = new MOVIES.NetMirror();

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'NetMirror API',
    endpoints: {
      '/home': 'Home page',
      '/search/:query': 'Search for movies/shows',
      '/media/:id': 'Fetch media info',
      '/servers/:episodeId': 'Fetch episode servers',
      '/sources/:episodeId': 'Fetch episode sources',
      '/hls/:episodeId': 'Fetch HLS playlist',
      '/recent': 'Fetch recent movies',
      '/trending': 'Fetch trending movies',
      '/billboard': 'Fetch billboard/featured content',
    },
  });
});

app.get('/home', (req, res) => {
  res.json({
    message: 'Welcome to NetMirror API',
    provider: 'NetMirror',
    baseUrl: netMirror.baseUrl,
  });
});

app.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const results = await netMirror.search(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/media/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mediaInfo = await netMirror.fetchMediaInfo(id);
    res.json(mediaInfo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/servers/:episodeId', async (req, res) => {
  try {
    const { episodeId } = req.params;
    const servers = await netMirror.fetchEpisodeServers(episodeId);
    res.json(servers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/sources/:episodeId', async (req, res) => {
  try {
    const { episodeId } = req.params;
    const sources = await netMirror.fetchEpisodeSources(episodeId);
    res.json(sources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/hls/:episodeId', async (req, res) => {
  try {
    const { episodeId } = req.params;
    const hlsPlaylist = await netMirror.fetchHlsPlaylist(episodeId);
    res.type('application/vnd.apple.mpegurl').send(hlsPlaylist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/recent', async (req, res) => {
  try {
    const recentMovies = await netMirror.fetchRecentMovies();
    res.json(recentMovies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/trending', async (req, res) => {
  try {
    const trendingMovies = await netMirror.fetchTrendingMovies();
    res.json(trendingMovies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/billboard', async (req, res) => {
  try {
    const billboard = await netMirror.fetchBillboard();
    res.json(billboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`NetMirror API running on http://localhost:${PORT}`);
});

// Export for testing
module.exports = { app };