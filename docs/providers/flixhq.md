<h1>FlixHQ</h1>

```ts
const flixhq = new MOVIES.FlixHQ();
```

<h2>Methods</h2>

- [search](#search)
- [fetchMediaInfo](#fetchmediainfo)
- [fetchEpisodeSources](#fetchepisodesources)
- [fetchEpisodeServers](#fetchepisodeservers)

### search
> Note: This method is a subclass of the [`BaseParser`](https://github.com/consumet/extensions/blob/master/src/models/base-parser.ts) class. meaning it is available across most categories.


<h4>Parameters</h4>

| Parameter       | Type     | Description                                                                                                                                |
| --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| query           | `string` | query to search for. (*In this case, We're searching for `Vincenzo`*) P.S: `vincenzo` is a really good korean drama i highly recommend it. |
| page (optional) | `number` | page number (default: 1)                                                                                                                   |

```ts
flixhq.search("Vincenzo").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of movies/tv series. (*[`Promise<ISearch<IMovieResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L233-L241)*)\
output:
```js
{
  currentPage: 1, // current page
  hasNextPage: false, // if there is a next page
  results: [
    {
      id: 'tv/watch-vincenzo-67955', // media id
      title: 'Vincenzo',
      url: 'https://flixhq.to/tv/watch-vincenzo-67955', // media url
      image: 'https://img.flixhq.to/xxrz/250x400/379/79/6b/796b32989cf1308b9e0619524af5b022/796b32989cf1308b9e0619524af5b022.jpg',
      type: 'TV Series'
    }
    {...},
    ...
  ]
}
```

### fetchMediaInfo

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                                                                     |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| mediaId   | `string` | takes media id or url as a parameter. (*media id or url can be found in the media search results as shown on the above method*) |

```ts
flixhq.fetchMediaInfo("tv/watch-vincenzo-67955").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an anime info object (including the episodes). (*[`Promise<IMovieInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L243-L254)*)\
output:
```js
{
  id: 'tv/watch-vincenzo-67955', // media id
  title: 'Vincenzo',
  url: 'https://flixhq.to/tv/watch-vincenzo-67955', // media url
  image: 'https://img.flixhq.to/xxrz/250x400/379/79/6b/796b32989cf1308b9e0619524af5b022/796b32989cf1308b9e0619524af5b022.jpg',
  description: '\n' +
    '        At age of 8, Park Joo-Hyung went to Italy after he was adopted. He is now an adult and has the name of Vincenzo Cassano. ...\n' +
    '    ',
  type: 'TV Series',
  releaseDate: '2021-02-20',
  genres: [ 'Action', 'Adventure', '...' ],
  casts: [
    'Kwak Dong-yeon',
    'Kim Yeo-jin',
      ...
  ],
  tags: [
    'Watch Vincenzo Online Free,',
    'Vincenzo Online Free,',
    ...
  ],
  production: 'Studio Dragon',
  duration: '60 min',
  rating: 8.4,
  episodes: [
    {
      id: '1167571',
      title: 'Eps 1: Episode #1.1',
      number: 1,
      season: 1, // the number of episodes resets to 1 every season
      url: 'https://flixhq.to/ajax/v2/episode/servers/1167571'
    },
    {...},
    ...
  ]
}
```

### fetchEpisodeSources

<h4>Parameters</h4>

| Parameter         | Type                                                                                                 | Description                                                                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| episodeId         | `string`                                                                                             | takes episode id as a parameter. (*episode id can be found in the media info object*)                                                                      |
| mediaId           | `string`                                                                                             | takes media id as a parameter. (*media id can be found in the media info object*)                                                                          |
| server (optional) | [`StreamingServers`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L76-L82) | takes server enum as a parameter. *default: [`StreamingServers.VidCloud`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L76-L82)* |


```ts
flixhq.fetchEpisodeSources("1167571", "tv/watch-vincenzo-67955").then(data => {
  console.log(data);
})
```
returns a promise which resolves into an array of episode sources and subtitles. (*[`Promise<ISource>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L210-L214)*)\
output:
```js
{
  headers: { Referer: 'https://rabbitstream.net/embed-4/gBOHFKQ0sOxE?z=' },
  sources: [
    {
      url: 'https://b-g-ca-5.feetcdn.com:2223/v2-hls-playback/01b3e0bf48e643923f849702a32bd97a5c4360797759b0838c8f34597271ed8bf541e616b85a255a1320417863fe198040e65edb91d55f65c2f187d38c159aac95365664aa55f6121e784c83e8719033f811224effd0aefb9b88c77caf71b2d8943454dee7f505d5e1aae5f70dea1472a541a7c283a37782ea8253b156aad0f83701ef208196d2a5b75a864b6d6e3a2d454e55ea1885f3d5df798053a843cc223d6e41ecb1af3f6d6a07fc72a41bce18/playlist.m3u8',
      isM3U8: true
    }
  ],
  subtitles: [
    {
      url: 'https://cc.1clickcdn.ru/26/7f/267fbca84e18437aa7c7df80179b0751/ara-3.vtt',
      lang: 'Arabic - Arabic'
    },
    {
      url: 'https://cc.1clickcdn.ru/26/7f/267fbca84e18437aa7c7df80179b0751/chi-4.vtt',
      lang: 'Chinese - Chinese Simplified'
    },
    {...}
    ...
  ]
}
```

### fetchEpisodeServers

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                                                   |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| episodeId | `string` | take an episode id or url as a parameter. (*episode id or episode url can be found in the media info object*) |
| mediaId   | `string` | takes media id as a parameter. (*media id can be found in the media info object*)                             |

```ts
flixhq.fetchEpisodeServers('1167571', 'tv/watch-vincenzo-67955').then(data => {
  console.log(data);
})
```
returns a promise which resolves into an array of episode servers. (*[`Promise<IEpisodeServer[]>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L54-L57)*)\
output:
```js
[
  {
    name: 'upcloud',
    url: 'https://flixhq.to/watch-tv/watch-vincenzo-67955.4829542'
  },
  {
    name: 'vidcloud',
    url: 'https://flixhq.to/watch-tv/watch-vincenzo-67955.4087001'
  },
  {
    name: 'streamlare',
    url: 'https://flixhq.to/watch-tv/watch-vincenzo-67955.7041439'
  },
  {
    name: 'voe',
    url: 'https://flixhq.to/watch-tv/watch-vincenzo-67955.7823107'
  },
  {...},
   ...
]
```

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs/guides/movies.md#">back to movie providers list</a>)</p>
