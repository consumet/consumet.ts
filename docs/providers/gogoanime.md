<h1>Gogoanime</h1>

```ts
const gogoanime = new ANIME.Gogoanime();
```

<h2>Methods</h2>

- [search](#search)
- [fetchRecentEpisodes](#fetchrecentepisodes)
- [fetchPopular](#fetchpopular)
- [fetchGenreList](#fetchgenrelist)
- [fetchGenreInfo](#fetchgenreinfo)
- [fetchTopAiring](#fetchtopairing)
- [fetchAnimeList](#fetchanimelist)
- [fetchAnimeInfo](#fetchanimeinfo)
- [fetchEpisodeSources](#fetchepisodesources)
- [fetchEpisodeServers](#fetchepisodeservers)
- [fetchDirectDownloadLink](#fetchdirectdownloadlink)

### search
> Note: This method is a subclass of the [`BaseParser`](https://github.com/consumet/extensions/blob/master/src/models/base-parser.ts) class. meaning it is available across most categories.


<h4>Parameters</h4>

| Parameter       | Type     | Description                                                            |
| --------------- | -------- | ---------------------------------------------------------------------- |
| query           | `string` | query to search for. (*In this case, We're searching for `One Piece`*) |
| page (optional) | `number` | page number (default: 1)                                               |

```ts
gogoanime.search("One Piece").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of anime. (*[`Promise<ISearch<IAnimeResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L13-L26)*)\
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
      releaseDate: '1999',
      subOrDub: 'sub'
    },
    {
      id: 'toriko-dub',
      title: 'Toriko (Dub)',
      url: 'https://gogoanime.gg//category/toriko-dub',
      image: 'https://gogocdn.net/cover/toriko-dub.png',
      releaseDate: '2011',
      subOrDub: 'dub'
    },
    {...},
    ...
  ]
}
```

### fetchRecentEpisodes

<h4>Parameters</h4>

| Parameter       | Type     | Description                                                                                                                         |
| --------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| page (optional) | `number` | page number (default: 1)                                                                                                            |
| type (optional) | `string` | type of anime (default: `1`). `1`: Japanese with subtitles, `2`: english/dub with no subtitles, `3`: chinese with english subtitles |

```ts
gogoanime.fetchRecentEpisodes().then(data => {
  console.log(data);
})
```

output:
```js
{
  currentPage: 1, // current page
  hasNextPage: true, // if there is a next page
  results: [
    {
      id: 'hellsing',
      episodeId: 'hellsing-episode-13',
      episodeNumber: 13,
      title: 'Hellsing',
      image: 'https://gogocdn.net/images/anime/H/hellsing.jpg',
      url: 'https://gogoanime.gg//hellsing-episode-13'
    },
    {...}
    ...
  ]
}
```

### fetchPopular

return popular anime list.

<h4>Parameters</h4>

| Parameter       | Type     | Description              |
| --------------- | -------- | ------------------------ |
| page (optional) | `number` | page number (default: 1) |

```ts
gogoanime.fetchPopular().then(data => {
  console.log(data);
})
```

output:
```js
{
  currentPage: 1,
  hasNextPage: true,
  results: [
    {
      id: 'oshi-no-ko-2nd-season',
      title: '',
      releaseDate: '2024',
      image: 'https://gogocdn.net/cover/oshi-no-ko-2nd-season.png',
      url: 'https://anitaku.bz//category/oshi-no-ko-2nd-season'
    },
    {...}
    ...
  ]
}
```

### fetchGenreList

return list of genre in gogoanime and its corresponding genre id

```ts
gogoanime.fetchGenreList().then(data => {
  console.log(data);
})
```

output:
```js
[
  { id: 'action', title: 'Action' },
  {...},
  ...
]
```

### fetchGenreInfo

return anime list based on genre.

<h4>Parameters</h4>

| Parameter       | Type     | Description              |
| --------------- | -------- | ------------------------ |
| genre | `string` | genre id from fetchGenreList |
| page (optional) | `number` | page number (default: 1) |

```ts
gogoanime.fetchGenreInfo('action').then(data => {
  console.log(data);
})
```

output:
```js
{
  currentPage: 1,
  hasNextPage: true,
  results: [
    {
      id: 'kingdom-5th-season-chinese-name',
      title: 'Kingdom 5th Season (Chinese Name)',
      image: 'https://gogocdn.net/cover/kingdom-5th-season-chinese-name.png',
      released: '2025',
      url: 'https://anitaku.bz///category/kingdom-5th-season-chinese-name'
    },
    {...}
    ...
  ]
}
```

### fetchTopAiring

return top airing anime list.

<h4>Parameters</h4>

| Parameter       | Type     | Description              |
| --------------- | -------- | ------------------------ |
| page (optional) | `number` | page number (default: 1) |

```ts
gogoanime.fetchTopAiring().then(data => {
  console.log(data);
})
```

output:
```js
{
  currentPage: 1,
  hasNextPage: true,
  results: [
    {
      id: 'ore-dake-level-up-na-ken',
      title: 'Ore dake Level Up na Ken',
      image: 'https://gogocdn.net/cover/ore-dake-level-up-na-ken-1708917521.png',
      url: 'https://gogoanime3.co/category/ore-dake-level-up-na-ken',
      genres: [ 'Action', 'Adventure', 'Fantasy' ],
      episodeId: 'ore-dake-level-up-na-ken-episode-9',
      episodeNumber: 9
    }
    {...}
    ...
  ]
}
```

### fetchAnimeList

return gogo anime list.

<h4>Parameters</h4>

| Parameter       | Type     | Description              |
| --------------- | -------- | ------------------------ |
| page (optional) | `number` | page number (default: 1) |

```ts
gogoanime.fetchAnimeList().then(data => {
  console.log(data);
})
```

output:
```js
{
  currentPage: 1,
  hasNextPage: true,
  results: [
    {
      id: 'hackgu-returner',
      title: '.Hack//G.U. Returner',
      image: 'https://gogocdn.net/images/anime/5745.jpg',
      url: 'https://gogoanime3.co/category/hackgu-returner',
      genres: [ 'Adventure', 'Drama', 'Game', 'Harem', 'Martial Arts', 'Seinen' ],
      releaseDate: 'Released: 2007'
    }
    {...}
    ...
  ]
}
```

### fetchAnimeInfo

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                                        |
| --------- | -------- | -------------------------------------------------------------------------------------------------- |
| animeUrl  | `string` | takes anime url or id as a parameter. (*anime id or url can be found in the anime search results*) |

```ts
gogoanime.fetchAnimeInfo("one-piece").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an anime info object (including the episodes). (*[`Promise<IAnimeInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L28-L42)*)\
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

<h4>Parameters</h4>

| Parameter         | Type                                                                                                 | Description                                                                                                                                               |
| ----------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| episodeId         | `string`                                                                                             | takes episode id as a parameter. (*episode id can be found in the anime info object*)                                                                     |
| server (optional) | [`StreamingServers`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L76-L82) | takes server enum as a parameter. *default: [`StreamingServers.GogoCDN`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L76-L82)* |


```ts
gogoanime.fetchEpisodeSources("one-piece-episode-1022").then(data => {
  console.log(data);
})
```
returns a promise which resolves into an array of episode sources. (*[`Promise<ISource>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L210-L214)*)\
output:
```js
{
  headers: {
    Referer: 'https://s3taku.com/embedplus?id=MjI4Mzg0&token=ebbMjlakYIRbF9SnwN_2rA&expires=1722508079'
  },
  sources: [
    {
      url: 'https://www038.vipanicdn.net/streamhls/566ba3e573da6e2214d28058f348fd46/ep.4.1721934198.360.m3u8',
      isM3U8: true,
      quality: '360p'
    },
    {
      url: 'https://www038.vipanicdn.net/streamhls/566ba3e573da6e2214d28058f348fd46/ep.4.1721934198.480.m3u8',
      isM3U8: true,
      quality: '480p'
    },
    {
      url: 'https://www038.vipanicdn.net/streamhls/566ba3e573da6e2214d28058f348fd46/ep.4.1721934198.720.m3u8',
      isM3U8: true,
      quality: '720p'
    },
    {
      url: 'https://www038.vipanicdn.net/streamhls/566ba3e573da6e2214d28058f348fd46/ep.4.1721934198.1080.m3u8',
      isM3U8: true,
      quality: '1080p'
    },
    {
      url: 'https://www038.vipanicdn.net/streamhls/566ba3e573da6e2214d28058f348fd46/ep.4.1721934198.m3u8',
      isM3U8: true,
      quality: 'default'
    },
    {
      url: 'https://www038.anicdnstream.info/videos/hls/nCk9FsoqnNmN3l1m8bCdcg/1722515281/228384/566ba3e573da6e2214d28058f348fd46/ep.4.1721934198.m3u8',
      isM3U8: true,
      quality: 'backup'
    }
  ],
  download: 'https://s3taku.com/download?id=MjI4Mzg0&typesub=Gogoanime-SUB&title=Hazurewaku+no+%22Joutai+Ijou+Skill%22+de+Saikyou+ni+Natta+Ore+ga+Subete+wo+Juurin+suru+made+Episode+4'
}
```

### fetchEpisodeServers

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                                                   |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| episodeId | `string` | take an episode id or url as a parameter. (*episode id or episode url can be found in the anime info object*) |

```ts
gogoanime.fetchEpisodeServers("one-piece-episode-1022").then(data => {
  console.log(data);
})
```
returns a promise which resolves into an array of episode servers. (*[`Promise<IEpisodeServer[]>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L54-L57)*)\
output:
```js
[
  {
    name: 'Vidstreaming',
    url: 'https://s3taku.com/abpl1245?id=MjI4Mzg0&title=Hazurewaku+no+%22Joutai+Ijou+Skill%22+de+Saikyou+ni+Natta+Ore+ga+Subete+wo+Juurin+suru+made+Episode+4'
  },
  {
    name: 'Gogo server',
    url: 'https://s3taku.com/embedplus?id=MjI4Mzg0&token=mVz9w3TEpFrufILsiUq_Rw&expires=1722508210'
  },
  { name: 'Streamwish', url: 'https://awish.pro/e/tx8n3caofulp' },
  {
    name: 'Mp4Upload',
    url: 'https://www.mp4upload.com/embed-rnp7cpglaqjc.html'
  },
  { name: 'Doodstream', url: 'https://dood.wf/e/dfx1530xo3yr' },
  { name: 'Vidhide', url: 'https://alions.pro/e/clqkhvh1y0zm' }
]
```

### fetchDirectDownloadLink
Fetch direct download link of an episode from an episode's download link


<h4>Parameters</h4>

| Parameter         | Type                                                                                                 | Description                                                                                                                                               |
| ----------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| downloadUrl         | `string`                                                                                             | takes episode's download link url. (*can be found in the fetchEpisodeSources object*)                                                                     |
| captchaToken (optional) | [`string`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L76-L82) | takes gogoanime recaptcha token(can be get via scanning network tools on download link). *only for advanced users* |
```ts
gogoanime.fetchDirectDownloadLink("https://s3taku.com/download?id=MjI4Mzg0&typesub=Gogoanime-SUB&title=Hazurewaku+no+%22Joutai+Ijou+Skill%22+de+Saikyou+ni+Natta+Ore+ga+Subete+wo+Juurin+suru+made+Episode+4").then(data => {
  console.log(data);
})
```
output:
```js
[
  {
    source: 'Download\n                        (360P - mp4)',
    link: 'https://gredirect.info/download.php?url=aHR0cHM6LyURASDGHUSRFSJGYfdsffsderFStewthsfSFtrfteAdeqwrwedffryretgsdFrsftrsvfsfsrsdf9wd3l4aXltZWx1LmFuZjU5OC5jb20vdXNlcjEzNDIvMmZiY2U2YjEzYmQ5ZjBkYzk5N2ZjOTk1MWIwZTQzYzcvRVAuNC52MS4xNzIxOTMzNzA0LjM2MHAubXA0P3Rva2VuPTM5SDcxejF4ck41c1JjTU5mTkxtdkEmZXhwaXJlcz0xNzIyNTE1ODUwJmlkPTIyODM4NA=='
  },
  {
    source: 'Download\n                        (480P - mp4)',
    link: 'https://gredirect.info/download.php?url=aHR0cHM6LyAawehyfcghysfdsDGDYdgdsfsdfwstdgdsgtert9URASDGHUSRFSJGYfdsffsderFStewthsfSFtrftesdfwd3l4aXltZWx1LmFuZjU5OC5jb20vdXNlcjEzNDIvMmZiY2U2YjEzYmQ5ZjBkYzk5N2ZjOTk1MWIwZTQzYzcvRVAuNC52MS4xNzIxOTMzNzA0LjQ4MHAubXA0P3Rva2VuPWhfWFlmRGlGV0VQRDNWMWJtQTRQRUEmZXhwaXJlcz0xNzIyNTE1ODUwJmlkPTIyODM4NA=='
  },
  {
    source: 'Download\n                        (720P - mp4)',
    link: 'https://gredirect.info/download.php?url=aHR0cHM6LyAawehyfcghysfdsDGDYdgdsfsdfwstdgdsgtert9AdeqwrwedffryretgsdFrsftrsvfsfsrwd3l4aXltZWx1LmFuZjU5OC5jb20vdXNlcjEzNDIvMmZiY2U2YjEzYmQ5ZjBkYzk5N2ZjOTk1MWIwZTQzYzcvRVAuNC52MS4xNzIxOTMzNzA0LjcyMHAubXA0P3Rva2VuPTIwX0doYVQwRFZSWFRRMHFkR1FMQlEmZXhwaXJlcz0xNzIyNTE1ODUwJmlkPTIyODM4NA=='
  },
  {
    source: 'Download\n                        (1080P - mp4)',
    link: 'https://gredirect.info/download.php?url=aHR0cHM6LyAdrefsdsdfwerFrefdsfrersfdsrfer363435349AdeqwrwedffryretgsdFrsftrsvfsfsrwd3l4aXltZWx1LmFuZjU5OC5jb20vdXNlcjEzNDIvMmZiY2U2YjEzYmQ5ZjBkYzk5N2ZjOTk1MWIwZTQzYzcvRVAuNC52MS4xNzIxOTMzNzA0LjEwODBwLm1wND90b2tlbj1CamFfQjNCUlFCSkt2azhGS05HeEJnJmV4cGlyZXM9MTcyMjUxNTg1MCZpZD0yMjgzODQ='
  }
]
```

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs/guides/anime.md#">back to anime providers list</a>)</p>
