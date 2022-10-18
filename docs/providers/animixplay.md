<h1>AniMixPlay</h1>

```ts
const animixplay = new ANIME.AniMixPlay();
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

```ts
animixplay.search("Overlord IV").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of anime. (*[`Promise<ISearch<IAnimeResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L13-L26)*)\
output:
```js
{
  results: [
    {
      id: '/v1/overlord-iv',
      title: 'Overlord IV',
      url: 'https://animixplay.to/v1/overlord-iv'
    },
    {...}
    ...
  ]
}
```

### fetchAnimeInfo

<h4>Parameters</h4>

| Parameter      | Type      | Description                                                                                               |
| -------------- | --------- | --------------------------------------------------------------------------------------------------------- |
| id             | `string`  | takes anime id as a parameter. (*anime id can be found in the anime search results or anime info object*) |
| dub (optional) | `boolean` | if true, will return dubbed episodes. (default: false)                                                    |


```ts
animixplay.fetchAnimeInfo("/v1/overlord-iv").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an anime info object (including the episodes). (*[`Promise<IAnimeInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L28-L42)*)\
output:
```js
{
  id: '/v1/overlord-iv',
  title: 'Overlord IV',
  genres: [ 'Action', 'Fantasy', 'Supernatural', 'Isekai', 'Game' ],
  status: 'Ongoing',
  totalEpisodes: 3,
  episodes: [
    {
      id: 'MTg4NzY5',
      number: 1,
      url: 'https://goload.io/streaming.php?id=MTg4NzY5&title=Overlord+IV+Episode+1&typesub=SUB'
    },
    {
      id: 'MTg5MDU3',
      number: 2,
      url: 'https://goload.io/streaming.php?id=MTg5MDU3&title=Overlord+IV+Episode+2'
    },
    {...}
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
animixplay.fetchEpisodeSources("MTg4NzY5").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of episode sources. (*[`Promise<ISource>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L210-L214)*)\
output:
```js
{
  sources: [
    {
      url: 'https://wwwx20.gogocdn.stream/videos/hls/uY9jfhDqzNg-jpMfozKczw/1660027166/188769/ca09dc1ce88568467994ea8e756c4493/ep.1.1657688625.m3u8',
      isM3U8: true
    },
    {
      url: 'https://wwwx20.gogocdn.stream/videos/hls/uY9jfhDqzNg-jpMfozKczw/1660027166/188769/ca09dc1ce88568467994ea8e756c4493/ep.1.1657688625.m3u8',
      isM3U8: true
    }
  ]
}
```

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs/guides/anime.md#">back to anime providers list</a>)</p>
