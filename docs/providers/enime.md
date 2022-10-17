<h1>Enime</h1>

```ts
const enime = new ANIME.Enime();
```

<h2>Methods</h2>

- [search](#search)
- [fetchAnimeInfo](#fetchanimeinfo)
- [fetchEpisodeSources](#fetchepisodesources)

### search
> Note: This method is a subclass of the [`BaseParser`](https://github.com/consumet/extensions/blob/master/src/models/base-parser.ts) class. meaning it is available across most categories.


<h4>Parameters</h4>

| Parameter | Type     | Description                                                              |
| --------- | -------- | ------------------------------------------------------------------------ |
| query     | `string` | query to search for. (*In this case, We're searching for `Overlord IV`*) |
| page      | `number` | page number to search for.                                               |
| perPage   | `number` | number of results per page.                                              |

```ts
enime.search("Overlord IV").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of anime. (*[`Promise<ISearch<IAnimeResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L13-L26)*)\
output:
```js
{
  currentPage: 1,
  hasNextPage: true,
  results: [
    {
      id: 'cl6k4l2xt000nh4lu54mqankt',
      anilistId: 133844,
      malId: 48895,
      title: 'Overlord IV',
      image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx133844-E32FjKZ0XxEs.jpg',
      cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/133844-uIaUmh5aJX3M.jpg',
      releaseDate: 2022,
      description: 'The fourth season of <i>Overlord</i>.',
      genres: [ 'Action', 'Fantasy', 'Adventure' ],
      rating: 80,
      status: 'RELEASING',
      mappings: {
        mal: 48895,
        anidb: 16296,
        kitsu: 44529,
        anilist: 133844,
        thetvdb: 294002,
        anisearch: 14553,
        livechart: 10571,
        'notify.moe': 'LXvVrNCMg',
        'anime-planet': 'overlord-iv'
      }
    },
    {...},
    ...
  ]
}
```

### fetchAnimeInfo

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                                               |
| --------- | -------- | --------------------------------------------------------------------------------------------------------- |
| id        | `string` | takes anime id as a parameter. (*anime id can be found in the anime search results or anime info object*) |

```ts
enime.fetchAnimeInfo("cl6k4l2xt000nh4lu54mqankt").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an anime info object (including the episodes). (*[`Promise<IAnimeInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L28-L42)*)\
output:
```js
{
  id: 'cl6k4l2xt000nh4lu54mqankt',
  title: 'Overlord IV',
  anilistId: 133844,
  malId: 48895,
  image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx133844-E32FjKZ0XxEs.jpg',
  cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/133844-uIaUmh5aJX3M.jpg',
  season: 'SUMMER',
  releaseDate: 2022,
  duration: 24,
  popularity: 62892,
  description: 'The fourth season of <i>Overlord</i>.',
  genres: [ 'Action', 'Fantasy', '...' ],
  rating: 80,
  status: 'RELEASING',
  synonyms: [
    'Overlord 4',
    '...',
  ],
  mappings: {
    mal: 48895,
    anidb: 16296,
    kitsu: 44529,
    anilist: 133844,
    thetvdb: 294002,
    anisearch: 14553,
    livechart: 10571,
    'notify.moe': 'LXvVrNCMg',
    'anime-planet': 'overlord-iv'
  },
  episodes: [
   {
      id: 'cl6m9svrt380392sm8x1u89gzh',
      number: 6,
      title: 'The Impending Crisis'
    },
    {
      id: 'cl6k50hqt115332sob6ooreaol',
      number: 5,
      title: 'In Pursuit of the Land of Dwarves'
    },
    {...},
    ...
  ]
}
```

### fetchEpisodeSources

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                           |
| --------- | -------- | ------------------------------------------------------------------------------------- |
| episodeId | `string` | takes episode id as a parameter. (*episode id can be found in the anime info object*) |


In this example, we're getting the sources for the first episode of Overlord IV.
```ts
enime.fetchEpisodeSources("cl6m9svrt380392sm8x1u89gzh").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of episode sources. (*[`Promise<ISource>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L210-L214)*)\
output:
```js
{
  headers: {
    Referer: 'https://goload.io/streaming.php?id=MTkwMzEy&title=Overlord+IV+Episode+6'
  },
  sources: [
    {
      url: 'https://cache.387e6278d8e06083d813358762e0ac63.com/222844359429.m3u8',
      isM3U8: true
    }
  ]
}
```

Make sure to check the `headers` property of the returned object. It contains the referer header, which is needed to bypass the 403 error and allow you to stream the video without any issues.

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs/guides/anime.md#">back to anime providers list</a>)</p>
