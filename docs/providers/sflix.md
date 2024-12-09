<h1>SFlix</h1>

```ts
const sflix = new MOVIES.SFlix();
```

<h2>Methods</h2>

- [search](#search)
- [fetchMediaInfo](#fetchmediainfo)
- [fetchEpisodeSources](#fetchepisodesources)
- [fetchEpisodeServers](#fetchepisodeservers)
- [fetchRecentMovies](#fetchrecentmovies)
- [fetchRecentTvShows](#fetchrecenttvshows)
- [fetchTrendingMovies](#fetchtrendingmovies)
- [fetchTrendingTvShows](#fetchtrendingtvshows)
- [fetchByCountry](#fetchbycountry)
- [fetchByGenre](#fetchbygenre)
- [fetchSpotlight](#fetchspotlight)


### search
> Note: This method is a subclass of the [`BaseParser`](https://github.com/consumet/extensions/blob/master/src/models/base-parser.ts) class. meaning it is available across most categories.


<h4>Parameters</h4>

| Parameter       | Type     | Description                                                                                                                                |
| --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| query           | `string` | query to search for. (*In this case, We're searching for `Vincenzo`*) |
| page (optional) | `number` | page number (default: 1)                                                                                                                   |

```ts
sflix.search("Vincenzo").then(data => {
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
      id: 'tv/free-vincenzo-hd-67955', // media id
      title: 'Vincenzo',
      url: 'https://sflix.to/tv/free-vincenzo-hd-67955',
      image: 'https://f.woowoowoowoo.net/resize/250x400/79/6b/796b32989cf1308b9e0619524af5b022/796b32989cf1308b9e0619524af5b022.jpg',
      releaseDate: '2021',
      seasons: undefined,
      type: 'TV Series'
    },
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
sflix.fetchMediaInfo("tv/free-vincenzo-hd-67955").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an anime info object (including the episodes). (*[`Promise<IMovieInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L243-L254)*)\
output:
```js
{
  id: 'tv/free-vincenzo-hd-67955',  // media id
  title: 'Vincenzo',
  url: 'https://sflix.to/tv/free-vincenzo-hd-67955', // media url
  cover: 'https://f.woowoowoowoo.net/resize/1200x600/54/ed/54ed3e2164e4efa4c9ccc248e03f0032/54ed3e2164e4efa4c9ccc248e03f0032.jpg',
  image: 'https://f.woowoowoowoo.net/resize/250x400/79/6b/796b32989cf1308b9e0619524af5b022/796b32989cf1308b9e0619524af5b022.jpg',
  description: 'Overview: At age of 8, Park Joo-Hyung went to Italy after he was adopted. He is now an adult and has the name of Vincenzo Cassano. He is lawyer, who works for the Mafia as a consigliere. Because of a war between mafia groups, he flies to South Korea. In Korea, he gets involved with lawyer Hong Cha-Young. She is the type of attorney who will do anything to win a case. Vincenzo Cassano falls in love with her. He also achieves social justice by his own way.',
  type: 'TV Series',
  releaseDate: '2021-02-20',
  genres: [ 'Action', 'Adventure', 'Crime' ],
  casts: ['Kwak Dong-yeon','Kim Yeo-jin',... ],
  tags: ['Watch Vincenzo Online Free','Vincenzo Online Free',...],
  production: 'Studio Dragon, Logos Film',
  country: 'South Korea',
  duration: '60 min',
  rating: 8.4,
  recommendations: [
    {
      id: 'tv/free-bank-under-siege-hd-116701',
      title: 'Bank Under Siege',
      image: 'https://f.woowoowoowoo.net/resize/250x400/d4/a1/d4a1645af4305ba1e800c2ddaaa9386e/d4a1645af4305ba1e800c2ddaaa9386e.jpg',
      duration: '',
      type: 'TV Series'
    },
    {...},
    ...
  ],
  episodes: [
    {
      id: '1167571', // episode id
      image: 'https://f.woowoowoowoo.net/resize/300x200/23/9b/239bbfb9c4fdac8645f46c5841002ca0/239bbfb9c4fdac8645f46c5841002ca0.jpg',
      title: 'Episode 1: Episode 1',
      number: 1,
      season: 1, 
      url: 'https://sflix.to/ajax/v2/episode/servers/1167571'
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
| server (optional) | [`StreamingServers`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L144-L157) | takes server enum as a parameter. *default: [`StreamingServers.VidCloud`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L150)* |


```ts
sflix.fetchEpisodeSources("1167571","tv/free-vincenzo-hd-67955",StreamingServers.Voe).then(data => {
  console.log(data);
})
```
returns a promise which resolves into an array of episode sources and subtitles. (*[`Promise<ISource>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L300-L306)*)\
output:
```js
{
  headers: { Referer: 'https://voe.sx/e/zm0wvpglgaww' },
  sources: [
    {
      url: 'https://delivery-node-8s8wso5f4w7ft6sg.voe-network.net/engine/hls2/01/05794/zm0wvpglgaww_,n,.urlset/master.m3u8?t=XtM-FU04H1OgbJj9hfRQVEw6YqkU7_UGKfnLPpm1eEk&s=1731158664&e=14400&f=28971882&node=delivery-node-8s8wso5f4w7ft6sg.voe-network.net&i=103.123&sp=2500&asn=138296',
      quality: 'default',
      isM3U8: true
    }
  ],
  subtitles: [
    {
      lang: 'thumbnails',
      url: 'https://voe.sx/engine/storyboard/zm0wvpglgaww?t=1'
    }
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
sflix.fetchEpisodeServers("1167571","tv/free-vincenzo-hd-67955").then(data => {
  console.log(data);
})
```
returns a promise which resolves into an array of episode servers. (*[`Promise<IEpisodeServer[]>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L115-L118)*)\
output:
```js
[
  {
    name: 'upcloud',
    url: 'https://sflix.to/watch-tv/free-vincenzo-hd-67955.4829542'
  },
  {
    name: 'vidcloud',
    url: 'https://sflix.to/watch-tv/free-vincenzo-hd-67955.4087001'
  },
  {
    name: 'voe',
    url: 'https://sflix.to/watch-tv/free-vincenzo-hd-67955.7823107'
  },
  {
    name: 'doodstream',
    url: 'https://sflix.to/watch-tv/free-vincenzo-hd-67955.4087002'
  },
  {
    name: 'mixdrop',
    url: 'https://sflix.to/watch-tv/free-vincenzo-hd-67955.6488473'
  }
]
```

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs/guides/movies.md#">back to movie providers list</a>)</p>

### fetchRecentMovies

```ts
sflix.fetchRecentMovies().then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of movies. (*[`Promise<IMovieResult[]>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L328-L336)*)\
output:
```js
[
   {
    id: 'movie/free-pedro-paramo-hd-116617',
    title: 'Pedro Páramo',
    url: 'https://sflix.to/movie/free-pedro-paramo-hd-116617',
    image: 'https://f.woowoowoowoo.net/resize/250x400/5f/7c/5f7c391f9c901097091670d168e7dee3/5f7c391f9c901097091670d168e7dee3.jpg',
    releaseDate: '2024',
    rating: '6',
    type: 'Movie'
  },
  {
    id: 'movie/free-at-ease-hd-116509',
    title: 'At Ease',
    url: 'https://sflix.to/movie/free-at-ease-hd-116509',
    image: 'https://f.woowoowoowoo.net/resize/250x400/2c/dc/2cdc43157b8033d3b0e019ea66a14631/2cdc43157b8033d3b0e019ea66a14631.jpg',
    releaseDate: '2024',
    rating: 'N/A',
    type: 'Movie'
  },
  {...},
]
```


### fetchRecentTvShows

```ts
sflix.fetchRecentTvShows().then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of tv shows. (*[`Promise<IMovieResult[]>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L328-L336)*)\
output:
```js
[
 {
    id: 'tv/free-volver-a-caer-hd-116710',
    title: 'Volver a caer',
    url: 'https://sflix.to/tv/free-volver-a-caer-hd-116710',
    image: 'https://f.woowoowoowoo.net/resize/250x400/f9/e5/f9e5e9b43f1f424c97f7d7d649e06041/f9e5e9b43f1f424c97f7d7d649e06041.jpg',
    season: 'S1',
    latestEpisode: 'E6',
    type: 'TV Series'
  },
  {
    id: 'tv/free-smile-code-hd-116707',
    title: 'Smile Code',
    url: 'https://sflix.to/tv/free-smile-code-hd-116707',
    image: 'https://f.woowoowoowoo.net/resize/250x400/f3/44/f34457e98df1a8a4c6b1de8ca655af60/f34457e98df1a8a4c6b1de8ca655af60.jpg',
    season: 'S1',
    latestEpisode: 'E4',
    type: 'TV Series'
  },
  {...},
]
```


### fetchTrendingMovies

```ts
sflix.fetchTrendingMovies().then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of movies. (*[`Promise<IMovieResult[]>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L328-L336)*)\
output:
```js
[
 {
    id: 'movie/free-terrifier-3-hd-115306',
    title: 'Terrifier 3',
    url: 'https://sflix.to/movie/free-terrifier-3-hd-115306',
    image: 'https://f.woowoowoowoo.net/resize/250x400/af/a3/afa3ad03decae892c1309e309be47734/afa3ad03decae892c1309e309be47734.jpg',
    releaseDate: '2024',
    rating: 'N/A',
    type: 'Movie'
  },
  {
    id: 'movie/free-venom-the-last-dance-hd-115885',
    title: 'Venom: The Last Dance',
    url: 'https://sflix.to/movie/free-venom-the-last-dance-hd-115885',
    image: 'https://f.woowoowoowoo.net/resize/250x400/38/d5/38d557d9a4f2622eb1a7f0f412a65cc5/38d557d9a4f2622eb1a7f0f412a65cc5.jpg',
    releaseDate: '2024',
    rating: 'N/A',
    type: 'Movie'
  },
  {...},
]
```


### fetchTrendingTvShows

```ts
sflix.fetchTrendingTvShows().then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of tv shows. (*[`Promise<IMovieResult[]>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L328-L336)*)\
output:
```js
[
{
    id: 'tv/free-the-street-hd-30049',
    title: 'The Street',
    url: 'https://sflix.to/tv/free-the-street-hd-30049',
    image: 'https://f.woowoowoowoo.net/resize/250x400/7f/39/7f3969a8e454c148ec67070e33fa0ce6/7f3969a8e454c148ec67070e33fa0ce6.jpg',
    season: 'S',
    latestEpisode: 'E',
    type: 'TV Series'
  },
  {
    id: 'tv/free-return-to-las-sabinas-hd-115321',
    title: 'Return to Las Sabinas',
    url: 'https://sflix.to/tv/free-return-to-las-sabinas-hd-115321',
    image: 'https://f.woowoowoowoo.net/resize/250x400/55/59/5559c88dc771ce5f29730fa8e318550d/5559c88dc771ce5f29730fa8e318550d.jpg',
    season: 'S1',
    latestEpisode: 'E25',
    type: 'TV Series'
  },
  {...},
]
```

### fetchByCountry

<h4>Parameters</h4>

| Parameter       | Type     | Description                                                             |
| --------------- | -------- | ----------------------------------------------------------------------- |
| country         | `string` | param to filter by country. (*In this case, We're filtering by `KR`*)   |
| page (optional) | `number` | page number (default: 1)                                                |

```ts
sflix.fetchByCountry('KR').then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of movies/tv series. (*[`Promise<ISearch<IMovieResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L233-L241)*)\
output:
```js
{
  currentPage: 1,
  hasNextPage: true,
  results: [
    {
      id: 'tv/free-mr-plankton-hd-116692',
      title: 'Mr. Plankton',
      url: 'https://sflix.to/tv/free-mr-plankton-hd-116692',
      image: 'https://f.woowoowoowoo.net/resize/250x400/fa/c4/fac4a2e8d7d65827bdb9a03ef9883353/fac4a2e8d7d65827bdb9a03ef9883353.jpg',
      type: 'TV Series',
      season: 'S1',
      latestEpisode: 'E10'
    },
    {
      id: 'tv/free-gangnam-b-side-hd-116608',
      title: 'Gangnam B-Side',
      url: 'https://sflix.to/tv/free-gangnam-b-side-hd-116608',
      image: 'https://f.woowoowoowoo.net/resize/250x400/4a/f2/4af2bc64b7f4615ff07ee6517ecd8d04/4af2bc64b7f4615ff07ee6517ecd8d04.jpg',
      type: 'TV Series',
      season: 'S1',
      latestEpisode: 'E2'
    },
    {...}
  ]
}
```

### fetchByGenre

<h4>Parameters</h4>

| Parameter       | Type     | Description                                                            |
| --------------- | -------- | ---------------------------------------------------------------------- |
| genre           | `string` | param to filter by genre. (*In this case, We're filtering by `drama`*) |
| page (optional) | `number` | page number (default: 1)                                               |

```ts
sflix.fetchByGenre('drama').then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of movies/tv series. (*[`Promise<ISearch<IMovieResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L233-L241)*)\
output:
```js
{
  currentPage: 1,
  hasNextPage: true,
  results: [
    {
      id: 'movie/free-caught-by-the-tides-hd-115933',
      title: 'Caught by the Tides',
      url: 'https://sflix.to/movie/free-caught-by-the-tides-hd-115933',
      image: 'https://f.woowoowoowoo.net/resize/250x400/ed/7e/ed7e90c1be61d7cbe614e51b1f95ba0b/ed7e90c1be61d7cbe614e51b1f95ba0b.jpg',
      type: 'Movie',
      rating: '6.4',
      releaseDate: '2024'
    },
    {
      id: 'movie/free-christmas-at-xander-point-hd-116575',
      title: 'Christmas at Xander Point',
      url: 'https://sflix.to/movie/free-christmas-at-xander-point-hd-116575',
      image: 'https://f.woowoowoowoo.net/resize/250x400/39/76/3976bfbff8d95c8675a3ad17c0cbefbf/3976bfbff8d95c8675a3ad17c0cbefbf.jpg',
      type: 'Movie',
      rating: '7.4',
      releaseDate: '2024'
    },
    {...}
  ]
}
```

### fetchSpotlight
  
  ```ts
  sflix.fetchSpotlight().then(data => {
    console.log(data);
  })
  ```

  returns a promise which resolves into an array of movies. (*[`Promise<ISearch<IMovieResult>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L328-L336)*)\
output:
```js

{
  results: [
    {
      id: 'movie/free-saturday-night-hd-114820',
      title: 'Saturday Night',
      url: 'https://sflix.to/movie/free-saturday-night-hd-114820',
      cover: 'https://f.woowoowoowoo.net/resize/1200x600/2f/1d/2f1d04e79daf8d69ab1eb4ab1574f91f/2f1d04e79daf8d69ab1eb4ab1574f91f.jpg',
      rating: '7.2',
      description: 'At 11:30pm on October 11, 1975, a ferocious troupe of young comedians and writers changed television forever. This is the story of what happened behind the ...',
      type: 'Movie'
    },
    {
      id: 'movie/free-megalopolis-hd-114703',
      title: 'Megalopolis',
      url: 'https://sflix.to/movie/free-megalopolis-hd-114703',
      cover: 'https://f.woowoowoowoo.net/resize/1200x600/fd/d7/fdd70eab48552734313737a7e38810b5/fdd70eab48552734313737a7e38810b5.jpg',
      rating: '5',
      description: 'Genius artist Cesar Catilina seeks to leap the City of New Rome into a utopian, idealistic future, while his opposition, Mayor Franklyn Cicero,...',
      type: 'Movie'
    },
    {...}
  ]
}
```