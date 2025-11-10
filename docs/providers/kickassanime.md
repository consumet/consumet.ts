<h1>KickAssAnime</h1>

```ts
const kickass = new ANIME.KickAssAnime();
```

<h2>Methods</h2>

- [search](#search)
- [fetchAnimeInfo](#fetchanimeinfo)
- [fetchEpisodeServers](#fetchepisodeservers)
- [fetchEpisodeSources](#fetchepisodesources)

### search
> Note: This method is a subclass of the [`BaseParser`](https://github.com/consumet/extensions/blob/master/src/models/base-parser.ts) class. meaning it is available across most categories.

<h4>Parameters</h4>

| Parameter | Type     | Description                                                              |
| --------- | -------- | ------------------------------------------------------------------------ |
| query     | `string` | query to search for. (*In this case, We're searching for `Naruto`*) |
| page (optional) | `number` | page number (default: 1) |

```ts
kickass.search("Naruto").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of anime. (*[`Promise<ISearch<IAnimeResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L13-L26)*)\
output:
```js
{
  currentPage: 1,
  hasNextPage: true,
  totalPages: 5,
  results: [
    {
      id: 'naruto-f3cf',
      title: 'Naruto',
      url: 'https://kickass-anime.ru/anime/naruto-f3cf',
      image: 'https://kickass-anime.ru/image/642602049d33f3e83241a544/poster-hq.jpeg',
      type: 'TV',
      releaseDate: '2002',
      subOrDub: 'dub'
    },
    {
      id: 'naruto-shippuden-e9cb',
      title: 'Naruto: Shippuden',
      url: 'https://kickass-anime.ru/anime/naruto-shippuden-e9cb',
      image: 'https://kickass-anime.ru/image/642602049d33f3e83241a545/poster-hq.jpeg',
      type: 'TV',
      releaseDate: '2007',
      subOrDub: 'dub'
    },
    {...}
    ...
  ]
}
```

### fetchAnimeInfo

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                                               |
| --------- | -------- | --------------------------------------------------------------------------------------------------------- |
| id        | `string` | takes anime slug as a parameter. (*anime id can be found in the anime search results or anime info object*) |

```ts
kickass.fetchAnimeInfo("naruto-f3cf").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an anime info object (including the episodes). (*[`Promise<IAnimeInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L28-L42)*)\
output:
```js
{
  id: 'naruto-f3cf',
  title: 'Naruto',
  url: 'https://kickass-anime.ru/anime/naruto-f3cf',
  image: 'https://kickass-anime.ru/image/642602049d33f3e83241a544/poster-hq.jpeg',
  cover: 'https://kickass-anime.ru/image/642602049d33f3e83241a544/banner-hq.jpeg',
  description: 'Naruto Uzumaki, a mischievous adolescent ninja, struggles as he searches for recognition and dreams of becoming the Hokage, the village\'s leader and strongest ninja.',
  type: 'TV',
  status: 'Completed',
  subOrDub: 'dub',
  otherName: 'ナルト',
  releaseDate: '2002',
  episodes: [
    {
      id: 'https://kickass-anime.ru/api/show/naruto-f3cf/episode/ep-1-12cd96',
      title: 'Enter: Naruto Uzumaki!',
      number: 1,
      image: 'https://kickass-anime.ru/image/642602049d33f3e83241a544/ep-1-12cd96-hq.jpeg',
      url: 'https://kickass-anime.ru/api/show/naruto-f3cf/episode/ep-1-12cd96'
    },
    {
      id: 'https://kickass-anime.ru/api/show/naruto-f3cf/episode/ep-2-a4b7e1',
      title: 'My Name is Konohamaru!',
      number: 2,
      image: 'https://kickass-anime.ru/image/642602049d33f3e83241a544/ep-2-a4b7e1-hq.jpeg',
      url: 'https://kickass-anime.ru/api/show/naruto-f3cf/episode/ep-2-a4b7e1'
    },
    {...}
    ...
  ]
}
```

### fetchEpisodeServers

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                           |
| --------- | -------- | ------------------------------------------------------------------------------------- |
| episodeId | `string` | takes episode path as a parameter. (*e.g., 'naruto-f3cf/episode/ep-1-12cd96'*) |

```ts
kickass.fetchEpisodeServers("naruto-f3cf/episode/ep-1-12cd96").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of episode servers. (*[`Promise<IEpisodeServer[]>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L115-L118)*)\
output:
```js
[
  {
    name: 'VidStreaming',
    url: 'https://krussdomi.com/cat-player/player?id=64d7164244c6d04c12f3fdbb&source=vidstream&ln=ja-JP'
  },
  {
    name: 'BirdStream',
    url: 'https://krussdomi.com/cat-player/player?id=NmY0ODdlMDBmMDRmYWFmYmFiYjliMGUyZjc3OTJmZGQ6ZDcyZDJiYmUwMDI0ZGU4M2EwMDkyOTgzNjAxYThiMGQ&type=dash'
  }
]
```

