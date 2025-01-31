<h1>MultiMovies</h1>

```ts
const multimovies = new MOVIES.MultiMovies();
```

<h2>Methods</h2>

- [search](#search)
- [fetchMediaInfo](#fetchmediainfo)
- [fetchEpisodeSources](#fetchepisodesources)
- [fetchEpisodeServers](#fetchepisodeservers)
- [fetchPopular](#fetchpopular)
- [fetchByGenre](#fetchbygenre)

### search
> Note: This method is a subclass of the [`BaseParser`](https://github.com/consumet/extensions/blob/master/src/models/base-parser.ts) class. meaning it is available across most categories.


<h4>Parameters</h4>

| Parameter       | Type     | Description                                                                                                                                |
| --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| query           | `string` | query to search for. (*In this case, We're searching for `jujutsu kaisen`*)|
| page (optional) | `number` | page number (default: 1)                                                                                                                   |

```ts
multimovies.search("jujutsu kaisen").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of movies/tv series. (*[`Promise<ISearch<IMovieResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L233-L241)*)\
output:
```js
{
  currentPage: 1,
  hasNextPage: false,
  results: [
    {
      id: 'movies/jujutsu-kaisen-0/', //media id
      title: 'Jujutsu Kaisen 0',
      url: 'https://multimovies.lat/movies/jujutsu-kaisen-0/',
      image: 'https://multimovies.lat/wp-content/uploads/2023/04/23oJaeBh0FDk2mQ2P240PU9Xxfh-150x150.jpg',
      rating: 7.8,
      releaseDate: '2021',
      description: 'Yuta Okkotsu is a nervous high school student who is suffering from a serious problem—his childhood friend Rika has turned into a curse and won’t leave him alone. Since Rika is no ordinary curse, ...',
      type: 'Movie'
    },
  ]
}
```

### fetchMediaInfo

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                                                                     |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| mediaId   | `string` | takes media id or url as a parameter. (*media id or url can be found in the media search results as shown on the above method*) |

```ts
multimovies.fetchMediaInfo('tvshows/jujutsu-kaisen/').then(data => {
  console.log(data);
})
```

returns a promise which resolves into an anime info object (including the episodes). (*[`Promise<IMovieInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L243-L254)*)\
output:
```js
{
  id: 'tvshows/jujutsu-kaisen/', //media id
  title: 'Jujutsu Kaisen',
  url: 'https://multimovies.lat/tvshows/jujutsu-kaisen/',
  cover: 'https://image.tmdb.org/t/p/original/nIHp6fz2MX33blJKYa9BSbhct7W.jpg',
  image: 'https://multimovies.lat/wp-content/uploads/2024/01/fHpKWq9ayzSk8nSwqRuaAUemRKh-200x300.jpg',
  description: '',
  type: 'TV Series',
  releaseDate: 'Oct. 03, 2020',
  trailer: {
    id: 'f8JWhakG2Pc',
    url: 'https://www.youtube.com/embed/f8JWhakG2Pc?autoplay=0&autohide=1'
  },
  genres: [
    'Action & Adventure',
    'Animation',...
  ],
  characters: [
    {
      url: 'https://multimovies.lat/cast/junya-enoki/',
      image: 'https://image.tmdb.org/t/p/w92/vBnNL3Jqy0zkS3ZgsXZmvDM9Dfz.jpg',
      name: 'Junya Enoki',
      character: 'Yuji Itadori (voice)'
    },
    {...},
      ...
  ],
  country: '',
  duration: '',
  rating: 9.4,
  recommendations: [
    {
      id: 'tvshows/knuckles/',
      title: 'Knuckles',
      image: 'https://multimovies.lat/wp-content/uploads/2024/04/w88Obs6wAdhlmYziKXz8EsKDmJs-185x278.jpg',
      type: 'Movie'
    },
    {...},
    ...
    ],
  episodes: [
   {
      id: 'episodes/jujutsu-kaisen-1x1/',  //episode id
      season: 1,
      number: 1,
      title: 'Ryomen Sukuna',
      url: 'https://multimovies.lat/episodes/jujutsu-kaisen-1x1/',
      releaseDate: 'Oct. 03, 2020',
      image: 'https://multimovies.lat/wp-content/uploads/2023/04/veG3J8KaBudM8omuGi58fYOMDTz-300x170.jpg'
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
| server (optional) | [`StreamingServers`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L144-L157) | takes server enum as a parameter. *default: [`StreamingServers.StreamWish`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L150)* |


```ts
multimovies.fetchEpisodeSources('episodes/jujutsu-kaisen-1x1/').then(data => {
  console.log(data);
})
```
returns a promise which resolves into an array of episode sources and subtitles. (*[`Promise<ISource>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L300-L306)*)\
output:
```js
{
  headers: { Referer: 'https://hlswish.com/e/v8k4m560gcra' },
  sources: [
    {
      quality: 'default',
      url: 'https://wydwcbdskx.cdn-centaurus.com/hls2/01/04908/v8k4m560gcra_,l,n,h,.urlset/master.m3u8?t=__wsgELMAIU3gmmoU1Ql5pHJej0EusGAtojLX_3N7r4&s=1734874347&e=129600&f=24540091&srv=Gy4KXLg7mXRDXE7k&i=0.4&sp=500&p1=Gy4KXLg7mXRDXE7k&p2=Gy4KXLg7mXRDXE7k&asn=138296',
      isM3U8: true
    },
    {
      quality: 'backup',
      url: 'https://wydwcbdskx.cdn-centaurus.com/hls2/01/04908/v8k4m560gcra_,l,n,h,.urlset/master.m3u8?t=__wsgELMAIU3gmmoU1Ql5pHJej0EusGAtojLX_3N7r4&s=1734874347&e=129600&f=24540091&srv=Gy4KXLg7mXRDXE7k&i=0.4&sp=500&p1=Gy4KXLg7mXRDXE7k&p2=Gy4KXLg7mXRDXE7k&asn=138296',
      isM3U8: true
    }
  ],
  subtitles: [
    {
      lang: 'thumbnails',
      url: 'https://streamwish.com/dl?op=get_slides&length=1437&url=https://akumachi.com/v8k4m560gcra0000.jpg'
    },
    {
      lang: 'English',
      url: 'https://Gy4KXLg7mXRDXE7k.premilkyway.com/vtt/01/04908/v8k4m560gcra_eng.vtt'
    }
  ]
}
```

### fetchEpisodeServers

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                                                   |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| episodeId | `string` | take an episode id or url as a parameter. (*episode id or episode url can be found in the media info object*) |


```ts
multimovies.fetchEpisodeServers("vincenzo-2021-episode-1").then(data => {
  console.log(data);
})
```
returns a promise which resolves into an array of episode servers. (*[`Promise<IEpisodeServer[]>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L115-L118)*)\
output:
```js
[
  { name: 'VidHide', url: 'https://vidhidehub.com/v/52x28ai7sy75' },
  { name: 'StreamWish', url: 'https://hlswish.com/e/v8k4m560gcra' },
  { name: 'OneUpload', url: 'https://oneupload.to/embed-x4ehvd3l0fm2' },
  { name: 'Vid-guard', url: 'https://listeamed.net/e/NMRLEprjYAY5XaG' },
  { name: 'MixDrop', url: 'https://mixdrop.ag/e/z19wdvwztv3ew0' },
  { name: 'Playerx', url: 'https://boosterx.stream/v/fOSJdaFYrqKG' },
  {name: 'Streamtape',url: 'https://streamtape.site/e/eg36VZgKoqI2kj'}
]
```

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs/guides/movies.md#">back to movie providers list</a>)</p>

### fetchPopular

```ts
multimovies.fetchPopular.then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of movies. (*[`Promise<ISearch<IMovieResult>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L328-L336)*)\
output:
```js
{
  currentPage: 1,
  hasNextPage: true,
  results: [
    {
      id: 'post-30719',
      title: 'Jawan',
      url: 'https://multimovies.lat/movies/jawan/',
      image: 'https://multimovies.lat/wp-content/uploads/2024/09/jFt1gS4BGHlK8xt76Y81Alp4dbt-185x278.jpg',
      type: 'Movie',
      rating: '6.9',
      releaseDate: 'Sep. 07, 2023'
    },
    {
      id: 'post-5231',
      title: 'Naruto (Hindi Dubbed)',
      url: 'https://multimovies.lat/tvshows/naruto-hindi-dubbed/',
      image: 'https://multimovies.lat/wp-content/uploads/2023/04/xppeysfvDKVx775MFuH8Z9BlpMk-185x278.jpg',
      type: 'TV Series',
      rating: '8.355',
      releaseDate: 'Oct. 03, 2002'
    },
    {...}
  ]
}
```


### fetchByGenre
  
  ```ts
  multimovies.fetchByGenre("action").then(data => {
    console.log(data);
  })
  ```

  returns a promise which resolves into an array of movies. (*[`Promise<ISearch<IMovieResult>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L328-L336)*)\
output:
```js

{
  currentPage: 1,
  hasNextPage: true,
  results: [
    {
      id: 'post-71528',
      title: 'Marco',
      url: 'https://multimovies.lat/movies/marco/',
      image: 'https://multimovies.lat/wp-content/uploads/2024/12/il3ao5gcF6fZNqo1o9o7lusmEyU-185x278.jpg',
      type: 'Movie',
      rating: '8.3',
      releaseDate: 'Dec. 20, 2024'
    },
    {
      id: 'post-70068',
      title: 'Pushpa 2 – The Rule',
      url: 'https://multimovies.lat/movies/pushpa-2-the-rule/',
      image: 'https://multimovies.lat/wp-content/uploads/2024/12/1T21FblunT0y8fz7YaW8JMYgUKm-185x278.jpg',
      type: 'Movie',
      rating: '6.6',
      releaseDate: 'Dec. 04, 2024'
    },
    {...}
  ]}
```