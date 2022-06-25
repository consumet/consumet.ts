<h1>Gogoanime</h1>

```ts
const gogoanime = new ANIME.Gogoanime();
```

<h2>Methods</h2>

- [search](#search)
- [fetchAnimeInfo](#fetchanimeinfo)
- [fetchEpisodeSources](#fetchepisodesources)
- [fetchEpisodeServers](#fetchepisodeservers)

### search
> Note: This method is a subclass of the [`BaseParser`](https://github.com/consumet/extensions/blob/master/src/models/base-parser.ts) class. meaning it is available across most categories.

take a string as a parameter and return a list of anime. In this case, We're searching for `One Piece`

returns a promise which resolves into an array of anime. (*[`Promise<ISearch<IAnimeResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L13-L26)*)
```ts
gogoanime.search("One Piece").then(data => {
  console.log(data);
}
```
output:
```js
{
  currentPage: 1, // current page
  hasNextPage: true, // if there is a next page
  results: [
    {
      id: 'one-piece', // anime id
      title: 'One Piece',
      url: 'https://gogoanime.gg//category/one-piece', // anime url
      image: 'https://gogocdn.net/images/anime/One-piece.jpg',
      releaseDate: 'Released: 1999',
      subOrDub: 'sub'
    },
    {
      id: 'toriko-dub',
      title: 'Toriko (Dub)',
      url: 'https://gogoanime.gg//category/toriko-dub',
      image: 'https://gogocdn.net/cover/toriko-dub.png',
      releaseDate: 'Released: 2011',
      subOrDub: 'dub'
    },
    {...},
    ...
  ]
}
```

### fetchAnimeInfo
take an anime id or url as a parameter. (*anime id or url can be found in the anime search results*)

returns a promise which resolves into an anime info object (including the episodes). (*[`Promise<IAnimeInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L28-L42)*)
```ts
gogoanime.fetchAnimeInfo("one-piece").then(data => {
  console.log(data);
}
```
output:
```js
{
  id: 'one-piece',
  title: 'One Piece',
  url: 'https://gogoanime.gg/category/one-piece',
  genres: [
    'Action',
    'Adventure',
    '...'
  ],
  totalEpisodes: 1022,
  image: 'https://gogocdn.net/images/anime/One-piece.jpg',
  releaseDate: '1999',
  description: 'One Piece is a story about  Monkey D. Luffy, who wants to become a sea-robber. In a world mystical...',
  subOrDub: 'sub',
  type: 'TV Series',
  status: 'Ongoing',
  otherName: '',
  episodes: [
    {
      id: 'one-piece-episode-1022',
      number: 1022,
      url: 'https://gogoanime.gg//one-piece-episode-1022'
    },
    {
      id: 'one-piece-episode-1021',
      number: 1021,
      url: 'https://gogoanime.gg//one-piece-episode-1021'
    },
    {...},
    ...
  ]
}
```

### fetchEpisodeSources
take an episode id or url as a parameter. (*episode id can be found in the anime info object*)

returns an array of episode sources. (*[`Promise<{ headers: { [k: string]: string }; sources: IVideo[] }>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L59-L74)*)
```ts
gogoanime.fetchEpisodeSources("one-piece-episode-1022").then(data => {
  console.log(data);
}
```
output:
```js
{
  headers: {
    Referer: 'https://goload.pro/streaming.php?id=MTg4MTgx&title=One+Piece+Episode+1022&typesub=SUB'
  },
  sources: [
    {
      url: 'https://manifest.prod.boltdns.net/manifest/v1/hls/v4/clear/6310593120001/6b17f612-a8e1-4fac-82ca-384537746607/6s/master.m3u8?fastly_token=NjJiNTU3Y2ZfZjdkZTc0MDYxODAwYTJkNTEzMGNiOTZhYjllNTA4MGVhNGFmZDNkMzNmZTQ2ZDdhNjc2MWI0NDU1YmRjYjcwZA%3D%3D',
      isM3U8: true
    },
    {
      url: 'https://www07.gogocdn.stream/hls/0b594d900f47daabc194844092384914/ep.1022.1655606306.m3u8',
      isM3U8: true
    }
  ]
}
```

### fetchEpisodeServers
take an episode id or url as a parameter. (*episode id can be found in the anime info object*)

returns an array of episode servers. (*[`Promise<IEpisodeServer[]>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L54-L57)*)
```ts
gogoanime.fetchEpisodeServers("one-piece-episode-1022").then(data => {
  console.log(data);
}
```
output:
```js
[
  {
    name: 'Vidstreaming',
    url: 'https://goload.pro/streaming.php?id=MTg4MTgx&title=One+Piece+Episode+1022&typesub=SUB'
  },
  {
    name: 'Gogo server',
    url: 'https://goload.pro/embedplus?id=MTg4MTgx&token=Ii6QxAl2Y3IHtOerPM6n7Q&expires=1656041793'
  },
  { name: 'Streamsb', url: 'https://ssbstream.net/e/a7xk4se5f1w9' },
  {...},
   ...
]
```

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs/guides/anime.md#">back to anime providers list</a>)</p>