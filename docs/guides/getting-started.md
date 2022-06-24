<h1 align="center">Consumet Extensions</h1>

## Getting Started

Hello! Thank you for checking out Consumet Extensions!

This document aims to be a gentle introduction to the library and its usage.

Let's start!

### Installation
Install with npm:
```bash
npm i @consumet/extensions
```
Install with yarn:
```bash
yarn add @consumet/extensions
```

### Usage

searching for a book using the libgen provider.
```ts
// ESM
import { BOOKS } from "@consumet/extensions"
// CommonJS
const { BOOKS } = require("@consumet/extensions");

const main = async () => {
  // Create a new instance of the Libgen provider
  const books = new BOOKS.Libgen();
  // Search for a book. In this case, "Pride and Prejudice"
  const results = await books.search('pride and prejudice');
  // Print the results
  console.log(results);
  // Get the first book info
  const firstBook = results[0];
  const bookInfo = await books.scrapePage(firstBook.link);
  // Print the info
  console.log(bookInfo);
};

main();
```
searching for anime using the gogoanime provider.
```ts
// ESM
import { ANIME } from "@consumet/extensions"
// CommonJS
const { ANIME } = require("@consumet/extensions");

const main = async () => {
  // Create a new instance of the Gogoanime provider
  const gogoanime = new ANIME.Gogoanime();
  // Search for a anime. In this case, "One Piece"
  const results = await gogoanime.search("One Piece");
  // Print the results
  console.log(results);
  // Get the first anime info
  const firstAnime = results[0];
  const animeInfo = await gogoanime.fetchAnimeInfo(firstAnime.id);
  // Print the info
  console.log(animeInfo);
  // get the first episode stream link. By default, it chooses goload server.
  const episodes = await gogoanime.fetchEpisodeSources(animeInfo.episodes[0].id);
  // get the available streaming servers for the first episode
  const streamingServers = await gogoanime.fetchEpisodeServers(episodes[0].id);
}
``` 
see also the [anime providers documentation](./anime.md#anime) for more information.

Awesome, that was easy.

if you want to use different providers, you can check the providers list [here](https://github.com/consumet/providers-status/blob/main/providers-list.json).

if you have any questions, please join the [discord server](https://discord.gg/qTPfvMxzNH) or open an [issue](https://github.com/consumet/extensions/issues).

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs">back to table of contents</a>)</p>


