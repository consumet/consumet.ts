<h1>DramaCool</h1>

```ts
const dramacool = new MOVIES.DramaCool();
```

<h2>Methods</h2>

- [search](#search)
- [fetchMediaInfo](#fetchmediainfo)
- [fetchEpisodeSources](#fetchepisodesources)
- [fetchEpisodeServers](#fetchepisodeservers)
- [fetchPopular](#fetchpopular)
- [fetchRecentMovies](#fetchrecentmovies)
- [fetchRecentTvShows](#fetchrecenttvshows)
- [fetchSpotlight](#fetchspotlight)

### search
> Note: This method is a subclass of the [`BaseParser`](https://github.com/consumet/extensions/blob/master/src/models/base-parser.ts) class. meaning it is available across most categories.


<h4>Parameters</h4>

| Parameter       | Type     | Description                                                                                                                                |
| --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| query           | `string` | query to search for. (*In this case, We're searching for `Vincenzo`*)|
| page (optional) | `number` | page number (default: 1)                                                                                                                   |

```ts
dramacool.search("Vincenzo").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of movies/tv series. (*[`Promise<ISearch<IMovieResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L233-L241)*)\
output:
```js
{
  currentPage: 1, // current page number
  totalPages: 1,
  hasNextPage: false, // boolean to indicate if there's a next page
  results: [
    {
      id: 'drama-detail/vincenzo', // media id
      title: 'Vincenzo (2021)',
      url: 'https://dramacool.com.pa/drama-detail/vincenzo',
      image: 'https://asianimg.pro/cover/vincenzo.png'
    }
  ]
}
```

### fetchMediaInfo

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                                                                     |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| mediaId   | `string` | takes media id or url as a parameter. (*media id or url can be found in the media search results as shown on the above method*) |

```ts
dramacool.fetchMediaInfo("drama-detail/vincenzo").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an anime info object (including the episodes). (*[`Promise<IMovieInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L243-L254)*)\
output:
```js
{
  id: 'drama-detail/vincenzo',
  title: 'Vincenzo (2021)',
  status: 'Completed',
  genres: ['Comedy', 'Crime','Drama',...],
  otherNames: [ '빈센조', 'Binsenjo' ],
  image: 'https://asianimg.pro/cover/vincenzo.png',
  description: 'At the age of 8, Park Ju Hyeong is adopted and sent off to Italy.  Now an adult, he is known as Vincenzo Casano.',
  releaseDate: '2021',
  contentRating: '',
  airsOn: '',
  director: 'kim hee won [김희원]',
  originalNetwork: 'netflix; tvn',
  trailer: {
    url: 'https://www.youtube.com/embed/vO8rFbTtJNI',
    id: 'vO8rFbTtJNI'
  },
  characters: [
    {
      url: 'https://dramacool.com.pa/star/ok-taecyeon',
      imageUrl: 'https://asianimg.pro/star/ok-taecyeon.png',
      title: 'Ok Taecyeon (1988)'
    },
    {...},
      ...
  ],
  episodes: [
   {
      id: 'vincenzo-2021-episode-1',
      title: 'Episode 1',
      episode: 1,
      subType: 'SUB',
      releaseDate: '2021-02-20 07:17:21',
      url: 'https://dramacool.com.pa/vincenzo-2021-episode-1.html'
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
| server (optional) | [`StreamingServers`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L144-L157) | takes server enum as a parameter. *default: [`StreamingServers.AsianLoad`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L150)* |


```ts
dramacool.fetchEpisodeSources("vincenzo-2021-episode-1").then(data => {
  console.log(data);
})
```
returns a promise which resolves into an array of episode sources and subtitles. (*[`Promise<ISource>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L300-L306)*)\
output:
```js
{
  sources: [
    {
      url: 'https://hls017.vipdracdn.net/streamhls2024/db287e9dc37d8c5b67c2498e3ef07c5a/ep.1.v0.1678048676.m3u8',
      isM3U8: true
    },
    {
      url: 'https://hls017.drafastcdn.pro/newvideos/newhls/sfRdQu0XQEJlsVGMH1S5nA/1721846640/230926_202.179.72.206/db287e9dc37d8c5b67c2498e3ef07c5a/ep.1.v0.1678048676.m3u8',
      isM3U8: true
    }
  ],
  subtitles: [
    {
      url: 'https://asiancdn.com/images/db287e9dc37d8c5b67c2498e3ef07c5a/1.vtt',
      lang: 'Default (maybe)'
    }
  ],
  download: 'https://asianbxkiun.pro/download?id=MjMwOTI2&title=Vincenzo+%282021%29+episode+1&typesub=SUB' //only for AsianLoad
}
```

### fetchEpisodeServers

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                                                   |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| episodeId | `string` | take an episode id or url as a parameter. (*episode id or episode url can be found in the media info object*) |


```ts
dramacool.fetchEpisodeServers("vincenzo-2021-episode-1").then(data => {
  console.log(data);
})
```
returns a promise which resolves into an array of episode servers. (*[`Promise<IEpisodeServer[]>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L115-L118)*)\
output:
```js
[
  {
    name: 'asianload',
    url: 'https://plcool1.com/pl454545?id=MjMwOTI2&title=Vincenzo+%282021%29+episode+1&typesub=SUB'
  },
  {
    name: 'kvid',
    url: 'https://plcool1.com/embedplus?id=MjMwOTI2&token=SGWtnrSwuIw3RsQGPe5tRg&expires=1721846948'
  },
  { name: 'asianstream', url: '7YE2aUb7PNVD3bY8NDIYqg' },
  { name: 'streamwish', url: 'https://dwish.pro/e/dr1qk2hew1v8' },
  {
    name: 'streamtape',
    url: 'https://streamtape.com/e/plglOyRJPaTrOGP/vincenzo-2021-episode-1.mp4'
  },
  { name: 'doodstream', url: 'https://dood.wf/e/zh9uj55c901a' },
  { name: 'vidhide', url: 'https://dlions.pro/v/7thb1yedp816' }
]
```

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs/guides/movies.md#">back to movie providers list</a>)</p>

### fetchPopular

```ts
dramacool.fetchPopular.then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of movies. (*[`Promise<ISearch<IMovieResult>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L328-L336)*)\
output:
```js
{
  currentPage: 1,
  totalPages: 741,
  hasNextPage: true,
  results: [
    {
      id: 'drama-detail/is-it-fate',
      title: "Serendipity's Embrace (2024)",
      url: 'https://dramacool.com.pa/drama-detail/is-it-fate',
      image: 'https://asianimg.pro/cover/is-it-fate-1719896631.png'
    },
    {
      id: 'drama-detail/open-murder-contract',
      title: 'No Way Out: The Roulette (2024)',
      url: 'https://dramacool.com.pa/drama-detail/open-murder-contract',
      image: 'https://asianimg.pro/cover/open-murder-contract-1720405656.png'
    },
    {...}
  ]
}
```


### fetchRecentMovies

```ts
dramacool.fetchRecentMovies.then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of movies. (*[`Promise<ISearch<IMovieResult>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L328-L336)*)\
output:
```js
{
  currentPage: 1,
  totalPages: 207,
  hasNextPage: true,
  results: [
    {
      id: 'drama-detail/cross-',
      title: 'Mission Cross (2024)',
      url: 'https://dramacool.com.pa/mission-cross-2024-episode-1.html',
      image: 'https://asianimg.pro/cover/cross--1723170340.png'
    },
    {
      id: 'drama-detail/mentalese-express-2023',
      title: 'Mentalese Express (2023)',
      url: 'https://dramacool.com.pa/mentalese-express-2023-episode-1.html',
      image: 'https://asianimg.pro/cover/mentalese-express-2023-1723173905.png'
    },
    {...}
  ]
}
```


### fetchRecentTvShows

```ts
dramacool.fetchRecentTvShows.then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of movies. (*[`Promise<ISearch<IMovieResult>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L328-L336)*)\
output:
```js
{
  currentPage: 1,
  totalPages: 376,
  hasNextPage: true,
  results: [
    {
      id: 'drama-detail/kimi-to-yukite-saku-shinsengumi-seishunroku',
      title: 'Kimi to Yukite Saku: Shinsengumi Seishunroku (2024)',
      url: 'https://dramacool.com.pa/kimi-to-yukite-saku-shinsengumi-seishunroku-2024-episode-12.html',
      image: 'https://asianimg.pro/cover/kimi-to-yukite-saku-shinsengumi-seishunroku-1711089348.png',
      episodeNumber: '12'
    },
    {
      id: 'drama-detail/ayaka-chan-wa-hiroko-senpai-ni-koishiteru',
      title: 'Ayaka-chan wa Hiroko-senpai ni Koishiteru (2024)',
      url: 'https://dramacool.com.pa/ayaka-chan-wa-hiroko-senpai-ni-koishiteru-2024-episode-6.html',
      image: 'https://asianimg.pro/cover/ayaka-chan-wa-hiroko-senpai-ni-koishiteru-2024-1719580986.png',
      episodeNumber: '6'
    },
    {...}
  ]
}
```

### fetchSpotlight
  
  ```ts
  dramacool.fetchSpotlight().then(data => {
    console.log(data);
  })
  ```

  returns a promise which resolves into an array of movies. (*[`Promise<ISearch<IMovieResult>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L328-L336)*)\
output:
```js

{
  results: [
    {
      id: 'drama-detail/the-judge-from-hell',
      title: 'The Judge from Hell',
      url: 'https://asianc.co/drama-detail/the-judge-from-hell',
      cover: 'https://asianc.co/plugins/slideshow/slides/new/dramacool-the-judge-from-hell.png'
    },
    {
      id: 'drama-detail/mom-s-friend-s-son',
      title: 'Love Next Door',
      url: 'https://asianc.co/drama-detail/mom-s-friend-s-son',
      cover: 'https://asianc.co/plugins/slideshow/slides/new/dramacool-mom-s-friend-s-son.png'
    },
    {...}
  ]
```