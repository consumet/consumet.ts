<h1>Anime Saturn</h1>

```ts
const animesaturn = new ANIME.AnimeSaturn();
```

<h2>Methods</h2>

- [search](#search)
- [fetchAnimeInfo](#fetchanimeinfo)
- [fetchEpisodeSources](#fetchepisodesources)
- [fetchEpisodeServers](#fetchepisodeservers)

### search
> Note: This method is a subclass of the [`BaseParser`](https://github.com/consumet/extensions/blob/master/src/models/base-parser.ts) class. meaning it is available across most categories.


<h4>Parameters</h4>

| Parameter | Type     | Description                                                              |
| --------- | -------- | ------------------------------------------------------------------------ |
| query     | `string` | query to search for. (*In this case, We're searching for `Kingdom`*) |

```ts
animesaturn.search("Kingdom").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of anime. (*[`Promise<ISearch<IAnimeResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L13-L26)*)\
output:
```js
{
    hasNextPage: false,
    results: [
        {
            id: 'Kingdom-a',
            title: 'Kingdom',
            image: 'https://cdn.animesaturn.cx/static/images/copertine/20523_1_1.png',
            url: 'https://www.animesaturn.cx/anime/Kingdom-a'
        },
        {
            id: 'Kingdom-2-a',
            title: 'Kingdom 2',
            image: 'https://cdn.animesaturn.cx/static/images/copertine/20856_1_1.png',
            url: 'https://www.animesaturn.cx/anime/Kingdom-2-a'
        },
        {
            id: 'Kingdom-6',
            title: 'Kingdom 6',
            image: 'https://cdn.animesaturn.cx/static/images/copertine/28254_1_1.png',
            url: 'https://www.animesaturn.cx/anime/Kingdom-6'
        }
    ]
}
```

### fetchAnimeInfo

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                                               |
| --------- | -------- | --------------------------------------------------------------------------------------------------------- |
| id        | `string` | takes anime id as a parameter. (*anime id can be found in the anime search results or anime info object*) |


```ts
animesaturn.fetchAnimeInfo("Kingdom-6").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an anime info object (including the episodes). (*[`Promise<IAnimeInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L28-L42)*)\
output:
```js
{
    id: 'Kingdom-6',
    title: 'Kingdom 6 Sub ITA',
    malID: '61517',
    alID: '190840',
    genres: [ 'Storico', 'Seinen', 'Militari', 'Azione' ],
    image: 'https://cdn.animesaturn.cx/static/images/locandine/ee88d3095027d9094a4b35adea43eb5a.png',
    description: '',
    episodes: [
        { number: 1, id: 'Kingdom-6-ep-1' },
        { number: 2, id: 'Kingdom-6-ep-2' },
        { number: 3, id: 'Kingdom-6-ep-3' },
        { number: 4, id: 'Kingdom-6-ep-4' },
        { number: 5, id: 'Kingdom-6-ep-5' },
        { number: 6, id: 'Kingdom-6-ep-6' }
    ]
}
```

### fetchEpisodeSources

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                           |
| --------- | -------- | ------------------------------------------------------------------------------------- |
| episodeId | `string` | takes episode id as a parameter. (*episode id can be found in the anime info object*) |


In this example, we're getting the sources for the 6th episode of Kingdom 6.
```ts
animesaturn.fetchEpisodeSources("Kingdom-6-ep-6").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an episode sources object with headers for video requests. (*[`Promise<ISource>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L210-L214)*)\
output:
```js
{
    headers: {
        "Referer": "https://www.animesaturn.cx/watch?file=df3KUkMh639oR",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0"
    },
    subtitles: [],
    sources: [
        {
            url: "https://srv22.hondana.streampeaker.org/DDL/ANIME/Kingdom6/Kingdom6_Ep_06_SUB_ITA.mp4",
            isM3U8: false,
            quality: "default"
        }
    ]
}
```

### fetchEpisodeServers

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                           |
| --------- | -------- | ------------------------------------------------------------------------------------- |
| episodeId | `string` | takes episode id as a parameter. (*episode id can be found in the anime info object*) |


In this example, we're getting the available servers for the 6th episode of Kingdom 6.
```ts
animesaturn.fetchEpisodeServers("Kingdom-6-ep-6").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of available episode servers. (*[`Promise<IEpisodeServer[]>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L115-L118)*)\
output:
```js
[
    {
        name: "Server 1",
        url: "https://www.animesaturn.cx/watch?file=df3KUkMh639oR"
    },
    {
        name: "Server 6", 
        url: "https://www.animesaturn.cx/watch?file=df3KUkMh639oR&server=5"
    },
    {
        name: "Player Alternativo",
        url: "https://www.animesaturn.cx/watch?file=df3KUkMh639oR&s=alt"
    }
]
```

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs/guides/anime.md#">back to anime providers list</a>)</p>
