<h1>Zoro</h1>

```ts
const zoro = new ANIME.Zoro();
```

<h2>Methods</h2>

- [search](#search)
- [fetchAnimeInfo](#fetchanimeinfo)
- [fetchEpisodeSources](#fetchepisodesources)
- [fetchRecentEpisodes](#fetchrecentepisodes)

### fetchRecentEpisodes
> Note: This method is a subclass of the [`BaseParser`](https://github.com/consumet/extensions/blob/master/src/models/base-parser.ts) class. meaning it is available across most categories.


<h4>Parameters</h4>

| Parameter | Type     | Description                                                              |
| --------- | -------- | ------------------------------------------------------------------------ |
| page (optional) | `number` | page number (default 1) |

```ts
zoro.fetchRecentEpisodes().then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of anime. (*[`Promise<ISearch<IAnimeResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L13-L26)*)\
output:
```js
{
  currentPage: 1,
  hasNextPage: false,
  results: [ 
    {
      id: 'when-will-ayumu-make-his-move-17444',
      image: 'https://img.zorores.com/_r/300x400/100/ae/f2/aef2fb998beeb3bbb56f2ba93d8d5d11/aef2fb998beeb3bbb56f2ba93d8d5d11.jpg',
      title: 'When Will Ayumu Make His Move?',
      url: 'https://zoro.to/when-will-ayumu-make-his-move-17444',
      episodeNumber: 5
    },
    {
      id: 'when-will-ayumu-make-his-move-17444',
      image: 'https://img.zorores.com/_r/300x400/100/ae/f2/aef2fb998beeb3bbb56f2ba93d8d5d11/aef2fb998beeb3bbb56f2ba93d8d5d11.jpg',
      title: 'When Will Ayumu Make His Move?',
      url: 'https://zoro.to/when-will-ayumu-make-his-move-17444',
      episodeNumber: 5
    },
    {...}
    ...
  ]
}
```

### search
> Note: This method is a subclass of the [`BaseParser`](https://github.com/consumet/extensions/blob/master/src/models/base-parser.ts) class. meaning it is available across most categories.


<h4>Parameters</h4>

| Parameter | Type     | Description                                                              |
| --------- | -------- | ------------------------------------------------------------------------ |
| query     | `string` | query to search for. (*In this case, We're searching for `Overlord IV`*) |

```ts
zoro.search("Overlord IV").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of anime. (*[`Promise<ISearch<IAnimeResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L13-L26)*)\
output:
```js
{
  currentPage: 1,
  hasNextPage: false,
  results: [    // zoro.to Searching seems a little strange, and I have nothing to do with it. Ask them why it's so horrible.
    {
      id: 'overlord-ple-ple-pleiades-3543',
      title: 'Overlord: Ple Ple Pleiades',
      type: 'Special',
      image: 'https://img.zorores.com/_r/300x400/100/ae/75/ae756952b89f86eb13279babe6d0f85b/ae756952b89f86eb13279babe6d0f85b.jpg',
      url: 'https://zoro.to/overlord-ple-ple-pleiades-3543?ref=search'
    },
    {
      id: 'overlord-movie-1-the-undead-king-1190',
      title: 'Overlord Movie 1: The Undead King',
      type: 'Movie',
      image: 'https://img.zorores.com/_r/300x400/100/d8/80/d88084810d68914ea90cdf060c590a29/d88084810d68914ea90cdf060c590a29.jpg',
      url: 'https://zoro.to/overlord-movie-1-the-undead-king-1190?ref=search'
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
| id        | `string` | takes anime id as a parameter. (*anime id can be found in the anime search results or anime info object*) |


```ts
zoro.fetchAnimeInfo("overlord-iv-18075").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an anime info object (including the episodes and optionally MAL and Anilist ID ). (*[`Promise<IAnimeInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L28-L42)*)\
output:
```js
{
  id: 'overlord-iv-18075',
  title: 'Overlord IV',
  malID: 48895,
  alID: 133844,
  image: 'https://img.zorores.com/_r/300x400/100/ef/1d/ef1d1028cf6c177587805651b78282a6/ef1d1028cf6c177587805651b78282a6.jpg',
  description: 'Fourth season of Overlord',
  type: 'TV',
  url: 'https://zoro.to/overlord-iv-18075',
  totalEpisodes: 3,
  episodes: [
    {
      id: 'overlord-iv-18075$episode$92599',
      number: 1,
      title: 'Sorcerous Nation of Ainz Ooal Gown',
      isFiller: false,
      url: 'https://zoro.to/watch/overlord-iv-18075?ep=92599'
    },
    {
      id: 'overlord-iv-18075$episode$92769',
      number: 2,
      title: 'Re-Estize Kingdom',
      isFiller: false,
      url: 'https://zoro.to/watch/overlord-iv-18075?ep=92769'
    },
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
zoro.fetchEpisodeSources("overlord-iv-18075$episode$92599").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of episode sources. (*[`Promise<ISource>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L210-L214)*)\
output:
```js
{
  headers: { Referer: 'https://rapid-cloud.ru/embed-6/hMN2fYuGi1E2?z=' },
  intro: {
    start: 0,
    end: 100
  }
  sources: [
    {
      url: 'https://c-an-ca3.betterstream.cc:2223/v2-hls-playback/584bca0a36f1cfe0153bc80d79d62f9171c193441d424b2804000153234bb744f6eb7197bd91842408660ab8516c67f5ad565acd0d18e9b565c6abf2b5c0e55879ca70bef239d78711bf0845ddb6005baf5a5e957a17efc7bb6f1b4f3a87fb3723cfc56a1330960ec99ce338d86d49211bc6e8c2830d50842034ed99335c654529d2b0ca1e19045357a6b01876ae12ea313473387cb8c5272b37c7ba8a2bbc3b185c0cc72517ee0237ce673914ac3e54/index-f1-v1-a1.m3u8',
      quality: '1080p',
      isM3U8: true
    },
    {
      url: 'https://c-an-ca3.betterstream.cc:2223/v2-hls-playback/584bca0a36f1cfe0153bc80d79d62f9171c193441d424b2804000153234bb744f6eb7197bd91842408660ab8516c67f5ad565acd0d18e9b565c6abf2b5c0e55879ca70bef239d78711bf0845ddb6005baf5a5e957a17efc7bb6f1b4f3a87fb3723cfc56a1330960ec99ce338d86d49211bc6e8c2830d50842034ed99335c654529d2b0ca1e19045357a6b01876ae12ea313473387cb8c5272b37c7ba8a2bbc3b185c0cc72517ee0237ce673914ac3e54/index-f2-v1-a1.m3u8',
      quality: '720p',
      isM3U8: true
    },
    {
      url: 'https://c-an-ca3.betterstream.cc:2223/v2-hls-playback/584bca0a36f1cfe0153bc80d79d62f9171c193441d424b2804000153234bb744f6eb7197bd91842408660ab8516c67f5ad565acd0d18e9b565c6abf2b5c0e55879ca70bef239d78711bf0845ddb6005baf5a5e957a17efc7bb6f1b4f3a87fb3723cfc56a1330960ec99ce338d86d49211bc6e8c2830d50842034ed99335c654529d2b0ca1e19045357a6b01876ae12ea313473387cb8c5272b37c7ba8a2bbc3b185c0cc72517ee0237ce673914ac3e54/index-f3-v1-a1.m3u8',
      quality: '360p',
      isM3U8: true
    }
  ],
  subtitles: [
    {
      url: 'https://cc.zorores.com/5f/b4/5fb4481163961694ef0dc661a1bf51d7/eng-2.vtt',
      lang: 'English'
    },
    {
      url: 'https://cc.zorores.com/5f/b4/5fb4481163961694ef0dc661a1bf51d7/por-3.vtt',
      lang: 'Portuguese - Portuguese(Brazil)'
    },
    {
      url: 'https://cc.zorores.com/5f/b4/5fb4481163961694ef0dc661a1bf51d7/rus-5.vtt',
      lang: 'Russian'
    },
    {
      url: 'https://cc.zorores.com/5f/b4/5fb4481163961694ef0dc661a1bf51d7/spa-4.vtt',
      lang: 'Spanish - Spanish(Latin_America)'
    },
    {
      url: 'https://preview.zorores.com/53/531eb74affebbec2613a6ba0883754f3/thumbnails/sprite.vtt',
      lang: 'Default (maybe)'
    }
  ]
}
```

Make sure to check the `headers` property of the returned object. It contains the referer header, which might be needed to bypass the 403 error and allow you to stream the video without any issues.

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs/guides/anime.md#">back to anime providers list</a>)</p>