### fetchEpisodeSources

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                           |
| --------- | -------- | ------------------------------------------------------------------------------------- |
| episodeId | `string` | takes episode path as a parameter. (*e.g., 'naruto-f3cf/episode/ep-1-12cd96'*) |
| server (optional) | `string` | takes server name as a parameter. (*e.g., StreamingServers.VidStreaming, StreamingServers.BirdStream*) |

In this example, we're getting the sources for the first episode of Naruto.
```ts
kickass.fetchEpisodeSources("naruto-f3cf/episode/ep-1-12cd96").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an episode sources object. (*[`Promise<ISource>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L210-L214)*)\
output:
```js
{
  headers: {
    'Referer': 'https://kickass-anime.ru/api/show/naruto-f3cf/episode/ep-1-12cd96',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0'
  },
  sources: [
    {
      url: 'https://hls.krussdomi.com/manifest/64d7164244c6d04c12f3fdbb/master.m3u8',
      quality: '1080p',
      isM3U8: true
    },
    {
      url: 'https://bl.krussdomi.com/mpd/10117811/master.mpd',
      quality: '1080p',
      isM3U8: true
    }
  ],
  subtitles: [
    {
      url: 'https://st1.advancedairesearchlab.xyz/64d7164244c6d04c12f3fdbb/64d7164360dd2f323483b973.vtt',
      lang: 'English'
    },
    {
      url: 'https://krussdomi.com/pinky-assets/subtitles/0e245a90_ms.vtt',
      lang: 'Bahasa Melayu'
    },
    {
      url: 'https://krussdomi.com/pinky-assets/subtitles/0e245a90_id.vtt',
      lang: 'Bahasa Indonesia'
    },
    {
      url: 'https://krussdomi.com/pinky-assets/subtitles/0e245a90_vi.vtt',
      lang: 'Tiếng Việt'
    },
    {
      url: 'https://krussdomi.com/pinky-assets/subtitles/0e245a90_th.vtt',
      lang: 'ภaษาไทย'
    },
    {
      url: 'https://krussdomi.com/pinky-assets/subtitles/0e245a90_en.vtt',
      lang: 'English'
    }
  ]
}
```

#### Filtering by Server

You can also filter sources by a specific server:

```ts
// Get only VidStreaming sources
kickass.fetchEpisodeSources("naruto-f3cf/episode/ep-1-12cd96", StreamingServers.VidStreaming).then(data => {
  console.log(data);
})

// Get only BirdStream sources  
kickass.fetchEpisodeSources("naruto-f3cf/episode/ep-1-12cd96", StreamingServers.BirdStream).then(data => {
  console.log(data);
})
```

Make sure to check the `headers` property of the returned object. It contains the referer header, which might be needed to bypass the 403 error and allow you to stream the video without any issues.

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs/guides/anime.md#">back to anime providers list</a>)</p>
