<h1 align="center">Consumet Extensions</h1>

<h2>MOVIES</h2>

`MOVIES` is a category provider, which provides a list of movies/tv series providers. Each movie/tv series provider must be a subclass of the [`MovieParser`](https://github.com/consumet/extensions/blob/master/src/models/movie-parser.ts) class.

By using `MOVIES` category you can interact with the movie providers. And have access to the movie providers methods.

```ts
// ESM
import { MOVIES } from '@consumet/extensions';

// <providerName> is the name of the provider you want to use. list of the proivders is below.
const movieProvider = MOVIES.<providerName>();
```

## Movies Providers List
This list is in alphabetical order. (except the sub bullet points)

- [FlixHQ](../providers/flixhq.md)
  - [search](../providers/flixhq.md#search)
  - [fetchMediaInfo](../providers/flixhq.md#fetchmediainfo)
  - [fetchEpisodeSources](../providers/flixhq.md#fetchepisodesources)
  - [fetchEpisodeServers](../providers/flixhq.md#fetchepisodeservers)

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs">back to table of contents</a>)</p>